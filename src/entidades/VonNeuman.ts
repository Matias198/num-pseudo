import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class VonNeuman {
    @PrimaryGeneratedColumn()
    id: number

    @Column("text")
    semilla: string

    @Column("text")
    repeticiones: string

    @Column("text")
    secuencia: string
}