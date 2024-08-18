import { InternalServerErrorException } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs"
import * as sharp from "sharp";


export const downloadImageAsPng = async (url: string, fullPath: boolean = false) => {

    const respose = await fetch(url);

    if (!respose.ok) {
        throw new InternalServerErrorException("Download image was not possible");
    }

    const folderPath = path.resolve("./", "./generated/images/");
    fs.mkdirSync(folderPath, { recursive: true });

    const imageNamePng = `${new Date().getTime()}.png`;
    const buffer = Buffer.from(await respose.arrayBuffer());

    // fs.writeFileSync(`${folderPath}/${imageNamePng}`, buffer);

    const completePath = path.join(folderPath, imageNamePng)

    await sharp(buffer).png().ensureAlpha().toFile(completePath);

    console.log({ completePath, imageNamePng });

    return fullPath ? completePath : imageNamePng;

}


export const downloadBase64ImageAsPng = async (base64Image: string, fullPath: boolean = false) => {

    // Remover encabezado
    base64Image = base64Image.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Image, 'base64');

    const folderPath = path.resolve('./', './generated/images/');
    fs.mkdirSync(folderPath, { recursive: true });

    const imageNamePng = `${new Date().getTime()}-64.png`;
    const completePath = path.join(folderPath, imageNamePng);

    // Transformar a RGBA, png // Así lo espera OpenAI
    await sharp(imageBuffer)
        .png()
        .ensureAlpha()
        .toFile(path.join(folderPath, imageNamePng));

    return fullPath ? completePath : imageNamePng;

}