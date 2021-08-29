import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GalleryDto {
    @ApiProperty({ description: "title is required field" })
    @IsString()
    title: string

    @ApiProperty({ description: 'description is required' })
    @IsString()
    description: string

    @ApiProperty({ description: 'imageUrl is required' })
    @IsString()
    imageUrl: string
}
