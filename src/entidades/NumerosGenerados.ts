import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class NumerosGenerados {
    @PrimaryGeneratedColumn()
    id: number

    @Column("text")
    generador: string

    @Column("text")
    semilla: string

    @Column("text")
    cantidad: string 
    
    @Column("text")
    mono: string
 
    @Column("text")
    chi: string

    @Column("text")
    numeros: string[]
}