import { Injectable } from '@nestjs/common'; 
import { CongruenciaFundamental } from 'src/entidades/CongruenciaFundamental';
import { Mensaje } from 'src/dto/Mensaje';
import { AppDataSource } from 'src/main';

@Injectable()
export class CongFundService {
  cfRepository = AppDataSource.getRepository(CongruenciaFundamental);

  findAll() {
    return this.cfRepository.find();
  }

  findById(id) {
    return this.cfRepository.findOneBy({
        id: id,
    })
  }

  crearSerie(parametros): any {
    let vi = parametros.vi
    let vik = parametros.vik
    let a = parametros.a
    let c = parametros.c
    let k = parametros.k
    let m = parametros.m
    let n = parametros.n

    // Inicializar la secuencia con los valores iniciales
    var secuencia = [vi, vik];
    
    // Generar n números pseudoaleatorios adicionales
    for (var i = 2; i < n; i++) {
        var vii = ((a * secuencia[i - 1]) + (c * secuencia[i - 1 - k])) % m;
        secuencia.push(vii.toFixed(4));
    } 
    
    let mensaje = new Mensaje()
    mensaje.codigo = 0,
    mensaje.mensaje = secuencia;
   /*
    Array.from(secuencia.toString().split(',')).forEach(e => {
      mensaje.mensaje += e
    });*/
    return mensaje;    
  }

  guardarSerie(parametros) {
    const cf = new CongruenciaFundamental();
    let mensaje = JSON.parse(JSON.stringify(this.crearSerie(parametros)));
    cf.secuencia = mensaje.mensaje;
    cf.vi = parametros.vi;
    cf.vik = parametros.vik;
    cf.a = parametros.a;
    cf.c = parametros.c;
    cf.k = parametros.k;
    cf.m = parametros.m;
    cf.repeticiones = parametros.repeticiones;
    return this.cfRepository.save(cf);
  }


  borrarSerie(id) { 
    return this.cfRepository.delete(id);
  }
}
