import { EntityRepository, Repository } from "typeorm";
import { User } from '../entity/user.entity'
import { Response } from '../../common.response';
import { UpdateUserRequest } from "update.user.request";
import { Body } from "routing-controllers";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    public findByUserName(username: string): Promise<User> {
        return this.findOne({ username: username });
    }

    public async getAllUsers(filter: any): Promise<Response> {
        // Create a Paginated query to return all the users
        const allUsers: User[] = await this
            .createQueryBuilder('user')
            .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
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
