import { Injectable } from '@nestjs/common';
import { Existencias } from 'src/entidades/Existencias';
import { AppDataSource } from 'src/main';
import * as jstat from 'jstat';
import { NumGenService } from './num-gen.service';
import { Mensaje } from 'src/dto/Mensaje';   

@Injectable()
export class ExistenciasService {
  exRepository = AppDataSource.getRepository(Existencias);

  constructor(private ngService: NumGenService ) {}

  findAll(): Promise<Existencias[]> {
    return this.exRepository.find();
  }

  findById(id: any): Promise<Existencias> {
    return this.exRepository.findOne(id);
  }

  async findCant(parametros: any): Promise<Existencias[]> {
    const pagina = parametros.pagina || 1;
    const tPagina = parametros.tPagina || 10;
    return this.exRepository.find().then((listaCompleta: any[]) => {
      const count = listaCompleta.length;
      const startIndex = (pagina - 1) * tPagina;
      const endIndex = startIndex + tPagina;
      let resp: any;
      if (endIndex >= count) {
        resp = JSON.parse(
          JSON.stringify(listaCompleta.slice(startIndex, count)),
        );
      } else {
        resp = JSON.parse(
          JSON.stringify(listaCompleta.slice(startIndex, endIndex)),
        );
      }
      console.log(resp);
      return resp;
    });
  }

  async crearExistencia(parametros: any): Promise<any> {
    const media = parametros.media;
    const desvio = parametros.desvio;
    const costo = parametros.costo;
    const dias = parametros.dias;
    const IC = parametros.IC;
    const P = parametros.P;
    const demora = parametros.demora;
    const idNumGen = parametros.idNumGen;
    const stock = parametros.stock;
    const comprarRango = parametros.comprarRango;
    const critico = parametros.critico;
    console.log('Media: ', media);
    console.log('Desvio: ', desvio);
    console.log('Costo: ', costo);
    console.log('Dias: ', dias);
    console.log('Cantidad de intervalos: ', IC);
    console.log('Valores de P(x): ', P);
    console.log('Valores de demora: ', demora);
    console.log('ID de la secuencia de numeros generada: ', idNumGen);
    console.log('Stock inicial: ', stock);
    console.log('Rango de dias/demanda para reabastecer: ', comprarRango);
    console.log('Valor critico de stock (stock minimo): ', critico);

    //Recupera de la BD la secuencia de numeros generados:
    return this.ngService
      .findById(idNumGen)
      .then((ng) => {
        let numerosAleatorios = Array.from(
          ng.numeros
            .toString()
            .replace(/('| |{|}|")/g, '')
            .split(',')
            .map(Number),
        );
        console.log('NumGen: ', ng.id);
        console.log('Secuencia: ', [
          numerosAleatorios[0],
          numerosAleatorios[1],
          '...',
          numerosAleatorios[numerosAleatorios.length - 1],
        ]);
        if (numerosAleatorios.length + comprarRango < dias) {
          let msg = new Mensaje();
          msg.codigo = '-1';
          msg.mensaje =
            'ERROR LA SERIE NO CUMPLE CON EL MINIMO DE NUMEROS (numerosAleatorios + comprarRango < dias)';
          console.log(msg);
          return msg;
        }
        //Calculos estadisticos:
        const limiteMin = media - 3 * desvio;
        const limiteMax = media + 3 * desvio;
        const rango = limiteMax - limiteMin;
        const amplitud = parseFloat((rango / IC).toFixed(4));
        let intervalos: number[] = new Array();
        intervalos[0] = limiteMin;
        for (let i = 0; i < IC; i++) {
          intervalos[i + 1] = intervalos[i] + amplitud;
        }
        console.log('Intervalos: ', intervalos);
        console.log('Limite minimo: ', limiteMin);
        console.log('Limite maximo: ', limiteMax);
        console.log('Rango: ', rango);
        console.log('Amplitud: ', amplitud);
        let MC: number[] = new Array();
        for (let i = 0; i < IC; i++) {
          MC[i] = (intervalos[i + 1] + intervalos[i]) / 2;
        }
        console.log('Marcas de Clase: ', MC);
        let valoresTablaZ: number[] = new Array();
        for (let i = 0; i < MC.length; i++) {
          valoresTablaZ[i] = parseFloat(
            jstat.normal.cdf(MC[i], media, desvio, true).toFixed(4),
          );
        }
        console.log('Valores de Tabla Z-Normal', valoresTablaZ);
        let probs: number[] = new Array();
        probs[0] = valoresTablaZ[0];
        for (let i = 1; i < valoresTablaZ.length; i++) {
          probs[i] = valoresTablaZ[i] - valoresTablaZ[i - 1];
        }
        console.log('Valores de probabilidad acumulados', probs);
        let Fx: number[] = new Array();
        Fx[0] = P[0];
        for (let i = 1; i < P.length; i++) {
          Fx[i] = Fx[i - 1] + P[i];
        }
        console.log('Frecuencia acumulada F(x): ', Fx); 

        let rangoFrecuencias: number[] = new Array();
        rangoFrecuencias.push(0);
        for (let i = 0; i < Fx.length; i++) {
          rangoFrecuencias[i + 1] = Fx[i];
        }
        console.log('Rango de frecuencias: ', rangoFrecuencias);
        let comprobarRangoFrecuencia: number[] = new Array();
        comprobarRangoFrecuencia = this.buscarRango(
          numerosAleatorios,
          rangoFrecuencias,
          demora,
        );
        console.log('Valores ajustados: ', comprobarRangoFrecuencia); 

        let limiteSuperior: number[] = new Array();
        let limiteInferior: number[] = new Array();
        limiteInferior[0] = 0;
        for (let i = 0; i < probs.length; i++) {
          limiteSuperior[i] = probs[i] + limiteInferior[i];
          limiteInferior[i + 1] = limiteSuperior[i];
        }
        limiteInferior.pop();
        console.log('Limite inferior: ', limiteInferior);
        console.log('Limite superior: ', limiteSuperior);
        let rangoLimites = limiteInferior;
        rangoLimites.push(limiteSuperior.pop());
        console.log('Rango de limites: ', rangoLimites);
        let demandasReales: number[] = new Array();
        demandasReales = this.buscarRango(numerosAleatorios, rangoLimites, MC);
        //console.log('Demandas reales: ', demandasReales);

        //Aca empiezan los calculos reales para el modelo
        let res = { 
          dia: [],
          existenciaPrincipioDia: [],
          demanda: [],
          demandaInsatisfecha: [],
          cantidadPedir: [],
          existenciaFinalDia: [],
          perdidaTotal: [],
          costoTotal: [],
          leyenda: [''],
          totalPerdida: 0,
          totalCosto: 0,
          gananciaNeta: 0,
        };

        let delay = comprarRango - 1 // 5 - 1 = 4

        //Obtengo el rango total de días
        for (let i = 0; i < numerosAleatorios.length; i++) {
            res.dia[i] = i - delay
        }

        //Obtengo la existencia al principio del día inicializado en 0
        for (let i = 0; i < numerosAleatorios.length - delay; i++) {
            res.existenciaPrincipioDia[i] = 0            
        }

        for (let i = 0; i < numerosAleatorios.length - delay; i++) {
            res.leyenda[i] = ''
        }

        //Sumo el stock en la posicion 0 re mis existencias
        res.existenciaPrincipioDia[0] = stock
        res.totalCosto = 0
        res.totalPerdida = 0
        res.demanda = demandasReales
        let hayPedido = false
        //Comienzo a recorrer los array para cargar datos
        for (let i = 0; i < numerosAleatorios.length - delay; i++) {  

            //Se calcula la existencia al final del dia
            if (res.existenciaPrincipioDia[i] - res.demanda[i+delay] < 0){
                res.demandaInsatisfecha[i] = Math.abs(res.existenciaPrincipioDia[i] - res.demanda[i+delay])
                res.existenciaFinalDia[i] = 0
                res.leyenda[i] += 'Se pierde de vender ' + res.demandaInsatisfecha[i] + ' unidades. '
            }else{
                res.existenciaFinalDia[i] = res.existenciaPrincipioDia[i] - res.demanda[i+delay]
                res.demandaInsatisfecha[i] = 0
            }

            if (res.leyenda[i].match(/Se acreditan/g) != null){
                hayPedido = false
            }

            //Si hay demanda insatisfecha
            if (res.existenciaFinalDia[i] <= critico){    
                if (hayPedido == false){
                    //Se pide una cantidad de producto igual a la suma de las ultimas demandas reales (comprarRango)
                    res.cantidadPedir[i] = 0 
                    for (let j = 0; j < comprarRango; j++) {
                        res.cantidadPedir[i] += demandasReales[i+j]
                    }
                    //Se escribe una leyenda para mostrar en la tabla
                    res.leyenda[i] += 'Se piden ' + res.cantidadPedir[i] + ' unidades con demora de ' + comprobarRangoFrecuencia[i] + ' dias.'
                    //Se acredita al stock con i+x dias de demora segun la tabla de demora (valores ajustados)
                    res.existenciaPrincipioDia[i + comprobarRangoFrecuencia[i]] += res.cantidadPedir[i]
                    res.leyenda[i+ comprobarRangoFrecuencia[i]] += 'Se acreditan ' + res.cantidadPedir[i] + ' unidades luego de ' + comprobarRangoFrecuencia[i] + ' dias.'
                    hayPedido = true
                }else{
                    //Si ya hay un pedido en curso, no se hace nada
                    res.cantidadPedir[i] = 0
                    res.leyenda[i] += 'No se pide nada porque ya hay un pedido en curso.' 
                }
            }else{
                res.cantidadPedir[i] = 0 
            }

            //Se calcula el costo total
            res.costoTotal[i] = Math.abs(res.demanda[i+delay] * costo)
            //Se calcula la perdida total
            res.perdidaTotal[i] = Math.abs(res.demandaInsatisfecha[i] * costo)
            //Se calcula el total de perdida   
            res.totalPerdida += res.perdidaTotal[i]
            //Se calcula el total de costo
            res.totalCosto += res.costoTotal[i]

            //Se calcula el stock del siguiente dia
            res.existenciaPrincipioDia[i + 1] += res.existenciaFinalDia[i]
        }
        
        //Se calcula la ganancia neta
        res.gananciaNeta = res.totalCosto - res.totalPerdida

        /*
        for (let i = 0; i < res.demanda.length - comprarRango; i++) {
          res.costoTotal[i] = res.demanda[i + comprarRango] * costo;
        }
        for (let i = 0; i < res.demandaInsatisfecha.length; i++) {
          res.perdidaTotal[i] = res.demandaInsatisfecha[i] * costo;
        }
        for (let i = 0; i < res.costoTotal.length; i++) {
          res.totalCosto += res.costoTotal[i];
        }
        for (let i = 0; i < res.perdidaTotal.length; i++) {
          res.totalPerdida += res.perdidaTotal[i];
        }
        res.gananciaNeta = res.totalCosto - res.totalPerdida;
        console.log(
          res.cantidadPedir.length,
          res.demanda.length,
          res.demandaInsatisfecha.length,
          res.existenciaFinalDia.length,
          res.existenciaPrincipioDia.length,
          res.perdidaTotal.length,
          res.costoTotal.length,
          demandasReales.length,
          comprobarRangoFrecuencia.length
        ); 
        */
       console.log(res)
        return res;
        /*
        let existencia = new Existencias();
        existencia.media = media;
        existencia.desvio = desvio;
        existencia.costo = costo;
        existencia.dias = dias;
        existencia.IC = IC;
        existencia.P = P;
        existencia.demora = demora;
        existencia.stock = stock;
        existencia.comprarRango = comprarRango;
        existencia.critico = critico;
        existencia.idNumGen = ng;
        return this.exRepository.save(existencia).then((respuesta)=>{
            console.log(respuesta)
            return res
        }).catch((err)=>{
            let mensaje:Mensaje
            mensaje.codigo = -1
            mensaje.mensaje = JSON.stringify(err)
            return mensaje
        })*/
      })
      .catch((err) => {
        let mensaje: Mensaje;
        mensaje.codigo = -1;
        mensaje.mensaje = JSON.stringify(err);
        return mensaje;
      });
  }

  buscarRango(
    valoresAleatorios: number[],
    rangos: number[],
    valores: number[],
  ): number[] {
    const valoresAsociados: number[] = [];

    for (let i = 0; i < valoresAleatorios.length; i++) {
      const valorAleatorio = valoresAleatorios[i];

      let valorAsociado: number | undefined;
      for (let j = 1; j < rangos.length; j++) {
        if (valorAleatorio <= rangos[j]) {
          valorAsociado = valores[j - 1];
          break;
        }
      }

      if (valorAsociado === undefined) {
        valorAsociado = valores[valores.length - 1];
      }

      valoresAsociados.push(valorAsociado);
    }
    return valoresAsociados;
  }

  borrarExistencia(id) {
    return this.exRepository.delete(id);
  }
}
