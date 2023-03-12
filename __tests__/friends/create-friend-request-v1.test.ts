import 'jest-extended';
import * as request from 'supertest';
import {users, usersClient} from '../utils';
import {app} from '../../src/app';

describe('create friend request v1', () => {
  function makeCreateFriendRequestUrl(to: string) {
    return `/v1/friend-requests/${to}`;
  }

  let marcusToken = '';

  beforeAll(async () => {
    marcusToken = await usersClient.login(
      users.marcus.email,
      users.marcus.password!
    );
  });

  test('should return 201', async () => {
    const randomUser = await usersClient.createRandomUserAndDecode();

    const response = await request(app)
      .post(makeCreateFriendRequestUrl(randomUser.id))
      .set('authorization', `Bearer ${marcusToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({
      id: expect.toBeString(),
      from: users.marcus.id,
      to: randomUser.id,
      seen: false,
      createdAt: expect.toBeDateString(),
      updatedAt: expect.toBeDateString(),
    });
  });
});
