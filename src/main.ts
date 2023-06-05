import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "reflect-metadata"
import { DataSource } from 'typeorm';
import { VonNeuman } from './entidades/VonNeuman';
import { CongruenciaFundamental } from './entidades/CongruenciaFundamental';
import { NumerosGenerados } from './entidades/NumerosGenerados';

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "admin",
  password: "admin",
  database: "database-nest",
  entities: [VonNeuman, CongruenciaFundamental, NumerosGenerados],
  synchronize: true,
  logging: false,
})

AppDataSource.initialize()
    .then(() => {
      async function bootstrap() {
        const app = await NestFactory.create(AppModule);
        app.enableCors({
          origin: ['http://localhost:4200'],
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
          credentials: true,
      });
        await app.listen(3000, function () {
          console.log('OK: direccion: http://localhost:3000 **** CORS PROTECTED')
        });
      }
      bootstrap();
    })
    .catch((error) => console.log(error))


