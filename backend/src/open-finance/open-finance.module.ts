import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { OpenFinanceController } from './open-finance.controller';
import { OpenFinanceService } from './open-finance.service';
import { OpenFinanceAccessService } from './open-finance-access.service';
import { OpenFinanceAccessGuard } from './open-finance-access.guard';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [OpenFinanceController],
  providers: [
    OpenFinanceService,
    OpenFinanceAccessService,
    OpenFinanceAccessGuard,
  ],
  exports: [OpenFinanceService],
})
export class OpenFinanceModule {}