import {Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors} from '@nestjs/common';
import {AppService} from './app.service';
import {extname} from "path";
import {ApiConsumes} from '@nestjs/swagger';
import {ApiImplicitFile} from '@nestjs/swagger/dist/decorators/api-implicit-file.decorator';
import {FileInterceptor} from '@nestjs/platform-express';
import {diskStorage} from 'multer'
import {Response} from 'express'
import {v4 as uuidv4} from 'uuid';
import * as fs from 'fs'

import * as db from './data/database.json'
import {GalleryDto} from "./dto/gallery.dto";

@Controller('api/v1')
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get("/gallery")
    getSavedData(): any {
        console.log(db.length)

        const page = 2;
        const limit = 2;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const result: any = {};

        if (endIndex < db.length) {
            result.next = {
                page: page + 1,
                limit: limit,
            };
        }
        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit,
            };
        }
        result.results = db.slice(startIndex, endIndex);


        return result
    }

    @Post('/save-data')
    saveData(@Body() formData: GalleryDto): any {
        return fs.readFile('./src/data/database.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                const jsonData = JSON.parse(data); //now it an object
                jsonData.push({
                    id: uuidv4(),
                    title: formData.title,
                    description: formData.description,
                    imageUrl: formData.imageUrl
                }); //add some data
                const json = JSON.stringify(jsonData); //convert it back to json
                return fs.writeFile('./src/data/database.json', json, 'utf8', function () {
                    return {
                        success: true
                    }
                }); // write it back
            }
        });

    }


    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiImplicitFile({name: 'file', required: true})
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename(
                    _,
                    file,
                    callback,
                ) {
                    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
                    return callback(null, `${randomName}${extname(file.originalname)}`)
                },
            }),
        }),
    )
    uploadFile(@UploadedFile() file) {
        return {
            url: `http://localhost:3001/api/v1/${file.path}`
        }
    }

    @Get('uploads/:path')
    async getImage(@Param('path') path, @Res() res: Response) {
        res.sendFile(path, {root: 'uploads'})
    }
}
