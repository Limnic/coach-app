import { Module } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CheckInsController } from './check-ins.controller';

@Module({
  providers: [CheckInsService],
  controllers: [CheckInsController],
  exports: [CheckInsService],
})
export class CheckInsModule {}

