import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service'; 
import { VonNeumanController } from './controladores/von-neuman.controller';
import { CongFundService } from './servicios/cong-fund.service'; 
import { VonNeumanService } from './servicios/von-neuman.service';
import { CongFundController } from './controladores/cong-fund.controller';
import { NumGenController } from './controladores/num-gen.controller';
import { NumGenService } from './servicios/num-gen.service';
import { ExistenciasService } from './servicios/existencias.service';
import { ExistenciasController } from './controladores/existencias.controller';  

@Module({
  imports: [],
  controllers: [
    AppController, 
    VonNeumanController, 
    CongFundController, 
    NumGenController, 
    ExistenciasController
  ],
  providers: [
    AppService, 
    VonNeumanService, 
    CongFundService, 
    NumGenService, 
    ExistenciasService, 
  ],
})
export class AppModule {}
