import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { GptService } from './gpt.service';
import { OrthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dtos';
import type { Response } from 'express';

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

}
