import { Injectable } from "@nestjs/common";
import { NumerosGenerados } from "src/entidades/NumerosGenerados";
import { AppDataSource } from "src/main";
import { VonNeumanService } from "./von-neuman.service";
import { CongFundService } from "./cong-fund.service";
import { AppService } from "src/app.service";
import { Mensaje } from "src/dto/Mensaje";

@Injectable()
export class NumGenService {
    ngRepository = AppDataSource.getRepository(NumerosGenerados);
    
    constructor (
        private vnService:VonNeumanService,
        private cgService:CongFundService, 
        private appServ:AppService){}

    findAll() {
        return this.ngRepository.find()
    }

    findById(id) {
        return this.ngRepository.findOneBy({
            id: id,
        });
    }

    findCant(parametros){
        const pagina = parametros.pagina || 1
        const tPagina = parametros.tPagina || 10
        return this.ngRepository.find() 
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

    async crearSerieVonNeuman(parametros): Promise<any> {
        //console.log(parametros)
        //Nuevo conjunto de datos generados segun las especificaciones
        let numGen = new NumerosGenerados()

        //Semilla devuelta por el generador
        let semilla:any

        //Cantidad de numeros solicitados
        let cantidad = parametros.cantidad
        
        //Que tests debe pasar?
        let chi = parametros.chi
        let mono = parametros.mono

        //Numeros generados para el conjunto de datos
        let numeros = []

 
        let serieVonNeuman:any
        let num:any        
        let param:any
        let str:any
        let salir = false
        let testChi:boolean
        let testMono:boolean
        let salidaEmergencia = 0;
        while (!salir){
            testChi = false
            testMono = false
            num = Math.random().toFixed(5)  
            semilla = num * 10000 
            semilla = parseInt(semilla)
            if (semilla<1000){
                semilla += 1000
            } 
            str = {'semilla': semilla, 'repeticiones': cantidad, 'cong':false, 'von':true} 
            console.log("Comprobando chi 2")
            param = this.appServ.comprobarChiCuadrado(str) 
            console.log(param.pest)
            param = JSON.parse(JSON.stringify(param))
            if (param.pest == 'ES ALEATORIA'){
                //console.log("La semilla " + semilla + " genera una secuencia aleatoria que pasa el test de chi cuadrado")
                testChi = true
            }
            console.log("Comprobando monobits")
            param = this.appServ.comprobarMonobits(str) 
            console.log(param.pest)
            param = JSON.parse(JSON.stringify(param))
            if (param.pest == 'ES ALEATORIA'){
                //console.log("La semilla " + semilla + " genera una secuencia aleatoria que pasa el test de monobits")
                testMono = true
            }
            salidaEmergencia++
            if (salidaEmergencia >= 100){
                salir = true 
                let mensaje = new Mensaje()
                mensaje.codigo = "1"
                mensaje.mensaje = "ERROR: No se encuentra una semilla apropiada para el metodo"
                return mensaje
            }
            if (testChi == chi && testMono == mono){
                console.log("La semilla " + semilla + " cumple con los parametros acordados") 
                salir = true 
            }
        }
        str =
            "{\"semilla\":"+semilla+
            ",\"repeticiones\":"+cantidad+
            "}" 
        let mensaje = this.vnService.crearSerie(JSON.parse(str))
        //console.log(mensaje) 
        serieVonNeuman = mensaje.mensaje;
        for (let i = 0; i < cantidad; i++) {
            numeros[i] = serieVonNeuman[i]/10000
            numeros[i] = numeros[i].toFixed(4)            
        }
        //console.log(numeros)
        numGen.cantidad = cantidad
        numGen.generador = 'von-neuman'
        numGen.semilla = semilla
        numGen.numeros = numeros
        if (chi){
            numGen.chi = "SI" 
        }else{
            numGen.chi = "NO" 
        }
        if (mono){
            numGen.mono = "SI" 
        }else{
            numGen.mono = "NO" 
        }
        await this.ngRepository.save(numGen).then((res)=>{
            numGen.id = res.id
        })
        console.log(numGen)
        return numGen
    }
    
    async crearSerieCongruencias(parametros){
        //Nuevo conjunto de datos generados segun las especificaciones
        let numGen = new NumerosGenerados() 

        //Numeros generados para el conjunto de datos
        let numeros = []
        
        //Que tests debe pasar?
        let chi = parametros.chi
        let mono = parametros.mono

        //Valores de semilla para el generador let vi = Math.random()
        let vi:number
        let vik:number
        let a:number
        let c:number
        const k:number = 1
        const m:number = 1
        
        //Cantidad de numeros solicitados
        const n:number = parametros.cantidad

        let testChi:boolean
        let testMono:boolean
        let salidaEmergencia = 0;
        let serieCongruencias:any
        let str:any     
        let param:any
        let generarSemilla:boolean ;
        let salir:boolean = false;
        while (!salir){
            testChi = false
            testMono = false
            
            //Generar semilla
            generarSemilla = false;
            while (!generarSemilla){ 
                vi = parseFloat(Math.random().toFixed(4))
                vik = parseFloat(Math.random().toFixed(4))
                a = parseFloat((Math.random()*10).toFixed(4))
                c = parseFloat((Math.random()*10).toFixed(4))
                if (a > 0 && c > 0){ // && a < 1
                    if (vik >= 0 && vik < m){
                        if (vi > 0 && vi < m){
                            generarSemilla = true
                        }
                    }
                }
            }  

            str = {
                'vi': vi, 
                'vik': vik, 
                'a': a, 
                'c': c, 
                'k': k, 
                'm': m, 
                'n': n, 
                'cong':true, 
                'von':false
            }  

            console.log("Comprobando chi 2")
            param = this.appServ.comprobarChiCuadrado(str) 
            //console.log(param.pest)
            param = JSON.parse(JSON.stringify(param))
            if (param.pest == 'ES ALEATORIA'){
                //console.log("La semilla " + semilla + " genera una secuencia aleatoria que pasa el test de chi cuadrado")
                testChi = true
            }
            console.log("Comprobando monobits")
            param = this.appServ.comprobarMonobits(str) 
            //console.log(param.pest)
            param = JSON.parse(JSON.stringify(param))
            if (param.pest == 'ES ALEATORIA'){
                //console.log("La semilla " + semilla + " genera una secuencia aleatoria que pasa el test de monobits")
                testMono = true
            }

            salidaEmergencia++
            if (salidaEmergencia >= 100){
                salir = true 
                let mensaje = new Mensaje()
                mensaje.codigo = "1"
                mensaje.mensaje = "ERROR: No se encuentra una semilla apropiada para el metodo"
                return mensaje
            }

            if (testChi == chi && testMono == mono){
                str = {
                    'vi': vi, 
                    'vik': vik, 
                    'a': a, 
                    'c': c, 
                    'k': k, 
                    'm': m, 
                    'n': n
                }  
                console.log("La semilla con los valores cumple con los parametros acordados.", str) 
                salir = true 
            }
        } 
        str = {
            'vi': vi, 
            'vik': vik, 
            'a': a, 
            'c': c, 
            'k': k, 
            'm': m, 
            'n': n
        }    
        let mensaje = this.cgService.crearSerie(str)
        console.log(mensaje)
        serieCongruencias = mensaje.mensaje;
        for (let i = 0; i < n; i++) {
            numeros[i] = serieCongruencias[i].toFixed(4)  
        }
        console.log(numeros)
        numGen.cantidad = n.toString()
        numGen.generador = 'congruencias'
        let semilla:string = JSON.stringify(str).replace(/('| |{|}|")/g, '')
        console.log(semilla)
        numGen.semilla = semilla
        numGen.numeros = numeros
        if (chi){
            numGen.chi = "SI" 
        }else{
            numGen.chi = "NO" 
        }
        if (mono){
            numGen.mono = "SI" 
        }else{
            numGen.mono = "NO" 
        }
        await this.ngRepository.save(numGen).then((res)=>{
            numGen.id = res.id
        })
        console.log(numGen)
        return numGen
    }


    async crearSerieSemilla(parametros){
        //Nuevo conjunto de datos generados segun las especificaciones
        let numGen = new NumerosGenerados() 

        //Numeros generados para el conjunto de datos
        let numeros = []
        
        //Que tests debe pasar?
        let chi = parametros.chi
        let mono = parametros.mono

        //Valores de semilla para el generador let vi = Math.random()
        let vi:number
        let vik:number
        let a:number
        let c:number
        const k:number = 1
        const m:number = 1
        
        //Cantidad de numeros solicitados
        const n:number = parametros.cantidad

        let testChi:boolean
        let testMono:boolean
        let salidaEmergencia = 0;
        let serieCongruencias:any
        let str:any     
        let param:any
        let generarSemilla:boolean ;
        let salir:boolean = false;
        while (!salir){
            testChi = false
            testMono = false
            
            //Generar semilla
            generarSemilla = false;
            while (!generarSemilla){ 
                vi = parseFloat(Math.random().toFixed(4))
                vik = parseFloat(Math.random().toFixed(4))
                a = parseFloat(Math.random().toFixed(4))
                c = parseFloat(Math.random().toFixed(4))
                if (a > 0 && a < 1){
                    if (vik >= 0 && vik < m){
                        if (vi > 0 && vi < m){
                            generarSemilla = true
                        }
                    }
                }
            }  

            str = {
                'vi': vi, 
                'vik': vik, 
                'a': a, 
                'c': c, 
                'k': k, 
                'm': m, 
                'n': n, 
                'cong':true, 
                'von':false
            }  

            console.log("Comprobando chi 2")
            param = this.appServ.comprobarChiCuadrado(str) 
            //console.log(param.pest)
            param = JSON.parse(JSON.stringify(param))
            if (param.pest == 'ES ALEATORIA'){
                //console.log("La semilla " + semilla + " genera una secuencia aleatoria que pasa el test de chi cuadrado")
                testChi = true
            }
            console.log("Comprobando monobits")
            param = this.appServ.comprobarMonobits(str) 
            //console.log(param.pest)
            param = JSON.parse(JSON.stringify(param))
            if (param.pest == 'ES ALEATORIA'){
                //console.log("La semilla " + semilla + " genera una secuencia aleatoria que pasa el test de monobits")
                testMono = true
            }

            salidaEmergencia++
            if (salidaEmergencia >= 2000){
                salir = true 
                let mensaje = new Mensaje()
                mensaje.codigo = "1"
                mensaje.mensaje = "ERROR: No se encuentra una semilla apropiada para el metodo"
                return mensaje
            }

            if (testChi == chi && testMono == mono){
                str = {
                    'vi': vi, 
                    'vik': vik, 
                    'a': a, 
                    'c': c, 
                    'k': k, 
                    'm': m, 
                    'n': n
                }  
                console.log("La semilla con los valores cumple con los parametros acordados.", str) 
                salir = true 
            }
        } 
        str = {
            'vi': vi, 
            'vik': vik, 
            'a': a, 
            'c': c, 
            'k': k, 
            'm': m, 
            'n': n
        }    
        let mensaje = this.cgService.crearSerie(str)
        console.log(mensaje)
        serieCongruencias = mensaje.mensaje;
        for (let i = 0; i < n; i++) {
            numeros[i] = serieCongruencias[i].toFixed(4)  
        }
        console.log(numeros)
        numGen.cantidad = n.toString()
        numGen.generador = 'congruencias'
        let semilla:string = JSON.stringify(str).replace(/('| |{|}|")/g, '')
        console.log(semilla)
        numGen.semilla = semilla
        numGen.numeros = numeros
        if (chi){
            numGen.chi = "SI" 
        }else{
            numGen.chi = "NO" 
        }
        if (mono){
            numGen.mono = "SI" 
        }else{
            numGen.mono = "NO" 
        }
        await this.ngRepository.save(numGen).then((res)=>{
            numGen.id = res.id
        })
        console.log(numGen)
        return numGen
    }

    borrarSerie(id) {
        console.log("Eliminando secuencia con id: " + id)
        return this.ngRepository.delete(id);  
    }

}