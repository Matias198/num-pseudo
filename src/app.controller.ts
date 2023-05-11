import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('app-controller')
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Post('/comprobar/chi-cuadrado')
  comprobarChiCuadrado(@Body() body){ 
     return this.appService.comprobarChiCuadrado(body)
  }

  @Post('/comprobar/monobits')
  comprobarMonobits(@Body() body){ 
     return this.appService.comprobarMonobits(body)
  }

  
}
