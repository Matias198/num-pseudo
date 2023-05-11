import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService { 
  comprobarChiCuadrado(parametros): any {
    const secuencia = parametros.secuencia;
    const n = secuencia.toString().length;
    const k = 10;
    const significancia = 0.10;
    const npi = n/k;
    const gl = k - 1;
    let digitos = new Array(10)
    for (let i = 0; i < digitos.length; i++) {
      digitos[i] = ""  
    }
    for (let i = 0; i < n; i++) {
      const element = secuencia.toString()[i]; 
      switch (element) {
        case "0":{
          digitos[0] += element
          break;
        }
        case "1":{
          digitos[1] += element
          break;
        }
        case "2":{
          digitos[2] += element
          break;
        }
        case "3":{
          digitos[3] += element
          break;
        }
        case "4":{
          digitos[4] += element
          break;
        }
        case "5":{
          digitos[5] += element
          break;
        }
        case "6":{
          digitos[6] += element
          break;
        }
        case "7":{
          digitos[7] += element
          break;
        }
        case "8":{
          digitos[8] += element
          break;
        }
        case "9":{
          digitos[9] += element
          break;
        }
        default:
          break;
      }
    } 
    let f = Array(10);
    let sumatoria = 0
    for (let i = 0; i < k; i++) {
      f[i] = ""
      f[i] = (((digitos[i].length)-npi)*((digitos[i].length)-npi))/npi
      //console.log((digitos[i].length))
      //console.log((f[i]))
      sumatoria += parseFloat(f[i])
    }
    let pest = "ES ALEATORIA"
    if (sumatoria >  14.6837){
      pest = "NO ES ALEATORIA"
    }
    const response = JSON.parse(
      '{"significancia":'+significancia+', "chicuadrado":'+sumatoria+', "gl":'+gl+', "pest":"'+pest.toString()+'"}'
    )
    console.log(response)
    return response
  }

  comprobarMonobits(parametros):any{
    const secuencia = parametros.secuencia; 
    const n = secuencia.toString().length;  
    let sn = 0;
    for (let i = 0; i < n; i++) {
      const element = secuencia.toString()[i]; 
      if (parseInt(element) >= 0 && parseInt(element) < 5){ 
      //if (parseInt(element) != 1){ 
        sn -= 1
      }else{ 
        sn += 1
      }
    }   
    let sobs = Math.abs(sn)/Math.sqrt(n) 
    let pvalor = 1-this.erfc(sobs/Math.sqrt(2)) 
    let pest = "ES ALEATORIA"
    if (pvalor < 0.05){
      pest = "NO ES ALEATORIA"
    }
    const response = JSON.parse(
      '{"sn":'+sn+', "pvalor":'+pvalor+', "se":'+sobs+', "pest":"'+pest.toString()+'"}'
    )
    console.log(response)
    return response
  }
  
  erfc(x) {
    var t = 1 / (1 + 0.5 * Math.abs(x));
    var ans = 1 - t * Math.exp(-x*x - 1.26551223 + t * (1.00002368 +
              t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
              t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 +
              t * (-0.82215223 + t * 0.17087277)))))))));
    if (x >= 0) {
      return ans;
    } else {
      return 2 - ans;
    }
  }
}
