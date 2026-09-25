import { Module } from '@nestjs/common';
import { financesController } from './finances.controller';
import { financesService } from './finances.service';

@Module({
  controllers: [financesController],
  providers: [financesService],
})
export class financeModule {}