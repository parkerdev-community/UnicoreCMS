import { Module } from '@nestjs/common';
import { FreekassaModule } from './methods/freekassa/freekassa.module';
import { QiwiModule } from './methods/qiwi/qiwi.module';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), FreekassaModule, QiwiModule],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
