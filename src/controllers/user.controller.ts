import { JsonController, Post, Body, Put } from "routing-controllers";
import bcrypt = require('bcrypt');
import { getManager } from "typeorm";
import { User } from "../persistence/entity/user.entity";
import { BroadcasterResult } from "typeorm/subscriber/BroadcasterResult";


@JsonController()
export class UserController {
    repository: any;
    constructor() {
        this.repository = getManager().getRepository(User);
    }

    @Put('/create')
    async createUser(@Body() request: any) {
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
    async getOne(@Body() request: any) {
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
            userToFind.roles=['ADMIN'];
            return {
                success: true,
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