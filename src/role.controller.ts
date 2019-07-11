import { Response } from './common.response';
import { getCustomRepository, getManager, getRepository } from "typeorm";
import { Body, ContentType, Controller, Get, Param, Post, Put, Params, Delete } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { IsString, IsNumber } from "class-validator";
import { RoleRepository } from './persistence/repository/role.repository';
import { type } from 'os';
import {Role} from './persistence/entity/role.entity';

@OpenAPI({
    summary: 'Roles management',
})
@Controller("/roles")
export class RoleController {
    private repository: RoleRepository;

    constructor() {
        this.repository = getCustomRepository(RoleRepository);
    }

    @Put('/create')
    @ContentType("application/json")
    @OpenAPI({ summary: 'Create a role' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200',
    })
    public async createRole(@Body({type: String}) request: {name: string}): Promise<Response> {
        try {
            const createdRole: Role = await this.repository.createRole(request.name);
            return {
                id: createdRole.id,
                message: "Role Created!",
                success: true,
            }
        } catch (error) {
            return {
                message: error,
                success: false,
            }
        }
    }

    @Get("/")
    @ContentType("application/json")
    @OpenAPI({ summary: 'Get all roles' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200',
    })
    public async get(): Promise<Response>{
        try{
            const allRoles: Role[] = await this.repository.getAllRoles();
            return {
                data: {
                    roles: allRoles,
                    count: allRoles.length,
                },
                message: 'All roles',
                success: true,
            }
        }
        catch(error){
            return{
                message: error,
                success: false,
            }
        }
    }

    @Get("/getbyid/:id")
    @ContentType("application/json")
    @OpenAPI({ summary: 'Get a roles by id' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200',
    })
    public async getById(@Param("id") id: number): Promise<Response>{
        try{
            
            const role = await this.repository.getFromIds([id])
            return {
                data: role,
                message: 'Role',
                success: true,
            }
        }
        catch(error){
            return{
                message: error,
                success: false,
            }
        }
    }

    @Delete("/:id")
    @ContentType("application/json")
    @OpenAPI({ summary: 'Delete a roles by id' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200',
    })
    public async deleteById(@Param("id") id: number): Promise<Response>{
        try{
            const role = await this.repository.delete(id);
            return {
                id: id,
                message: 'Role deleted!',
                success: true,
            }
        }
        catch(error){
            return{
                message: error,
                success: false,
            }
        }
    }

}
