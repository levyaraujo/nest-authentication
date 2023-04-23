import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { GetUserResponse, UserCreatedResponse } from './dto/responses.dto';
import { UserNotFoundException } from '../CustomExceptions/notFound';
import { AxiosError } from 'axios';

@Injectable()
export class ApiService {
  constructor(private readonly httpService: HttpService) {}
  private apiURL = 'https://reqres.in/api/users';

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

  async create(body: any): Promise<UserCreatedResponse> {
    const response = await lastValueFrom(
      this.httpService.post(this.apiURL, body),
    );
    if (response.status === 201) {
      return response.data;
    }
  }
}
