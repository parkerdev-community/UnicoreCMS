import faker from '@faker-js/faker';
import { Connection } from 'typeorm';
import { Seeder } from 'typeorm-seeding';
import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';
import { User } from 'src/admin/users/entities/user.entity';
import { envConfig } from 'unicore-common';

export default class CreateUsers implements Seeder {
  public async run(factory: any, connection: Connection): Promise<any> {
    if (envConfig.devseed) {
      const users = await Promise.all(
        _.range(250).map(async () => ({
          email: faker.internet.email(),
          username: faker.internet.userName(),
          password: await bcrypt.hash(faker.internet.password(), 10),
          activated: faker.datatype.boolean(),
        })),
      );

      await connection.createQueryBuilder().insert().into(User).values(users).execute();
    }
  }
}
