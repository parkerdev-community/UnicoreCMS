import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Online } from 'src/game/servers/online/entities/online.entity';
import { OnlineService } from 'src/game/servers/online/online.service';
import { Repository } from 'typeorm';
import * as _ from 'lodash'
import { PaymentService } from 'src/payment/payment.service';
import { StatsInterface } from './interfaces/stats.inteface';
import { StoreService } from 'src/game/store/store.service';
import { Categoty } from 'src/game/store/entities/category.entity';
import { Product } from 'src/game/store/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor (
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Categoty)
    private categoriesRepository: Repository<Categoty>,
    @InjectRepository(Online)
    private onlineRepository: Repository<Online>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async stats() {

    return 
  }
}
