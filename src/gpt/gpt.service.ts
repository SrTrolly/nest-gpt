import { Injectable } from '@nestjs/common';
import { orthographyCheckUseCase, prosConsDicusserUserCase, prosConsDicusserStreamUserCase, translateUseCase } from './use-cases';
import { OrthographyDto } from './dtos/orthography.dto';
import OpenAI from 'openai';
import { ProsConsDiscusserDto, TranslateDto } from './dtos';


@Injectable()
export class GptService {

    private openAi = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });


    //Solo va a llamar casos de uso

    async orthographyCheck(orthographyDto: OrthographyDto) {
        return await orthographyCheckUseCase(this.openAi, { prompt: orthographyDto.prompt });
    }

    async prosConsDicusser({ prompt }: ProsConsDiscusserDto) {
        return await prosConsDicusserUserCase(this.openAi, { prompt });
    }
    async prosConsDicusserStream({ prompt }: ProsConsDiscusserDto) {
        return await prosConsDicusserStreamUserCase(this.openAi, { prompt });
    }

    async prosTranslateText({ prompt, lang }: TranslateDto) {
        return await translateUseCase(this.openAi, { prompt, lang });
    }
}
