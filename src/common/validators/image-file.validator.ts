/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { FileValidator } from '@nestjs/common';

export class ImageFileValidator extends FileValidator {
  constructor() {
    super({});
  }

  isValid(file: any): boolean {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    return allowedMimeTypes.includes(file.mimetype);
  }

  buildErrorMessage(): string {
    return 'Only image files (PNG, JPEG, JPG, GIF, WEBP) are allowed';
  }
}