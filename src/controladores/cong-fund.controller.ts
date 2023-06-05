import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CongFundService } from '../servicios/cong-fund.service';

@Controller('cong-fund')
export class CongFundController {
  constructor(private cfService: CongFundService) {}
  @Get('/')
  findAll() {
    return this.cfService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: number) {
    return this.cfService.findById(id);
  }

  @Post('/crear')
  crearSerie(@Body() body) {
    return this.cfService.crearSerie(body);
  }

  @Post('/guardar')
  guardarSerie(@Body() body) {
    return this.cfService.guardarSerie(body);
  }

  @Delete('/borrar/:id')
  borrarSerie(@Param('id') id: any) {
    return this.cfService.borrarSerie(id);
  }
}
