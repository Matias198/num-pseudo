import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CongruenciaFundamental {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  vi: string;

  @Column('text')
  vik: string;
  
  @Column('text')
  a: string;

  @Column('text')
  c: string;

  @Column('text')
  k: string;

  @Column('text')
  m: string;

  @Column('text')
  repeticiones: string;

  @Column('text')
  secuencia: string;
}
