import { Logger, HttpService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import swStats from 'swagger-stats';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { LoggerInterceptor, LoggerService } from './logger';
import { GlobalExceptionFilter } from './exception';
import swaggerSpec from './swagger.json';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const loggerService = app.get(LoggerService);
    app.useGlobalFilters(new GlobalExceptionFilter(loggerService));
    app.useGlobalInterceptors(new LoggerInterceptor(loggerService));

    app.use(swStats.getMiddleware({ swaggerSpec }));

    const appService = app.get(AppService);
    const config = appService.getConfig();
    const appPort = config.get('app.port');

    // Swagger
    const options = new DocumentBuilder()
        .setTitle('Nest simple starter')
        .setDescription('Nest simple starter API')
        .setVersion('1.0')
        .addTag('nest-simple-starter')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    await app.listen(appPort);

    Logger.log(`App started at PORT ${appPort}`, 'App');
}
bootstrap();
