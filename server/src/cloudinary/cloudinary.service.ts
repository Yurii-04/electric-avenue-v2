import { BadGatewayException, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary, v2 } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(new BadGatewayException(error.message));
          if (!result) {
            return reject(
              new BadGatewayException('Cloudinary did not return a result'),
            );
          }
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadImages(files: Express.Multer.File[]) {
    if (files.length === 0) return [];

    const result = await Promise.all(
      files.map((file) => this.uploadFile(file)),
    );

    return result.map((res) => ({
      url: res.secure_url,
      publicId: res.public_id,
    }));
  }

  async deleteImages(publicIds: string[]) {
    if (publicIds.length === 0) return;
    await v2.api.delete_resources(publicIds, { invalidate: true });
  }
}
