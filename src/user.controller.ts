import { Body, ContentType, Controller, Post, Put, Get } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { getCustomRepository } from "typeorm";
import { UserRepository } from "./persistence/repository/user.repository";


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


}
