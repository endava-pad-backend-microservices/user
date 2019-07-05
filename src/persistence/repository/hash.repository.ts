import { EntityRepository, Repository } from "typeorm";
import { HashUser } from '../entity/hash.user.entity';

@EntityRepository(HashUser)
export class HashRepository extends Repository<HashUser> {

    public async getHashedUser(key: string): Promise<HashUser> {
        const user_hash: HashUser = await this.createQueryBuilder('hashuser')
            .innerJoinAndSelect("hashuser.user", "user")
            .where("hashuser.useDate is null and hashuser.creationDate + (:validationTime||' hour')::interval >= current_timestamp(0) and hashuser.key = :key ",
                { validationTime: process.env["HASH_EXPIRE_TIME"], key: key })
            .getOne();
        return user_hash;
    }
}
