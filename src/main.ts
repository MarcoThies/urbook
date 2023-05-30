import 'dotenv/config';

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from "./_core/http-exception.filter";

const port: string | number = (!process.env.PORT) ? 3000 : process.env.PORT;

async function bootstrap() {
  const app = await NestFactory.create( AppModule,
    {
      // logger: Boolean(process.env.ENABLELOGGING),
      logger: console,
    },
  );

  /**
   * Helmet can help protect your app from some well-known
   * web vulnerabilities by setting HTTP headers appropriately.
   * Generally, Helmet is just a collection of 12 smaller
   * middleware functions that set security-related HTTP headers
   *
   * https://github.com/helmetjs/helmet#how-it-works
   */
  //app.use(helmet());

  app.enableCors();

  app.setGlobalPrefix('api/');

  app.useGlobalFilters(new HttpExceptionFilter());

  // /**
  //  * we need this because "cookie" is true in csrfProtection
  //  */
  // app.use(cookieParser());

  // app.use(csurf({ cookie: true }));

  /**
   * To protect your applications from brute-force attacks
   */

  /**
   * Apply validation for all inputs globally
   */
  app.useGlobalPipes(
    new ValidationPipe({
      /**
       * Strip away all none-object existing properties
       */
      whitelist: true,
      /***
       * Transform input objects to their corresponding DTO objects
       */
      transform: true,
    }),
  );

  /**
   * Run DB migrations
   */

  await app.listen(port);


  Logger.log(`Server started running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
