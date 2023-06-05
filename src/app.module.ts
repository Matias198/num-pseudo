import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service'; 
import { VonNeumanController } from './controladores/von-neuman.controller';
import { CongFundService } from './servicios/cong-fund.service'; 
import { VonNeumanService } from './servicios/von-neuman.service';
import { CongFundController } from './controladores/cong-fund.controller';
import { NumGenController } from './controladores/num-gen.controller';
import { NumGenService } from './servicios/num-gen.service';

@Module({
  imports: [],
  controllers: [AppController, VonNeumanController, CongFundController, NumGenController],
  providers: [AppService, VonNeumanService, CongFundService, NumGenService],
})
export class AppModule {}
