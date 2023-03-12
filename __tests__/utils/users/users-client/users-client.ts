import axios from 'axios';
import {StatusCodes} from 'http-status-codes';
import * as request from 'supertest';
import {faker} from '@faker-js/faker';
import {app} from '../../../../src/app';
import {config} from '../../../../src/config';
import {User} from '../models';
import {CreateUserRequest} from './interfaces/create-user-request';

class UsersClient {
  private readonly tokens: Map<string, string> = new Map();

  async createUser(createUserRequest: CreateUserRequest) {
    const requestBody = {
      userId: createUserRequest.userId,
      email: createUserRequest.email,
      name: createUserRequest.name,
      picture: createUserRequest.picture,
    };

    return await request(app).post('/v1/users').send(requestBody);
  }

  async createUserAndDecode(createUserRequest: CreateUserRequest) {
    const createUserResponse = await this.createUser(createUserRequest);

    expect(createUserResponse.statusCode).toBe(StatusCodes.CREATED);

    const user: User = {
      id: createUserResponse.body['id'],
      email: createUserResponse.body['email'],
      name: createUserResponse.body['name'],
      picture: createUserResponse.body['picture'],
    };

    return user;
  }

  async createRandomUserAndDecode(): Promise<User> {
    const createUserRequest: CreateUserRequest = {
      userId: faker.datatype.uuid(),
      email: faker.internet.email(),
      name: faker.name.fullName(),
      picture: faker.internet.url(),
    };

    return await this.createUserAndDecode(createUserRequest);
  }

  async getCurrentUser(token: string) {
    return await request(app)
      .get('/v1/user')
      .set('authorization', `Bearer ${token}`);
  }

  async login(email: string, password: string): Promise<string> {
    if (this.tokens.has(email)) {
      return this.tokens.get(email)!;
    }

    const options = {
      method: 'POST',
      url: `${config.auth0.issuerBaseURL}/oauth/token`,
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      data: new URLSearchParams({
        grant_type: 'password',
        username: email,
        password: password,
        audience: config.auth0.audience,
        client_id: config.auth0.testClientId,
        client_secret: config.auth0.testClientSecret,
      }),
    };

    const {
      data: {access_token},
    } = await axios.request(options);

    this.tokens.set(email, access_token);

    const getCurrentUserResponse = await usersClient.getCurrentUser(
      this.tokens.get(email)!
    );

    if (getCurrentUserResponse.statusCode === StatusCodes.NOT_FOUND) {
      const createUserRequest: CreateUserRequest = {
        userId: faker.datatype.uuid(),
        email,
      };

      await this.createUserAndDecode(createUserRequest);
    }

    return this.tokens.get(email)!;
  }
}

const usersClient = new UsersClient();

export {usersClient};