import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Existencias {
    @PrimaryGeneratedColumn()
    id: number

    @Column("text")
    media: string

    @Column("text")
    desvio: string
 
    @Column("text")
    costo: string 
    
    @Column("text")
    metodo: string
    
    @Column("text")
    semilla: string

    @Column("text")
    numeros: string[] 
    
}