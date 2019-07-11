import { EntityRepository, Repository } from "typeorm";
import {Role} from '../entity/role.entity';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {

    public async getAllRoles(): Promise<Role[]> {
        return await this.createQueryBuilder('role')
            .select()
            .getMany();
    }

    public async getCount(): Promise<number>{
        return await this
        .createQueryBuilder('role')
        .select('COUNT(role.id)', 'count')
        .getRawOne();
    }

    public async createRole(role: any): Promise<Role> {
        const createdRole: Role = await this.save(role);
        return createdRole;
    }

    public async getFromIds(idRoles: Array<number>): Promise<Role[]>{ 
        return await this.createQueryBuilder()
        .select()
        .whereInIds(idRoles)
        .getMany();
    }      
}
