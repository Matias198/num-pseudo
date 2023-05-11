import { Injectable } from '@nestjs/common';
import { VonNeuman } from 'src/entity/VonNeuman';
import { AppDataSource } from '../main';
import { Mensaje } from 'src/entity/Mensaje'; 

@Injectable()
export class VonNeumanService {
  vnRepository = AppDataSource.getRepository(VonNeuman);

  findAll() {
    return this.vnRepository.find();
  }

  findById(id) {
    return this.vnRepository.findOneBy({
      id: id,
    });
  }

  crearSerie(parametros): any {
    let x = parametros.semilla;
    let repeticiones = parametros.repeticiones;
    let resultados = [];
    let mensaje = new Mensaje();
    if (parseInt(repeticiones) > 0) {
      for (let i = 0; i < repeticiones; i++) {
        x = x * x;
        if (parseInt(x) < 1000) {
          let valor = true;
          while (valor) {
            x = x * x;
            if (x > 1000 || x <= 1) {
              valor = false;
            }
          }
        }
        x = x.toString().padStart(8, '0').substr(2, 4);
        if (x[0] == '0' && x[1] == '0') {
          x = '13' + x.toString().substr(2, 2);
        }
        if (x[2] == '0' && x[3] == '0') {
          x = x.toString().substr(0, 2) + '13';
        }
        resultados.push(x);
      }
      mensaje.codigo = 0;
      mensaje.mensaje = resultados.toString();
      return mensaje;
    } else {
      mensaje.codigo = -1;
      mensaje.mensaje = 'Error creando la secuencia';
      return mensaje;
    }
  }
  
  guardarSerie(parametros) {
    const vn = new VonNeuman();
    vn.secuencia = parametros.secuencia.toString();
    vn.semilla = parametros.semilla;
    vn.repeticiones = parametros.repeticiones;
    return this.vnRepository.save(vn);
  }

  borrarSerie(id) {
    return this.vnRepository.delete(id);
  }
}
