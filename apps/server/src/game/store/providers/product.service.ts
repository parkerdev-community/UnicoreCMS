import { StorageManager } from '@common';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MulterFile } from 'fastify-file-interceptor';
import * as JSZip from 'jszip';
import * as _ from 'lodash';
import { FilterOperator, paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { currencyUtils, SystemCurrency } from 'src/common/utils/currencyUtils';
import { Server } from 'src/game/servers/entities/server.entity';
import { In, Repository } from 'typeorm';
import { KitProtectedDto, PaginatedStoreDto, PayloadType } from '../dto/paginated-store.dto';
import { ProductFromGameInput } from '../dto/product-fromgame.dto';
import { ProductsManyInput } from '../dto/product-many.input';
import { ProductInput } from '../dto/product.dto';
import { ProductsImportInput } from '../dto/products-import.input';
import { Category } from '../entities/category.entity';
import { Kit } from '../entities/kit.entity';
import { Product } from '../entities/product.entity';
import { GiveMethod } from '../enums/give-method.enum';

export interface ProductMap {
  name: string;
  icon?: string;
  description?: string;
  nbt?: string;
  price: number;
  sale?: number;
  give_method: GiveMethod;
  item_id?: string;
  commands?: string[];
}

export type StoreServer = Server & {
  categories_count?: number;
  products_count?: number;
  categories?: Category[];
  min_price?: number;
  max_price?: number;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Server)
    private serversRepository: Repository<Server>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Kit)
    private kitsRepository: Repository<Kit>,
  ) { }

  async find(query: PaginateQuery): Promise<Paginated<Product>> {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.servers', 'servers')
      .leftJoinAndSelect('product.categories', 'categories');

    if (query?.filter?.servers && !Array.isArray(query.filter.servers)) query.filter.servers = query.filter.servers.split(',');

    if (query?.filter?.categories && !Array.isArray(query.filter.categories)) query.filter.categories = query.filter.categories.split(',');

    if (query.filter?.servers && query.filter?.categories) {
      queryBuilder.andWhere('servers.id IN(:...servers) AND categories.id IN(:...categories)', {
        servers: query.filter.servers,
        categories: query.filter.categories,
      });
    } else if (query.filter?.servers) {
      queryBuilder.andWhere('servers.id IN(:...ids)', { ids: query.filter.servers });
    } else if (query.filter?.categories) {
      queryBuilder.andWhere('categories.id IN(:...ids)', { ids: query.filter.categories });
    }

    const ids = (await queryBuilder.getMany()).map((product) => product.id);

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.servers', 'servers')
      .leftJoinAndSelect('product.categories', 'categories')
      .where({
        id: In(ids),
      });

    return paginate(query, qb, {
      sortableColumns: ['id', 'name', 'price', 'sale'],
      searchableColumns: ['id', 'name', 'item_id', 'price', 'sale'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {
        price: [FilterOperator.BTW],
        sale: [FilterOperator.BTW],
      },
      maxLimit: 500,
    });
  }

  async store(query: PaginateQuery): Promise<PaginatedStoreDto> {
    const queryBuilderProducts = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.servers', 'servers')
      .leftJoinAndSelect('product.categories', 'categories');

    const queryBuilderKits = this.kitsRepository
      .createQueryBuilder('kit')
      .leftJoinAndSelect('kit.servers', 'servers')
      .leftJoinAndSelect('kit.categories', 'categories');

    if (query?.filter?.categories && !Array.isArray(query.filter.categories)) query.filter.categories = query.filter.categories.split(',');

    if (query.filter?.server && query.filter?.categories) {
      queryBuilderProducts.andWhere('servers.id = :server AND categories.id IN(:...categories)', {
        server: query.filter.server,
        categories: (query.filter.categories as string[]).filter((val) => val),
      });
      queryBuilderKits.andWhere('servers.id = :server AND categories.id IN(:...categories)', {
        server: query.filter.server,
        categories: (query.filter.categories as string[]).filter((val) => val),
      });
    } else if (query.filter?.server) {
      queryBuilderProducts.andWhere('servers.id = :server', { server: query.filter.server });
      queryBuilderKits.andWhere('servers.id = :server', { server: query.filter.server });
    }

    const idsProducts = (await queryBuilderProducts.getMany()).map((product) => product.id);
    const idsKits = (await queryBuilderProducts.getMany()).map((kit) => kit.id);

    const qbProducts = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where({
        id: In(idsProducts),
      });

    const qbKits = this.kitsRepository
      .createQueryBuilder('kit')
      .leftJoinAndSelect('kit.categories', 'categories')
      .where({
        id: In(idsKits),
      });

    const productsPaginated = await paginate(query, qbProducts, {
      sortableColumns: ['id', 'name', 'price'],
      searchableColumns: ['id', 'name'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {
        price: [FilterOperator.BTW],
      },
      maxLimit: 20,
    });

    const kitsPaginated = await paginate(query, qbKits, {
      sortableColumns: ['id', 'name', 'price'],
      searchableColumns: ['id', 'name'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {
        price: [FilterOperator.BTW],
      },
      maxLimit: 20,
    });

    const combine = [
      ...kitsPaginated.data.map((payload) => ({ type: PayloadType.Kit, payload })),
      ...productsPaginated.data.map((payload) => ({ type: PayloadType.Product, payload })),
    ];

    return new PaginatedStoreDto({
      ...(productsPaginated as any),
      data: combine,
      meta: {
        ...productsPaginated.meta,
        totalItems: productsPaginated.meta.totalItems + kitsPaginated.meta.totalItems,
      },
    });
  }

  async kit(id: number) {
    const kit = await this.kitsRepository.findOne(id, { relations: ['categories', 'items'] });

    if (!kit) throw new NotFoundException();

    return new KitProtectedDto(kit);
  }

  findOne(id: number, relations?: string[]) {
    return this.productsRepository.findOne(id, { relations });
  }

  async servers(): Promise<StoreServer[]> {
    const servers = await Promise.all(
      (
        await this.serversRepository.find()
      ).map(async (serv: StoreServer) => {
        serv.products_count = await this.productsRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.servers', 'servers')
          .where('servers.id = :id', { id: serv.id })
          .getCount() + await this.kitsRepository
            .createQueryBuilder('kit')
            .leftJoinAndSelect('kit.servers', 'servers')
            .where('servers.id = :id', { id: serv.id })
            .getCount();

        serv.categories_count = _(
          (
            [
              await this.productsRepository
                .createQueryBuilder('product')
                .leftJoinAndSelect('product.servers', 'servers')
                .leftJoinAndSelect('product.categories', 'categories')
                .where('servers.id = :id', { id: serv.id })
                .getMany(),
              await this.kitsRepository
                .createQueryBuilder('kit')
                .leftJoinAndSelect('kit.servers', 'servers')
                .leftJoinAndSelect('kit.categories', 'categories')
                .where('servers.id = :id', { id: serv.id })
                .getMany(),
            ].flat()
          )
            .map((prod) => prod.categories)
            .flat(),
        )
          .uniqBy((cat) => cat.id)
          .value().length;

        return serv;
      }),
    );

    return servers;
  }

  async server(id: string): Promise<StoreServer> {
    const server: StoreServer = await this.serversRepository.findOne(id);

    if (!server) throw new NotFoundException();

    server.categories = _(
      (
        await this.productsRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.servers', 'servers')
          .leftJoinAndSelect('product.categories', 'categories')
          .where('servers.id = :id', { id: server.id })
          .getMany()
      )
        .map((prod) => prod.categories)
        .flat(),
    )
      .uniqBy((cat) => cat.id)
      .map(cat => ({
        ...cat, priority: cat.priority ? cat.priority : 0
      }) as Category)
      .orderBy(["priority", "name"], ["desc", "asc"])
      .value();

    server.min_price = (await this.productsRepository.findOne({ order: { price: 'ASC' } }))?.price || 0;
    server.max_price = (await this.productsRepository.findOne({ order: { price: 'DESC' } }))?.price || 0;

    return server;
  }

  async createFromGame(input: ProductFromGameInput) {
    const product = new Product();

    product.give_method = GiveMethod.UnicoreConnect
    product.name = input.name;
    product.price = currencyUtils.roundByType(input.price, SystemCurrency.REAL);
    product.item_id = input.id;
    product.nbt = input.nbt;

    product.servers = await this.serversRepository.find({
      id: input.server,
    });

    return this.productsRepository.save(product);
  }

  async create(input: ProductInput) {
    const product = new Product();

    product.name = input.name;
    product.description = input.description;
    product.price = currencyUtils.roundByType(input.price, SystemCurrency.REAL);
    product.sale = input.sale;
    product.give_method = input.give_method
    product.virtual_percent = input.virtual_percent
    product.multiple_of = input.multiple_of

    if (product.give_method == GiveMethod.UnicoreConnect) {
      product.item_id = input.item_id;
      product.nbt = input.nbt;
    } else {
      product.commands = input.commands
    }

    product.servers = await this.serversRepository.find({
      id: In(input.servers),
    });

    product.categories = await this.categoriesRepository.find({
      id: In(input.categories),
    });

    return this.productsRepository.save(product);
  }

  async update(id: number, input: ProductInput) {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException();
    }

    product.name = input.name;
    product.description = input.description;
    product.price = currencyUtils.roundByType(input.price, SystemCurrency.REAL);
    product.sale = input.sale;
    product.give_method = input.give_method
    product.virtual_percent = input.virtual_percent
    product.multiple_of = input.multiple_of

    if (product.give_method == GiveMethod.UnicoreConnect) {
      product.item_id = input.item_id;
      product.nbt = input.nbt;
      product.commands = null
    } else {
      product.commands = input.commands
      product.item_id = null;
      product.nbt = null;
    }

    product.servers = await this.serversRepository.find({
      id: In(input.servers),
    });

    product.categories = await this.categoriesRepository.find({
      id: In(input.categories),
    });

    return this.productsRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException();
    }

    return this.productsRepository.remove(product);
  }

  async removeMany(ids: number[]) {
    const products = await this.productsRepository.find({
      where: {
        id: In(ids),
      },
    });

    return this.productsRepository.remove(products);
  }

  async exportItems(ids: number[]) {
    const products = await this.productsRepository.find({
      where: {
        id: In(ids),
      },
    });
    const zip = new JSZip();
    const storage = zip.folder('storage');

    const mapping: ProductMap[] = products.map((product) => {
      if (product.icon) {
        const iconBuffer = StorageManager.read(product.icon);

        if (iconBuffer) storage.file(product.icon, iconBuffer, { base64: true });
      }

      return {
        name: product.name,
        icon: product.icon,
        description: product.description,
        give_method: product.give_method,
        nbt: product.nbt,
        price: currencyUtils.roundByType(product.price, SystemCurrency.REAL),
        sale: product.sale,
        item_id: product.item_id,
        commands: product.commands,
      };
    });

    zip.file('content.json', JSON.stringify(mapping));
    return zip.generateAsync({ type: 'base64' });
  }

  async importItems(input: ProductsImportInput, filename: string, remove_tmp: boolean = true) {
    const fileBuffer = StorageManager.read(filename);
    if (remove_tmp) StorageManager.remove(filename);
    const zipTree = await JSZip.loadAsync(fileBuffer);
    const content = await zipTree.file('content.json').async('string');

    let servers: Server[] = [];
    let categories: Category[] = [];

    if (input.servers) servers = await this.serversRepository.find({ where: { id: In(input.servers.split(',')) } });

    if (input.categories)
      categories = await this.categoriesRepository.find({ where: { id: In(input.categories.split(',').map((i) => Number(i))) } });

    if (!content) throw new BadRequestException();

    const mapping: ProductMap[] = JSON.parse(content);
    const products: Product[] = [];

    await Promise.all(
      mapping.map(async (product, index) => {
        const entity = new Product();

        entity.name = product.name;
        entity.description = product.description;
        entity.nbt = product.nbt;
        entity.price = currencyUtils.roundByType(product.price, SystemCurrency.REAL);
        entity.sale = product.sale;
        entity.give_method = product.give_method;
        entity.item_id = product.item_id;
        entity.commands = product.commands;
        entity.servers = servers;
        entity.categories = categories;

        if (product.icon) {
          const iconBuff = await zipTree.file('storage/' + product.icon).async('nodebuffer');
          if (iconBuff) entity.icon = StorageManager.save(product.icon, iconBuff);
        }

        products.push(entity);
      }),
    );

    return this.productsRepository.save(products);
  }

  async updateMany(input: ProductsManyInput) {
    const products = await this.productsRepository.find({
      where: {
        id: In(input.products.map((entity) => entity.id)),
      },
      relations: ['servers', 'categories'],
    });
    let servers_: Server[] = [];
    let categories_: Category[] = [];

    const productsEdited = await Promise.all(
      products.map(async (product) => {
        var { sale, price, servers, categories } = input.products.find((entity) => entity.id === product.id);

        if (sale) product.sale = sale;

        if (sale === 0) product.sale = null;

        if (price) product.price = currencyUtils.roundByType(price, SystemCurrency.REAL);

        if (servers_.length) product.servers = servers_;
        else if (servers && servers.length) product.servers = await this.serversRepository.find({ where: { id: In(servers) } });

        if (categories_.length) product.categories = categories_;
        else if (categories && categories.length)
          product.categories = await this.categoriesRepository.find({ where: { id: In(categories) } });

        return product;
      }),
    );

    return this.productsRepository.save(productsEdited);
  }

  async updateIcon(id: number, file: MulterFile) {
    const product = await this.findOne(id);

    if (!product) {
      StorageManager.remove(file.filename);
      throw new NotFoundException();
    }

    StorageManager.remove(product.icon);
    product.icon = file.filename;

    return this.productsRepository.save(product);
  }

  async removeIcon(id: number) {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException();
    }

    StorageManager.remove(product.icon);
    product.icon = null;

    return this.productsRepository.save(product);
  }
}
