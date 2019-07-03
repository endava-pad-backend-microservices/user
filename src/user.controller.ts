import { Body, ContentType, Controller, Post, Put, Get } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { getManager } from "typeorm";
import { User } from "./persistence/entity/user.entity";
import bcrypt = require('bcrypt');
import { CreateUserBody } from './create.user.request';
import { LoginRequest } from './login.request';
import { Response } from './common.response';
import { GetAllUserRequest } from './get.users.request';


@OpenAPI({
    summary: 'Users management',
})
@Controller()
export class UserController {
    private repository: any;
    private PASSWORD_HASH_SIZE: number = +process.env["BCRYPT_HASH"];
    constructor() {
        this.repository = getManager().getRepository(User);
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
            const savedUser = await this.repository.save(newUser);
            return {
                success: true,
                id: savedUser.id,
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
        const userToFind = await this.repository.createQueryBuilder('user')
            .select(['user.id', 'user.firstName', 'user.lastName', 'user.email', 'user.password'])
            .where('user.name = :name ', { name: request.username })
            .getOne();

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
            email: '%'
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



        // Create a Paginated query to return all the users
        const allUsers: [User] = await this.repository
            .createQueryBuilder('user')
            .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
            .skip(request.offset)
            .take(request.limit)
            .where('user.email like :email and user.firstName like :firstName and user.lastName like :lastName', filter)
            .getMany();

            // Count how many records match
            const userSize: any = await this.repository
              .createQueryBuilder('user')
              .select('COUNT(user.id)', 'count')
              .where('user.email like :email and user.firstName like :firstName and user.lastName like :lastName', filter)
              .getRawOne();
        
            return {
              success: true,
              message: 'All users',
              data: {
                  users: allUsers,
                  count: userSize.count
              }
            };    

    }


}
