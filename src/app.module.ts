import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VonNeumanService } from './von-neuman/von-neuman.service';
import { VonNeumanController } from './von-neuman/von-neuman.controller';
import { CongFundService } from './cong-fund/cong-fund.service';
import { CongFundController } from './cong-fund/cong-fund.controller';

@Module({
  imports: [],
  controllers: [AppController, VonNeumanController, CongFundController],
  providers: [AppService, VonNeumanService, CongFundService],
})
export class AppModule {}
