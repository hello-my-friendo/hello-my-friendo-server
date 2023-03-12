import 'jest-extended';
import * as request from 'supertest';
import {faker} from '@faker-js/faker';
import {users, usersClient, friendsClient} from '../utils';
import {app} from '../../src/app';

describe('delete Friend Request v1', () => {
  function makeDeleteFriendRequestUrl(friendRequestId: string) {
    return `/v1/friend-requests/${friendRequestId}`;
  }

  let marcusToken = '';
  let pricillaToken = '';

  beforeAll(async () => {
    marcusToken = await usersClient.login(users.marcus);
    pricillaToken = await usersClient.login(users.pricilla);
  });

  test('should return 204', async () => {
    const randomUser = await usersClient.createRandomUserAndDecode();

    const friendRequest = await friendsClient.createFriendRequestAndDecode(
      marcusToken,
      {to: randomUser.id}
    );

    const response = await request(app)
      .delete(makeDeleteFriendRequestUrl(friendRequest.id))
      .set('authorization', `Bearer ${marcusToken}`);

    expect(response.statusCode).toBe(204);
    expect(response.body).toBeEmpty();
  });

  test('when Friend Request not found should return 404', async () => {
    const friendRequestId = faker.datatype.uuid();

    const response = await request(app)
      .delete(makeDeleteFriendRequestUrl(friendRequestId))
      .set('authorization', `Bearer ${marcusToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual({
      error: {
        code: 'notFound',
        message: `Friend Request ${friendRequestId} not found`,
      },
    });
  });

  test('when Friend Request does not belong to user should return 403', async () => {
    const randomUser = await usersClient.createRandomUserAndDecode();

    const friendRequest = await friendsClient.createFriendRequestAndDecode(
      marcusToken,
      {to: randomUser.id}
    );

    const response = await request(app)
      .delete(makeDeleteFriendRequestUrl(friendRequest.id))
      .set('authorization', `Bearer ${pricillaToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body).toStrictEqual({
      error: {
        code: 'forbidden',
        message: `User ${users.pricilla.id} cannot delete Friend Request ${friendRequest.id}`,
      },
    });
  });
});
