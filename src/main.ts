import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import {AppModule} from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        credentials: true,
        origin: [
            'http://localhost:3000'
        ],
    });
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // If true, It will remove the additional data from post request which is not in dto
            forbidNonWhitelisted: false, // if true server will throw error with exact extra data in payload
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );
    const config = new DocumentBuilder()
        .setTitle('Gallery Test')
        .setDescription('used for test purpose only')
        .setVersion('1.0')
        .addTag('gallery')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(8000);
    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
