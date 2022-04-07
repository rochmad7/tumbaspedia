import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

export class SuccessResponse {
  message: string;
  data: any;
}

export class ErrorResponse {
  message: string;
  errors: [string];
}
