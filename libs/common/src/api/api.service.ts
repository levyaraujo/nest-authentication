import {
  Injectable,
  InternalServerErrorException,
  Logger,
  PayloadTooLargeException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { GetUserResponse, UserCreatedResponse } from './dto/responses.dto';
import { UserNotFoundException } from '../exceptions/notFound';
import { AxiosError } from 'axios';

@Injectable()
export class ApiService {
  constructor(private readonly httpService: HttpService) {}
  private apiURL = 'https://reqres.in/api/users';
  private readonly logger = new Logger(ApiService.name);

  async get(id: string): Promise<GetUserResponse> {
    const response = await lastValueFrom(
      this.httpService.get(`${this.apiURL}/${id}`),
    ).catch((error: AxiosError) => {
      if (error.response.status === 404) {
        throw new UserNotFoundException();
      }
      throw new InternalServerErrorException();
    });
    return response.data;
  }

  async post(body: any): Promise<UserCreatedResponse> {
    const response = await lastValueFrom(
      this.httpService.post(this.apiURL, body),
    ).catch((error: AxiosError) => {
      if (error.response.status === 413) {
        throw new PayloadTooLargeException();
      }
      this.logger.error(`An error occurred: ${error}`);
      throw new InternalServerErrorException();
    });
    return response.data;
  }
}
