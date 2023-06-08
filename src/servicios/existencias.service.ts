import { Injectable } from '@nestjs/common';  
import { Existencias } from 'src/entidades/Existencias';
import { AppDataSource } from 'src/main'; 
import * as jstat from 'jstat'; 
import { NumGenService } from './num-gen.service'; 
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
    const stock = parametros.stock
    const comprarRango = parametros.comprarRango
    const critico = parametros.critico
    console.log("Media: ", media)
    console.log("Desvio: ", desvio)
    console.log("Costo: ", costo)
    console.log("Dias: ", dias)
    console.log("Cantidad de intervalos: ", IC)
    console.log("Valores de P(x): ", P)
    console.log("Valores de demora: ", demora)
    console.log("ID de la secuencia de numeros generada: ", idNumGen)
    console.log("Stock inicial: ", stock)
    console.log("Rango de dias/demanda para reabastecer: ", comprarRango)
    console.log("Valor critico de stock (stock minimo): ", critico)

    //Recupera de la BD la secuencia de numeros generados: 
    return this.ngService.findById(idNumGen).then((ng)=>{
        let numerosAleatorios = Array.from(ng.numeros.toString().replace(/('| |{|}|")/g, '').split(',').map(Number))
        console.log("NumGen: ", ng.id)
        console.log("Secuencia: ", [numerosAleatorios[0], numerosAleatorios[1], "...", numerosAleatorios[numerosAleatorios.length-1]])
        if (numerosAleatorios.length + comprarRango < dias){
            let msg = new Mensaje()
            msg.codigo = '-1'
            msg.mensaje = "ERROR LA SERIE NO CUMPLE CON EL MINIMO DE NUMEROS (numerosAleatorios + comprarRango < dias)"
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
        console.log("Promedio de demora real: ", promedioDemoraReal, "dias")
        let rangoFrecuencias:number[] = new Array
        rangoFrecuencias.push(0)
        for (let i = 0; i < Fx.length; i++) { 
            rangoFrecuencias[i+1] = Fx[i]
        }
        console.log("Rango de frecuencias: ", rangoFrecuencias) 
        let comprobarRangoFrecuencia:number[] = new Array()
        comprobarRangoFrecuencia = this.buscarRango(numerosAleatorios, rangoFrecuencias, demora)
        console.log("Valores ajustados: ", comprobarRangoFrecuencia)
        let promedioDemoraAleatorios = 0;
        divisor = 0
        for (let i = 0; i < comprobarRangoFrecuencia.length; i++) {
             promedioDemoraAleatorios += comprobarRangoFrecuencia[i]
             divisor++
        }
        promedioDemoraAleatorios = parseFloat((promedioDemoraAleatorios / divisor).toFixed(1))
        console.log("Promedio de demora aleatorio ajustado: ", promedioDemoraAleatorios, "dias")
        let promedioDemora = Math.round(parseFloat(((promedioDemoraReal + promedioDemoraAleatorios)/2).toFixed(1)))
        console.log("Promedio de promedios (demora efectiva): ", promedioDemora)  
        let limiteSuperior:number[] = new Array()
        let limiteInferior:number[] = new Array()
        limiteInferior[0] = 0
        for (let i = 0; i < probs.length; i++) { 
            limiteSuperior[i] = probs[i] + limiteInferior[i]
            limiteInferior[i+1] = limiteSuperior[i]
        }
        limiteInferior.pop()
        console.log("Limite inferior: ", limiteInferior)
        console.log("Limite superior: ", limiteSuperior)
        let rangoLimites = limiteInferior
        rangoLimites.push(limiteSuperior.pop())
        console.log("Rango de limites: ", rangoLimites)
        let demandasReales:number[] = new Array()
        demandasReales = this.buscarRango(numerosAleatorios, rangoLimites, MC)
        console.log("Demandas reales: ", demandasReales)
    
        //Aca empiezan los calculos reales para el modelo
        let res = { //Este es el json de respuesta
            "dia":[], 
            "existenciaPrincipioDia":[],
            "demanda":[],
            "demandaInsatisfecha":[],
            "cantidadPedir":[],
            "existenciaFinalDia":[],
            "perdidaTotal":[],
            "costoTotal":[],
            "leyenda":[''], //cada vez y cuanto se pide o se recibe
            "totalPerdida":0,
            "totalCosto":0,
            "gananciaNeta":0
        }
        
        let j
        for (let i = comprarRango; i <= demandasReales.length + comprarRango; i++) {
            j = i-comprarRango
            res.dia.push(i-comprarRango*2) 
            res.demanda.push(demandasReales[j])
        }
        res.demanda.pop() 
        res.existenciaPrincipioDia[0] = stock
        for (let i = 0; i < res.demanda.length - comprarRango; i++) { //1+5-1 /-comprarRango
            res.leyenda[i] = ""
            if (res.existenciaPrincipioDia[i] - res.demanda[i+comprarRango-1] < 0){
                res.demandaInsatisfecha.push(Math.abs(res.existenciaPrincipioDia[i] - res.demanda[i+comprarRango-1]))
                res.existenciaFinalDia.push(0)
            }else{
                res.existenciaFinalDia.push(res.existenciaPrincipioDia[i] - res.demanda[i+comprarRango-1])
                res.demandaInsatisfecha.push(0)
            }

            if (res.existenciaFinalDia[i] <= critico){
                let aux = 0
                for (let j = 0; j < comprarRango; j++) {
                    aux += demandasReales[j+i]
                }
                res.cantidadPedir[i] = aux 
                //Aca la leyenda de cuanto se pide
                res.leyenda[i] = "Se piden: " + aux + " unidades. "
            }else{
                res.cantidadPedir.push(0)
                if (res.leyenda[i] == "" || res.leyenda[i] == undefined){
                    res.leyenda[i] = ""
                }
            }

            if (i < promedioDemora){ 
                res.existenciaPrincipioDia[i+1] = res.existenciaFinalDia[i]
            }else{
                if (res.cantidadPedir[i-promedioDemora] != 0){
                    res.existenciaPrincipioDia[i+1] = res.existenciaFinalDia[i] + res.cantidadPedir[i-promedioDemora]
                    //Aca la leyenda de cuanto se recibe
                    res.leyenda[i] += "Se reciben: " + res.cantidadPedir[i-promedioDemora] + " unidades."
                }else{
                    res.existenciaPrincipioDia[i+1] = res.existenciaFinalDia[i]
                    if (res.leyenda[i] == "" || res.leyenda[i] == undefined){
                        res.leyenda[i] = ""
                    }
                }
            }
        } 
        
        res.existenciaPrincipioDia.pop()
        res.dia.pop()
        for (let i = 0; i < res.demanda.length - comprarRango; i++) { // - comprarRango
            res.costoTotal[i] = res.demanda[i+comprarRango] * costo
        }
        for (let i = 0; i < res.demandaInsatisfecha.length; i++) {
            res.perdidaTotal[i] = res.demandaInsatisfecha[i] * costo   
        }
        for (let i = 0; i < res.costoTotal.length; i++) {
            res.totalCosto += res.costoTotal[i]
        }
        for (let i = 0; i < res.perdidaTotal.length; i++) {
            res.totalPerdida += res.perdidaTotal[i]
        }
        res.gananciaNeta = res.totalCosto - res.totalPerdida
        console.log(res) 
        
        let existencia = new Existencias
        existencia.media = media
        existencia.desvio = desvio
        existencia.costo = costo
        existencia.dias = dias
        existencia.IC = IC
        existencia.P = P
        existencia.demora = demora
        existencia.stock = stock 
        existencia.comprarRango = comprarRango
        existencia.critico = critico
        existencia.idNumGen = ng
        return res
        /*return this.exRepository.save(existencia).then((respuesta)=>{
            console.log(respuesta)
            return res
        }).catch((err)=>{
            let mensaje:Mensaje
            mensaje.codigo = -1
            mensaje.mensaje = JSON.stringify(err)
            return mensaje
        })*/
    }).catch((err)=>{
        let mensaje:Mensaje
        mensaje.codigo = -1
        mensaje.mensaje = JSON.stringify(err)
        return mensaje
    })
    
  } 

  buscarRango(valoresAleatorios: number[], rangos: number[], valores: number[]): number[] {
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

  borrarExistencia(id){
    return this.exRepository.delete(id);
  }
}