import { Injectable } from '@nestjs/common';
import { CongFundService } from './servicios/cong-fund.service';  
import { VonNeumanService } from './servicios/von-neuman.service';
import * as jstat from 'jstat'; 

@Injectable()
export class AppService { 
  constructor (private congService:CongFundService, private vonService:VonNeumanService){}
  comprobarChiCuadrado(parametros:any): any { 
    //parametros = JSON.parse(parametros)
    let secuencia = "";
    let mensaje:any  
    if (parametros.cong){
      mensaje = this.congService.crearSerie(parametros)
      secuencia = mensaje.mensaje
    }
    if (parametros.von){
      mensaje = this.vonService.crearSerie(parametros)
      secuencia = mensaje.mensaje
    }
    const k = 10;
    const significancia = 0.01;
    const gl = k - 1; 
    let fo = Array(10);
    for (let i = 0; i < 10; i++) {
      fo[i] = 0
    }
    //for (let i = 0; i < secuencia.length; i++) {
    for (let i = 0; i < secuencia.length; i++) {
      const element = secuencia.toString()[i];
      let valor = parseFloat(element) 
      fo[valor]++;
    }
    let fe = Array(10)
    for (let i = 0; i < 10; i++) {
      fe[i] = 0
    } 
    let aux = 0
    for (let i = 0; i < 10; i++) {
      aux += fo[i]
    } 
    aux = aux * (1/10)
    let chiCuadrado = 0;
    for (let i = 0; i < fo.length; i++) {
      const valor = fo[i];
      chiCuadrado += Math.pow(valor - aux, 2) / aux
    }
    
    const chiLimite = 21.6660; 
    let pest = "ES ALEATORIA"
    if (chiCuadrado >  chiLimite){
      pest = "NO ES ALEATORIA"
    }
    let resp:any = {'significancia': significancia, 'chicuadrado': chiCuadrado, 'gl':gl, 'pest':pest} 
    const response = JSON.parse(JSON.stringify(resp))
    //console.log(response)
    return response
  }

  comprobarMonobits(parametros):any{
    //console.log("Comprobando por test de Monobits con parametros: ", parametros)
    let secuencia = "";
    let mensaje:any 
    if (parametros.cong){
      mensaje = this.congService.crearSerie(parametros)
      secuencia = mensaje.mensaje
    }
    if (parametros.von){
      mensaje = this.vonService.crearSerie(parametros)
      secuencia = mensaje.mensaje
    }
    const n = secuencia.toString().length;  
    let sn = 0; 
    for (let i = 0; i < n; i++) {
      let element = secuencia.toString()[i]; 
      if (parseFloat(element) < 1){
        element = (parseFloat(element) * 10).toFixed(4)
      }
      if (parseFloat(element) >= 0 && parseFloat(element) < 5){ 
      //if (parseInt(element) != 1){ 
        sn -= 1
      }else{ 
        sn += 1
      }
    } 
    let sobs = Math.abs(sn)/Math.sqrt(n)  

    let z = (sobs/Math.sqrt(2))
    //console.log(z) 
    let pvalor = 1-this.erf(z)

    let pest = "ES ALEATORIA"
    if (pvalor < 0.05){
      pest = "NO ES ALEATORIA"
    }
    const response = JSON.parse(
      '{"sn":'+sn+', "pvalor":'+pvalor+', "se":'+sobs+', "pest":"'+pest.toString()+'"}'
    )
    //console.log(response)
    return response
  }
  erf(z) {
    var n = 1000000; // Número de subintervalos
    var deltaX = z / n;
    var sum = 0;
  
    for (var i = 0; i < n; i++) {
      var t = i * deltaX;
      var area = Math.exp(-t * t) * deltaX;
      sum += area;
    }
  
    return (2 / Math.sqrt(Math.PI)) * sum;
  }

}
