import { Body, ContentType, Controller, Post, Put, Get, Patch, Param } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { getCustomRepository, getManager } from "typeorm";
import { UserRepository } from "./persistence/repository/user.repository";


import bcrypt = require('bcrypt');
import { CreateUserBody } from './create.user.request';
import { LoginRequest } from './login.request';
import { Response } from './common.response';
import { GetAllUserRequest } from './get.users.request';
import { UpdateUserRequest } from './update.user.request';
import { HashUser } from './persistence/entity/hash.user.entity';
import { RabbitMq } from "./Service/RabbitService"
import { User } from 'persistence/entity/user.entity';



@OpenAPI({
    summary: 'Users management',
})
@Controller()
export class UserController {
    private repository: any;
    private PASSWORD_HASH_SIZE: number = +process.env["BCRYPT_HASH"];
    constructor() {
        this.repository = getCustomRepository(UserRepository);

    }

    @Put('/create')
    @ContentType("application/json")
    @OpenAPI({ summary: 'Create an user' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200',
    })
    public async createUser(@Body({ type: CreateUserBody }) request: CreateUserBody): Promise<Response> {
        const newUser = {
            ...request,
            password: bcrypt.hashSync(request.password, this.PASSWORD_HASH_SIZE),
        }

        try {
            const hashuser = {
                key: (bcrypt.hashSync(Date.toString() + newUser.name, this.PASSWORD_HASH_SIZE)).replace(".", "").replace("\/", "").replace("&", ""),
                user: newUser,
                creationDate: new Date()
            }
            var userId = 0;
            await getManager().transaction(async transactionalEntityManager => {
                const savedUser: any = await transactionalEntityManager.getRepository(User).save(newUser);
                hashuser.user = savedUser;
                userId = savedUser.id;
                await transactionalEntityManager.getRepository(HashUser).save(hashuser);
            });
            try {
                new RabbitMq("user_created", JSON.stringify({ "destination": [newUser.email], "user_name": newUser.name, "key": hashuser.key }));
            } catch (error) {
                console.log(error);
            }
            return {
                success: true,
                id: userId,
                message: 'User Created',
            }
        } catch (error) {
            return {
                success: false,
                message: error,
            }
        }
    }


    @Post('/getOne')
    @ContentType("application/json")
    @OpenAPI({ summary: 'Find user by name and password' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200',
    })
    public async getOne(@Body({ type: LoginRequest }) request: LoginRequest): Promise<Response> {
        const userToFind: any = await this.repository.findByUserName(request.username);

        if (!userToFind) {
            return {
                success: false,
                message: 'Invalid user or password',
            }
        }

        if (bcrypt.compareSync(request.password, userToFind.password)) {
            delete userToFind.password;
            userToFind.roles = ['ADMIN'];
            return {
                success: true,
                message: 'Login success',
                data: userToFind,
            };
        } else {
            return {
                success: false,
                message: 'Invalid user or password',
            }
        }

    }

    @Get('/')
    @ContentType("application/json")
    @OpenAPI({ summary: 'Find all users' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200',
    })
    public async getAllUsers(@Body({ type: GetAllUserRequest }) request: GetAllUserRequest): Promise<Response> {

        const filter = {
            firstName: '%',
            lastName: '%',
            email: '%',
            limit: request.limit,
            offset: request.offset,
        };

        // Change filter values if we have them in the request
        // TODO:: must find a way to improve this
        if (request.firstName) {
            filter.firstName = '%' + request.firstName + '%';
        }
        if (request.lastName) {
            filter.lastName = '%' + request.lastName + '%';
        }

        if (request.email) {
            filter.email = '%' + request.email + '%';
        }



        return this.repository.getAllUsers(filter);
    }

    @Post('/update')
    @ContentType("application/json")
    @OpenAPI({ summary: 'Update an user' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200',
    })
    public async updateUser(@Body({ type: UpdateUserRequest }) request: UpdateUserRequest): Promise<Response> {
        const user = await this.repository.createQueryBuilder('user')
            .where('user.id = :id ', { id: request.id })
            .getOne();

        if (!user) {
            return {
                success: false,
                message: 'User not found',
            }
        }
        user.firstName = request.firstName;
        user.lastName = request.lastName;
        try {
            const user_updated = await this.repository.save(user);
            return {
                success: true,
                id: user_updated.id,
                message: 'User Updated',
            }
        } catch (error) {
            return {
                success: false,
                message: error,
            }
        }
    }

    @Get('/enable/:key')
    @ContentType("application/json")
    @OpenAPI({ summary: 'Enable an user' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200',
    })
    public async enableUser(@Param("key") key: string): Promise<Response> {
        try {
            const hashUserRepo = getManager().getRepository(HashUser);
            const user_hash: any = await hashUserRepo.createQueryBuilder('hashuser')
                .innerJoinAndSelect("hashuser.user", "user")
                .where("hashuser.useDate is null and hashuser.creationDate + (:validationTime||' hour')::interval >= current_timestamp(0) and hashuser.key = :key ",
                    { validationTime: process.env["HASH_EXPIRE_TIME"], key: key })
                .getOne();
            if (!user_hash) {
                return {
                    success: false,
                    message: "The user can not be enabled!",
                }
            }
            user_hash.user.enabled = true;
            user_hash.useDate = new Date();
            await getManager().transaction(async transactionalEntityManager => {
                const savedUser: any = await transactionalEntityManager.getRepository(User).save(user_hash.user);
                await transactionalEntityManager.getRepository(HashUser).save(user_hash);
            });
            return {
                success: true,
                id: user_hash.user.id,
                message: 'User Enabled',
            }
        } catch (error) {
            return {
                success: false,
                message: error,
            }
        }
    }

    @Get('/disable/:id')
    @ContentType("application/json")
    @OpenAPI({ summary: 'Disable an user' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200',
    })
    public async disableUser(@Param('id') id: number): Promise<Response> {
        const user = {
            id: id,
            enabled: false,
        }
        try {
            const user_disabled = await this.repository.save(user);
            return {
                success: true,
                id: user_disabled.id,
                message: 'User Disabled',
            }
        } catch (error) {
            return {
                success: false,
                message: error,
            }
        }
    }
}
