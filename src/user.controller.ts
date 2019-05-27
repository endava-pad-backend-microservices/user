import { Body, ContentType, Controller, Post, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { getManager } from "typeorm";
import { User } from "./persistence/entity/user.entity";
import bcrypt = require('bcrypt');
import { CreateUserBody } from './create.user.request';
import { LoginRequest } from './login.request';
import { Response } from './common.response';


@OpenAPI({
    summary: 'Users management'
})
@Controller()
export class UserController {
    repository: any;
    constructor() {
        this.repository = getManager().getRepository(User);
    }

    @Put('/create')
    @ContentType("application/json")
    @OpenAPI({ summary: 'Create an user' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200'
    })
    async createUser(@Body({ type: CreateUserBody }) request: CreateUserBody): Promise<Response> {
        const newUser = {
            ...request,
            password: bcrypt.hashSync(request.password, 10)
        }

        try {
            const savedUser = await this.repository.save(newUser);
            return {
                success: true,
                id: savedUser.id,
                message: 'User Created'
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    }

    @Post('/getOne')
    @ContentType("application/json")
    @OpenAPI({ summary: 'Find user by name and password' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200'
    })
    async getOne(@Body({ type: LoginRequest }) request: LoginRequest): Promise<Response> {
        const userToFind = await this.repository.createQueryBuilder('user')
            .select(['user.id', 'user.firstName', 'user.lastName', 'user.email', 'user.password'])
            .where('user.name = :name ', { name: request.username })
            .getOne();

        if (!userToFind) {
            return {
                success: false,
                message: 'Invalid user or password'
            }
        }

        if (bcrypt.compareSync(request.password, userToFind.password)) {
            delete userToFind.password;
            userToFind.roles = ['ADMIN'];
            return {
                success: true,
                message: 'Login success',
                data: userToFind
            };
        } else {
            return {
                success: false,
                message: 'Invalid user or password'
            }
        }

    }


}