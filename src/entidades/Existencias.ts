import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { NumerosGenerados } from "./NumerosGenerados"

@Entity()
export class Existencias {
    @PrimaryGeneratedColumn()
    id: number

    @Column("text")
    media: number

    @Column("text")
    desvio: number
 
    @Column("text")
    costo: number
    
    @Column("text")
    dias: number

    @Column("text")
    IC: number

    @Column("text")
    P: number[]
    
    @Column("text")
    demora: number[]

    @Column("text")
    stock: number
    
    @Column("text")
    comprarRango: number
    
    @Column("text")
    critico: number   

    @OneToOne(() => NumerosGenerados)
    @JoinColumn()
    idNumGen: NumerosGenerados 
}