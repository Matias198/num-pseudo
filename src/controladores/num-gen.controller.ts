import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { NumGenService } from 'src/servicios/num-gen.service';

@Controller('num-gen')
export class NumGenController {
  constructor(private numgenService: NumGenService) {}
  @Get('/')
  findAll() {
    return this.numgenService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: number) {
    return this.numgenService.findById(id);
  }

  @Post('/listar')
  findCant(@Body() body) {
    return this.numgenService.findCant(body);
  }

  @Post('/crear-von-neuman')
  crearSerieVonNeuman(@Body() body) {
    return this.numgenService.crearSerieVonNeuman(body);
  }

  @Post('/crear-congruencias')
  crearSerieCongruencias(@Body() body) {
    return this.numgenService.crearSerieCongruencias(body);
  }

  @Delete('/borrar/:id')
  borrarSerie(@Param('id') id: any) {
    return this.numgenService.borrarSerie(id);
  }
}
