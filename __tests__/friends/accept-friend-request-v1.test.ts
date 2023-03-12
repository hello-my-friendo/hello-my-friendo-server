import 'jest-extended';
import * as request from 'supertest';
import {faker} from '@faker-js/faker';
import {users, usersClient, friendsClient} from '../utils';
import {app} from '../../src/app';

describe('accept Friend Request v1', () => {
  function makeAcceptFriendRequestUrl(friendRequestId: string) {
    return `/v1/friend-requests/${friendRequestId}/accept`;
  }

  let marcusToken = '';
  let pricillaToken = '';
  let carloToken = '';

  beforeAll(async () => {
    marcusToken = await usersClient.login(users.marcus);
    pricillaToken = await usersClient.login(users.pricilla);
    carloToken = await usersClient.login(users.carlo);
  });

  test('should return 201', async () => {
    const friendRequest = await friendsClient.createFriendRequestAndDecode(
      marcusToken,
      {to: users.pricilla.id}
    );

    const response = await request(app)
      .post(makeAcceptFriendRequestUrl(friendRequest.id))
      .set('authorization', `Bearer ${pricillaToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toBeEmpty();

    await friendsClient.deleteFriendshipAndDecode(
      marcusToken,
      users.pricilla.id
    );
  });

  test('when Friend Request is not found should return 404', async () => {
    const friendRequestId = faker.datatype.uuid();

    const response = await request(app)
      .post(makeAcceptFriendRequestUrl(friendRequestId))
      .set('authorization', `Bearer ${marcusToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual({
      error: {
        code: 'notFound',
        message: `Friend Request ${friendRequestId} not found`,
      },
    });
  });

  test('when Friend Request was not sent to user should return 403', async () => {
    const friendRequest = await friendsClient.createFriendRequestAndDecode(
      marcusToken,
      {to: users.pricilla.id}
    );

    const response = await request(app)
      .post(makeAcceptFriendRequestUrl(friendRequest.id))
      .set('authorization', `Bearer ${carloToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body).toStrictEqual({
      error: {
        code: 'forbidden',
        message: `User ${users.carlo.id} cannot accept Friend Request ${friendRequest.id}`,
      },
    });

    await friendsClient.deleteFriendRequestAndDecode(
      marcusToken,
      friendRequest.id
    );
  });
});
