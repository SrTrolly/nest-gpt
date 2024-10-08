import { Injectable, NotFoundException } from '@nestjs/common';
import { orthographyCheckUseCase, prosConsDicusserUserCase, prosConsDicusserStreamUserCase, translateUseCase, textToAudioUseCase, audioToTextUseCase, imageGenerationUseCase, generateVariationUseCase } from './use-cases';
import OpenAI from 'openai';
import { AudioToTextDto, ImageGenerationDto, ImageVariationDto, OrthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dtos';
import * as fs from "fs";
import * as path from "path";


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

    async textToAudio({ prompt, voice }: TextToAudioDto) {
        return await textToAudioUseCase(this.openAi, { prompt, voice });
    }

    async textToAudioGetter(id: string) {

        const filePath = path.resolve(__dirname, "../../generated/audios/", `${id}.mp3`);
        const wasFound = fs.existsSync(filePath);

        if (!wasFound) throw new NotFoundException(`File ${id} not found`);

        return filePath;
    }

    async audioToText(audioFile: Express.Multer.File, audioToTextDto: AudioToTextDto) {
        const { prompt } = audioToTextDto;
        return await audioToTextUseCase(this.openAi, { audioFile, prompt });
    }

    async imageGenerationDto(imageGenerationDto: ImageGenerationDto) {
        return await imageGenerationUseCase(this.openAi, { ...imageGenerationDto });
    }

    imageGeneratedGetter(name: string) {
        const filePath = path.resolve("./", "./generated/images/", `${name}`);
        const wasFound = fs.existsSync(filePath);

        if (!wasFound) throw new NotFoundException(`Image ${name} was not found`);
        return filePath;
    }

    async generateImageVariation({ baseImage }: ImageVariationDto) {
        return generateVariationUseCase(this.openAi, { baseImage });
    }

}
