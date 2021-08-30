import {Body, Controller, Get, Param, Post, Query, Res, UploadedFile, UseInterceptors} from '@nestjs/common';
import {AppService} from './app.service';
import {extname} from "path";
import {ApiConsumes} from '@nestjs/swagger';
import {ApiImplicitFile} from '@nestjs/swagger/dist/decorators/api-implicit-file.decorator';
import {FileInterceptor} from '@nestjs/platform-express';
import {diskStorage} from 'multer'
import {Response} from 'express'
import {v4 as uuidv4} from 'uuid';
import {promises as fs} from 'fs'

import * as db from './data/database.json'
import {GalleryDto} from "./dto/gallery.dto";

@Controller('api/v1')
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get("/gallery")
    async getSavedData(@Query() query): Promise<any> {
        const page: number = query.page !== undefined ? parseInt(query.page) : 1;
        const limit = 9;
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
        result.results = await db.slice(startIndex, endIndex);
        return new Promise((resolve) => {
            return resolve(result)
        })
    }

    @Post('/save-data')
    async saveData(@Body() formData: GalleryDto): Promise<any> {
        const data = await fs.readFile('./src/data/database.json', 'utf8')
        const jsonData = JSON.parse(data); //now it an object
        jsonData.push({
            id: uuidv4(),
            title: formData.title,
            description: formData.description,
            imageUrl: formData.imageUrl
        }); //add some data
        const json = JSON.stringify(jsonData); //convert it back to json
        await fs.writeFile('./src/data/database.json', json, 'utf8')

        return new Promise((resolve) => {
            return resolve({
                success: true
            })
        })
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
            url: `${file.path}`
        }
    }

    @Get('uploads/:path')
    async getImage(@Param('path') path, @Res() res: Response) {
        res.sendFile(path, {root: 'uploads'})
    }

    @Post('/delete')
    async deleteFiles(): Promise<any> {
        await fs.writeFile('./src/data/database.json', JSON.stringify([]), 'utf8')
        const dir = await fs.readdir('uploads')
        dir.forEach(file => {
            fs.unlink(`uploads/${file}`)
        })
        return new Promise(resolve => {
            return resolve({
                success: true
            })
        })
    }
}
