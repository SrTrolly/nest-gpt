import { Body, Controller, FileTypeValidator, Get, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GptService } from './gpt.service';
import { AudioToTextDto, ImageGenerationDto, ImageVariationDto, OrthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dtos';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from "multer"


@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) { }

  @Post("orthography-check")
  orthographyCheck(
    @Body() ortographyDto: OrthographyDto
  ) {
    return this.gptService.orthographyCheck(ortographyDto);
  }

  @Post("pros-cons-discusser")
  prosConsDicusser(
    @Body() prosConsDiscusserDto: ProsConsDiscusserDto
  ) {
    return this.gptService.prosConsDicusser(prosConsDiscusserDto);
  }

  @Post("pros-cons-discusser-stream")
  async prosConsDicusserStream(
    @Body() prosConsDiscusserDto: ProsConsDiscusserDto,
    @Res() res: Response,
  ) {
    const stream = await this.gptService.prosConsDicusserStream(prosConsDiscusserDto);

    res.setHeader("Content-Type", "application/json");
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content || "";
      res.write(piece);
    }

    res.end();

  }

  @Post("translate")
  async translate(
    @Body() translateDto: TranslateDto
  ) {
    return this.gptService.prosTranslateText(translateDto);
  }

  @Post("text-to-audio")
  async textToAudioHandler(
    @Body() textToAudioDto: TextToAudioDto,
    @Res() res: Response,
  ) {
    const filePath = await this.gptService.textToAudio(textToAudioDto);

    res.setHeader("Content-type", "audio/mp3");
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Get("text-to-audio/:fileId")
  async textToAudioGetter(
    @Param("fileId") id: string,
    @Res() res: Response
  ) {
    const filePath = await this.gptService.textToAudioGetter(id);
    res.setHeader("Content-type", "audio/mp3");
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Post("audio-to-text")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./generated/uploads",
        filename: (req, file, callback) => {
          const fileExtension = file.originalname.split(".").pop();
          const fileName = `${new Date().getTime()}.${fileExtension}`;
          return callback(null, fileName);
        }
      })
    })
  )
  async audioToText(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1024 * 5, message: "File is bigger than 5 mb" }),
          new FileTypeValidator({ fileType: "audio/*" })
        ]
      })
    ) file: Express.Multer.File,
    @Body() audioToTextDto: AudioToTextDto
  ) {
    return this.gptService.audioToText(file, audioToTextDto);
  }


  @Post("image-generation")
  async imageGeneration(
    @Body() imageGenerationDto: ImageGenerationDto
  ) {
    return await this.gptService.imageGenerationDto(imageGenerationDto);
  }

  @Get("image-generation/:fileName")
  async getGeneratedImage(
    @Param("fileName") name: string,
    @Res() res: Response
  ) {
    const path = this.gptService.imageGeneratedGetter(name);

    res.setHeader("Content-type", "image/png");
    res.status(HttpStatus.OK);
    res.sendFile(path);
  }

  @Post("image-variation")
  async imageVariation(
    @Body() imageVariationDto: ImageVariationDto
  ) {
    return await this.gptService.generateImageVariation(imageVariationDto);
  }



}
