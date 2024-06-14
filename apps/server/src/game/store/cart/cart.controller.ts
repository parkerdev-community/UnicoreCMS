import { IpAddress } from '@common';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Permissions } from 'src/admin/roles/decorators/permission.decorator';
import { User } from 'src/admin/users/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Permission } from 'unicore-common';
import { PayloadType } from '../dto/paginated-store.dto';
import { CartService } from './cart.service';
import { CartBuyInput } from './dto/cart-buy.input';
import { CartInput } from './dto/cart.input.dto';
import { GiveKitInput } from './dto/give-kit.input';
import { GiveProductInput } from './dto/give-product.input';

@Controller('store/cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get(':server')
  findByServer(@CurrentUser() user: User, @Param('server') id: string) {
    return this.cartService.findByServer(user, id);
  }

  @Post('add')
  add(@CurrentUser() user: User, @Body() body: CartInput) {
    return this.cartService.add(user, body);
  }

  @Post('buy')
  buy(@CurrentUser() user: User, @IpAddress() ip: string, @Body() body: CartBuyInput) {
    return this.cartService.buy(user, ip, body);
  }

  @Delete('server/:id')
  clearOwn(@CurrentUser() user: User, @Param('id') id: string) {
    return this.cartService.clearOwn(user, id);
  }

  @Delete('item/:type/:id')
  removeOwn(@CurrentUser() user: User, @Param('type') type: PayloadType, @Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeOwn(user, type, id);
  }

  @Permissions([Permission.AdminDashboard, Permission.AdminUsersUpdate])
  @Delete('admin/user/:uuid')
  clear(@Param('uuid') user_uuid: string) {
    return this.cartService.clear(user_uuid);
  }

  @Permissions([Permission.AdminDashboard, Permission.AdminUsersUpdate])
  @Delete('admin/item/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cartService.remove(id);
  }

  @Permissions([Permission.AdminDashboard, Permission.AdminUsersUpdate])
  @Post('admin/give/product')
  giveProduct(@Body() body: GiveProductInput) {
    return this.cartService.giveProductByDTO(body);
  }

  @Permissions([Permission.AdminDashboard, Permission.AdminUsersUpdate])
  @Post('admin/give/kit')
  giveKit(@Body() body: GiveKitInput) {
    return this.cartService.giveKitByDTO(body);
  }
}
