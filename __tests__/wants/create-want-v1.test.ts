import 'jest-extended';
import * as request from 'supertest';
import {faker} from '@faker-js/faker';
import {users} from '../utils';
import {app} from '../../src/app';

describe('create want v1', () => {
  function makeCreateWantUrl() {
    return '/v1/wants';
  }

  test('when all fields are set should return 201', async () => {
    const requestBody = {
      body: faker.lorem.sentence(),
      start: faker.date.soon(),
      end: faker.date.future(),
    };

    const response = await request(app)
      .post(makeCreateWantUrl())
      .set('authorization', `Bearer ${await users.user1.login()}`)
      .send(requestBody);

    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({
      want: {
        id: expect.toBeString(),
        userId: expect.toBeString(),
        body: requestBody.body,
        start: requestBody.start.toISOString(),
        end: requestBody.end.toISOString(),
      },
    });
  });
});
