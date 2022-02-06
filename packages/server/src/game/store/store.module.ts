import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { WarehouseModule } from './warehouse/warehouse.module';
import { CartModule } from './cart/cart.module';
import { StoreController } from './store.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoty } from './entities/category.entity';
import { Product } from './entities/product.entity';

@Module({
  providers: [StoreService],
  imports: [TypeOrmModule.forFeature([Categoty, Product]), WarehouseModule, CartModule],
  exports: [StoreService],
  controllers: [StoreController],
})
export class StoreModule {}
