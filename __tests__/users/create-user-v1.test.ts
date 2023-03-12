import 'jest-extended';
import * as request from 'supertest';
import {faker} from '@faker-js/faker';
import {app} from '../../src/app';

describe('create friend request v1', () => {
  function makeCreateUserUrl() {
    return '/v1/users';
  }

  test('when all fields are set should return 201', async () => {
    const requestBody = {
      userId: faker.datatype.uuid(),
      email: faker.internet.email(),
      name: faker.name.fullName(),
      picture: faker.internet.url(),
    };

    const response = await request(app)
      .post(makeCreateUserUrl())
      .send(requestBody);

    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({
      id: requestBody.userId,
      email: requestBody.email,
      name: requestBody.name,
      picture: requestBody.picture,
      createdAt: expect.toBeDateString(),
      updatedAt: expect.toBeDateString(),
    });
  });
});
