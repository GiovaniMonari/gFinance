import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { OpenFinanceController } from './open-finance.controller';
import { OpenFinanceService } from './open-finance.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [OpenFinanceController],
  providers: [OpenFinanceService],
  exports: [OpenFinanceService],
})
export class OpenFinanceModule {}