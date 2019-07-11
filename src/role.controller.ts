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
    constructor() {
        this.repository = getCustomRepository(RoleRepository);
    }
    repository: RoleRepository;

    @Put('/create')
    @ContentType("application/json")
    @OpenAPI({ summary: 'Create a role' })
    @ResponseSchema(Response, {
        contentType: 'application/json',
        statusCode: '200',
    })
    public async createRole(@Body({type: String}) request: {name:string}): Promise<Response> {
        try {
            const createdRole : any = await this.repository.createRole(request);
            return {
                success: true,
                id: createdRole.id,
                message: "Role Created!"
            }
        } catch (error) {
            return {
                success: false,
                message: error,
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
    public async get():Promise<Response>{
        try{
            const allRoles : Role[] = await this.repository.getAllRoles();
            return {success: true,
                message: 'All roles',
                data: {
                    roles: allRoles,
                    count: allRoles.length,
                },
            }
        }
        catch(error){
            return{
                success: false,
                message: error,
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
    public async getById(@Param("id") id:number) :Promise<Response>{
        try{
            
            const role = await this.repository.getFromIds([id])
            return {success: true,
                message: 'Role',
                data: role,
            }
        }
        catch(error){
            return{
                success: false,
                message: error,
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
    public async deleteById(@Param("id") id:number) :Promise<Response>{
        try{
            
            const role = await this.repository.delete(id);
            return {success: true,
                message: 'Role deleted!',
                id: id,
            }
        }
        catch(error){
            return{
                success: false,
                message: error,
            }
        }
    }

}
