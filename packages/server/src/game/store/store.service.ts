import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoty } from './entities/category.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class StoreService {
  constructor (
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Categoty)
    private categoriesRepository: Repository<Categoty>
  ) {}
}
