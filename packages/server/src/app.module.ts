import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envConfig } from 'zirconia-common';
import { NamingStrategy } from '@common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { GameModule } from './game/game.module';
import { PaymentModule } from './payment/payment.module';
import {
  GoogleRecaptchaModule,
  GoogleRecaptchaNetwork,
} from '@nestlab/google-recaptcha';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: envConfig.databaseType as any,
      host: envConfig.databaseHost,
      port: envConfig.databasePort,
      username: envConfig.databaseUser,
      password: envConfig.databasePassword,
      database: envConfig.databaseName,
      entities: ['./**/*.entity.js'],
      namingStrategy: new NamingStrategy(),
      synchronize: true,
    }),
    GoogleRecaptchaModule.forRoot({
      secretKey: envConfig.recaptchaSecret,
      response: (req) => req.headers.recaptcha,
      // skipIf: process.env.NODE_ENV !== 'production',
      network: GoogleRecaptchaNetwork.Recaptcha,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    AdminModule,
    GameModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
