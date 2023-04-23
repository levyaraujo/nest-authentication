import { SuccessResponseDto } from 'apps/users/src/dto/responses.dto';

export const expectedResponse = {
  data: {
    id: 1,
    email: 'george.bluth@reqres.in',
    first_name: 'George',
    last_name: 'Bluth',
    avatar: 'https://reqres.in/img/faces/1-image.jpg',
  },
  support: {
    url: 'https://reqres.in/#support-heading',
    text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
  },
};

export const expectedResponseId2 = {
  data: {
    id: 2,
    email: 'janet.weaver@reqres.in',
    first_name: 'Janet',
    last_name: 'Weaver',
    avatar: 'https://reqres.in/img/faces/2-image.jpg',
  },
  support: {
    url: 'https://reqres.in/#support-heading',
    text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
  },
};

export const getUserAvatarResponse: SuccessResponseDto = {
  message: 'User avatar retrieved successfully',
  status: 200,
};

export const deleteUserAvatarResponse: SuccessResponseDto = {
  message: 'User avatar deleted successfully',
  status: 200,
};
