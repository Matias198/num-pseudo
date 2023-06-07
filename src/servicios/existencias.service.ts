import { Injectable } from '@nestjs/common';  
import { Existencias } from 'src/entidades/Existencias';
import { AppDataSource } from 'src/main'; 
import * as jstat from 'jstat';
import { NumerosGenerados } from 'src/entidades/NumerosGenerados';
import { NumGenService } from './num-gen.service';
import { isEmpty } from 'rxjs';
import { Mensaje } from 'src/dto/Mensaje';

@Injectable()
export class ExistenciasService { 
  exRepository = AppDataSource.getRepository(Existencias);

  constructor(private ngService:NumGenService){}
  

  findAll():Promise<Existencias[]>{
    return this.exRepository.find()
  }

  findById(id):Promise<Existencias>{
    return this.exRepository.findOne(id)
  }

  findCant(parametros){ 
    const pagina = parametros.pagina || 1
    const tPagina = parametros.tPagina || 10
    return this.exRepository.find() 
    .then((listaCompleta:any[])=>{
        const count = listaCompleta.length 
        const startIndex = (pagina - 1) * tPagina
        const endIndex = startIndex + tPagina 
        let resp:any
        if (endIndex >= count){
            resp = JSON.parse(JSON.stringify(listaCompleta.slice(startIndex, count))) 
        }else{
            resp = JSON.parse(JSON.stringify(listaCompleta.slice(startIndex, endIndex))) 
        } 
        console.log(resp)
        return resp            
    })
  }

  async crearExistencia(parametros){  
    const media = parametros.media
    const desvio = parametros.desvio 
    const costo = parametros.costo
    const dias = parametros.dias 
    const IC = parametros.IC
    const P = parametros.P
    const demora = parametros.demora
    const idNumGen = parametros.idNumGen
    console.log("Media: ", media)
    console.log("Desvio: ", desvio)
    console.log("Costo: ", costo)
    console.log("Dias: ", dias)
    console.log("Cantidad de intervalos: ", IC)
    console.log("Valores de P(x): ", P)
    console.log("Valores de demora: ", demora)
    console.log("ID de la secuencia de numeros generada: ", idNumGen)

    //Recupera de la BD la secuencia de numeros generados: 
    this.ngService.findById(2).then((ng)=>{
        let numerosAleatorios = Array.from(ng.numeros.toString().replace(/('| |{|}|")/g, '').split(',').map(Number))
        console.log("NumGen: ", ng.id)
        console.log("Secuencia: ", [numerosAleatorios[0], numerosAleatorios[1], "...", numerosAleatorios[numerosAleatorios.length-1]])
        if (numerosAleatorios.length < dias){
            let msg = new Mensaje()
            msg.codigo = '-1'
            msg.mensaje = "ERROR LA SERIE NO CUMPLE CON EL MINIMO DE NUMEROS (numerosAleatorios < dias)"
            console.log(msg)
            return msg
        }
        //Calculos estadisticos: 
        const limiteMin = media - (3 * desvio)
        const limiteMax = media + (3 * desvio)
        const rango = limiteMax - limiteMin
        const amplitud = parseFloat((rango / IC).toFixed(4)) //rango / cantidad de intervalos
        let intervalos:number[] = new Array
        intervalos[0] = limiteMin
        for (let i = 0; i < IC; i++) {
            intervalos[i+1] = intervalos[i] + amplitud
        }
        console.log("Intervalos: ", intervalos)
        console.log("Limite minimo: ", limiteMin)
        console.log("Limite maximo: ", limiteMax)
        console.log("Rango: ", rango)
        console.log("Amplitud: ", amplitud)
        let MC:number[] = new Array
        for (let i = 0; i < IC; i++) {
            MC[i] = (intervalos[i+1]+intervalos[i])/2
        }    
        console.log("Marcas de Clase: ", MC)
        let valoresTablaZ:number[] = new Array
        for (let i = 0; i < MC.length; i++) {
            valoresTablaZ[i] = parseFloat(jstat.normal.cdf(MC[i], media, desvio, true).toFixed(4))
        }
        console.log("Valores de Tabla Z-Normal", valoresTablaZ)
        let probs:number[] = new Array
        probs[0] = valoresTablaZ[0]
        for (let i = 1; i < valoresTablaZ.length; i++) {
            probs[i] = valoresTablaZ[i]-valoresTablaZ[i-1]
        }
        console.log("Valores de probabilidad acumulados", probs)
        let Fx:number[] = new Array
        Fx[0] = P[0]
        for (let i = 1; i < P.length; i++) { 
            Fx[i] = Fx[i-1] + P[i]
        }
        console.log("Frecuencia acumulada F(x): ", Fx)
        let promedioDemoraReal = 0
        let divisor = 0
        for (let i = 0; i < P.length; i++) {
            promedioDemoraReal += demora[i]*Fx[i]
            divisor++
        }
        promedioDemoraReal = parseFloat((promedioDemoraReal / divisor).toFixed(1))
        console.log("Promedio de demora real: ", promedioDemoraReal)
    }) 

    
  }

  borrarExistencia(id){
    return this.exRepository.delete(id);
  }
}