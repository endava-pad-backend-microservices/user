import { EntityRepository, Repository } from "typeorm";
import { Response } from '../../common.response';
import { User } from '../entity/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    public findByUserName(username: string): Promise<User> {
        return this.findOne({ name: username });
    }

    public findById(id: number): Promise<User> {
        return this.findOne({ id: id });
    }

    public async getAllUsers(filter: any){
        // Create a Paginated query to return all the users
        const allUsers: User[] = await this
            .createQueryBuilder('user')
            .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
            .leftJoinAndSelect("user.roles","role")
            .skip(filter.offset)
            .take(filter.limit)
            .where('user.email like :email and user.firstName like :firstName and user.lastName like :lastName', filter)
            .getMany();

        // Count how many records match
        const userSize: any = await this
            .createQueryBuilder('user')
            .select('COUNT(user.id)', 'count')
            .where('user.email like :email and user.firstName like :firstName and user.lastName like :lastName', filter)
            .getRawOne();

        return {
            success: true,
            message: 'All users',
            data: {
                users: allUsers,
                count: userSize.count,
            },
        }

    }

}
