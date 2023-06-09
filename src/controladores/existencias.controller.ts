import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { Existencias } from 'src/entidades/Existencias';
import { ExistenciasService } from 'src/servicios/existencias.service'; 

/*
Request GET -> 'http://localhost:4200/existencias/1'

http://localhost:4200 (angular) HTTP POST -> 'http://localhost:3000/existencias/1'
*/


@Controller('existencias')
export class ExistenciasController {
  constructor(private existenciaService: ExistenciasService) {}

  @Get('/')
  findAll():Promise<Existencias[]> {
    return this.existenciaService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: number):Promise<Existencias> {
    return this.existenciaService.findById(id);
  }

  @Post('/listar')
  findCant(@Body() body) {
    return this.existenciaService.findCant(body);
  }

  @Post('/crear')
  crearExistencia(@Body() body) {
    return this.existenciaService.crearExistencia(body);
  } 

  @Delete('/borrar/:id')
  borrarExistencia(@Param('id') id: any) {
    return this.existenciaService.borrarExistencia(id);
  }
}
