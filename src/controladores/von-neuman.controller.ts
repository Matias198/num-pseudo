import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { VonNeumanService } from 'src/servicios/von-neuman.service';

@Controller('von-neuman')
export class VonNeumanController {
     constructor(private vnService:VonNeumanService){

     }
     @Get('/') 
     findAll(){
        return this.vnService.findAll();
     }

     @Get(':id') 
     findById(@Param('id') id:number){
        return this.vnService.findById(id);
     }

     @Post('/crear')
     crearSerie(@Body() body){ 
        return this.vnService.crearSerie(body)
     } 
     
     @Post('/guardar')
     guardarSerie(@Body() body){ 
        return this.vnService.guardarSerie(body)
     }

     @Delete('/borrar/:id')
     borrarSerie(@Param('id') id:any){
        return this.vnService.borrarSerie(id);
     }
}
