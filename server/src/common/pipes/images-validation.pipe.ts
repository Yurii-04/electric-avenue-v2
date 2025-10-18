import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class RequiredFilesPipe implements PipeTransform {
  transform(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ];
    files.forEach((file) => {
      const { mimetype, originalname } = file;

      if (!allowedMimeTypes.includes(mimetype)) {
        throw new BadRequestException(
          `File ${originalname} has invalid type. Only image files are allowed.`,
        );
      }
    });

    return files;
  }
}
