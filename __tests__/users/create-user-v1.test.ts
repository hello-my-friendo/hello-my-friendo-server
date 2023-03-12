import 'jest-extended';
import * as request from 'supertest';
import {faker} from '@faker-js/faker';
import {app} from '../../src/app';

describe('create User request v1', () => {
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

  test('when userId is not set should return 400', async () => {
    const requestBody = {
      email: faker.internet.email(),
      name: faker.name.fullName(),
      picture: faker.internet.url(),
    };

    const response = await request(app)
      .post(makeCreateUserUrl())
      .send(requestBody);

    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({
      error: {
        code: 'invalidRequest',
        message: '"userId" is required',
      },
    });
  });

  test('email should be optional', async () => {
    const requestBody = {
      userId: faker.datatype.uuid(),
      name: faker.name.fullName(),
      picture: faker.internet.url(),
    };

    const response = await request(app)
      .post(makeCreateUserUrl())
      .send(requestBody);

    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({
      id: requestBody.userId,
      name: requestBody.name,
      picture: requestBody.picture,
      createdAt: expect.toBeDateString(),
      updatedAt: expect.toBeDateString(),
    });
  });

  test('when email is invalid should return 400', async () => {
    const requestBody = {
      userId: faker.datatype.uuid(),
      email: 'invalid-email',
      name: faker.name.fullName(),
      picture: faker.internet.url(),
    };

    const response = await request(app)
      .post(makeCreateUserUrl())
      .send(requestBody);

    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({
      error: {
        code: 'invalidRequest',
        message: '"email" must be a valid email',
      },
    });
  });

  test('name should be optional', async () => {
    const requestBody = {
      userId: faker.datatype.uuid(),
      email: faker.internet.email(),
      picture: faker.internet.url(),
    };

    const response = await request(app)
      .post(makeCreateUserUrl())
      .send(requestBody);

    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({
      id: requestBody.userId,
      email: requestBody.email,
      picture: requestBody.picture,
      createdAt: expect.toBeDateString(),
      updatedAt: expect.toBeDateString(),
    });
  });

  test('picture should be optional', async () => {
    const requestBody = {
      userId: faker.datatype.uuid(),
      email: faker.internet.email(),
      name: faker.name.fullName(),
    };

    const response = await request(app)
      .post(makeCreateUserUrl())
      .send(requestBody);

    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({
      id: requestBody.userId,
      email: requestBody.email,
      name: requestBody.name,
      createdAt: expect.toBeDateString(),
      updatedAt: expect.toBeDateString(),
    });
  });
});
