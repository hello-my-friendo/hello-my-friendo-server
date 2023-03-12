import 'jest-extended';
import * as request from 'supertest';
import {faker} from '@faker-js/faker';
import {users, usersClient, friendsClient} from '../utils';
import {app} from '../../src/app';

describe('create Friend Request v1', () => {
  function makeCreateFriendRequestUrl() {
    return '/v1/friend-requests';
  }

  let marcusToken = '';
  let pricillaToken = '';

  beforeAll(async () => {
    marcusToken = await usersClient.login(users.marcus);
    pricillaToken = await usersClient.login(users.pricilla);
  });

  test('should return 201', async () => {
    const randomUser = await usersClient.createRandomUserAndDecode();

    const requestBody = {
      to: randomUser.id,
    };

    const response = await request(app)
      .post(makeCreateFriendRequestUrl())
      .set('authorization', `Bearer ${marcusToken}`)
      .send(requestBody);

    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({
      id: expect.toBeString(),
      from: users.marcus.id,
      to: randomUser.id,
      createdAt: expect.toBeDateString(),
      updatedAt: expect.toBeDateString(),
    });
  });

  test('when to is not set should return 400', async () => {
    const requestBody = {};

    const response = await request(app)
      .post(makeCreateFriendRequestUrl())
      .set('authorization', `Bearer ${marcusToken}`)
      .send(requestBody);

    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({
      error: {
        code: 'invalidRequest',
        message: '"to" is required',
      },
    });
  });

  test('when User is not found should return 404', async () => {
    const requestBody = {
      to: faker.datatype.uuid(),
    };

    const response = await request(app)
      .post(makeCreateFriendRequestUrl())
      .set('authorization', `Bearer ${marcusToken}`)
      .send(requestBody);

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual({
      error: {
        code: 'notFound',
        message: `To User ${requestBody.to} not found`,
      },
    });
  });

  test('when already friends should return 409', async () => {
    await friendsClient.createFriendshipAndDecode(
      marcusToken,
      users.pricilla.id,
      pricillaToken
    );

    const requestBody = {
      to: users.pricilla.id,
    };

    const response = await request(app)
      .post(makeCreateFriendRequestUrl())
      .set('authorization', `Bearer ${marcusToken}`)
      .send(requestBody);

    expect(response.statusCode).toBe(409);
    expect(response.body).toStrictEqual({
      error: {
        code: 'alreadyExists',
        message: `Users ${users.marcus.id} and ${users.pricilla.id} are already friends`,
      },
    });

    await friendsClient.deleteFriendshipAndDecode(
      marcusToken,
      users.pricilla.id
    );
  });
});
