import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Online } from 'src/game/servers/online/entities/online.entity';
import { OnlineModule } from 'src/game/servers/online/online.module';
import { PaymentModule } from 'src/payment/payment.module';
import { StoreModule } from 'src/game/store/store.module';
import { User } from '../users/entities/user.entity';
import { Product } from 'src/game/store/entities/product.entity';
import { Categoty } from 'src/game/store/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Online, User, Product, Categoty]),
    OnlineModule, PaymentModule, StoreModule
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
