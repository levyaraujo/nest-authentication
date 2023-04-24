# User CRUD API made with NestJS and MongoDB

This NestJS application provides user registration service, allowing users to create accounts and store their personal information in a MongoDB database. After registration, a RabbitMQ message is sent to an email microservice, which sends a verification email to the user's email address.

## Prerequisites

Before you can use this API, you'll need to have the following software installed:

- [Node.js](https://nodejs.org/en/download/) (version 18.12.1 or higher)
- [npm](https://docs.npmjs.com/cli/v8/commands/npm-install) (version 8.19.2 or higher)
- [Docker](https://www.docker.com/get-started) (version 20.10.8 or higher)
- [RabbitMQ](https://www.rabbitmq.com/download.html) (version 3.9.7 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (version 5.0.15 or higher)

## Getting Started 🚀

To get started with the API, follow these steps:

### Docker 🐳

1. Clone this repository or [download](https://github.com/levyaraujo/payever-test/archive/refs/heads/main.zip) the zip file;
2. Unzip the file;
3. Open a terminal window and navigate to the project directory;
4. Run `docker compose up` to start the server and all the required services (RabbitMQ, MongoDB and Email microservice).

## Run the tests 🧪

Unit tests for this API can be run by executing the command `yarn test`. These tests are performed using Jest and cover the API's basic functionality.

## Test the API directly in Postman 👨‍🚀:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/21871412-042ac7c0-808f-4083-9a58-888312934b0c?action=collection%2Ffork&collection-url=entityId%3D21871412-042ac7c0-808f-4083-9a58-888312934b0c%26entityType%3Dcollection%26workspaceId%3D7a8add9c-433f-4f74-b742-a40dcf74d7d1)

## API Endpoints 📡

The following endpoints are available in the API:

API Endpoints 📡
The following endpoints are available in the API:

- `POST` /api/users: create a new user account. The request body should contain the user's first_name, last_name, email and avatar file.
- `GET` /api/user/{userId}: get a user by ID.
- `GET` /api/user/{userId}/avatar: get a user's avatar image.
- `DELETE` /api/user/{userId}/avatar: delete a user's avatar image.

### Create a new user account

- URL: `POST /api/users`
- Description: Creates a new user account with the given details.
- Request Body:
  | Key | Value |
  |--------------|--------------------------|
  | firstName | Spider |
  | lastName | Man |
  | email | spider.man@marvel.com |
  | avatar | [Image File](https://avatarfiles.alphacoders.com/149/thumb-149117.jpg)|
- Response Body:
  ```json
  {
    "firstName": "Spider",
    "lastName": "Man",
    "email": "spider.man@marvel.com",
    "id": "98",
    "createdAt": "2023-04-23T23:25:59.728Z"
  }
  ```

### Get a user by ID

- URL: `GET /api/user/{ObjectId}`
- Description: Gets the user with the specified ID.
- Response Body:

```json
{
  "data": {
    "id": 1,
    "email": "george.bluth@reqres.in",
    "first_name": "George",
    "last_name": "Bluth",
    "avatar": "https://reqres.in/img/faces/1-image.jpg"
  },
  "support": {
    "url": "https://reqres.in/#support-heading",
    "text": "To keep ReqRes free, contributions towards server costs are appreciated!"
  }
}
```

### Get a user avatar image

- URL: `GET /api/user/{ObjectId}/avatar`
- Description: Get the user avatar with specified ObjectId
- Response:
  [User avatar image](https://pfphunt.com/wp-content/uploads/Batman-Profile-Picture.png)

### Delete a user avatar

- URL: `DELETE /api/user/{ObjectId}/avatar`
- Description: Delete the user avatar with specified ObjectId
- Response Body:

```json
{
  "message": "User avatar deleted successfully",
  "status": 200
}
```
