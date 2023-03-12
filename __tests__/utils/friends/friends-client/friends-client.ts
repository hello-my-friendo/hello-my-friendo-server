import * as request from 'supertest';
import {app} from '../../../../src/app';
import {CreateFriendRequestRequest} from './interfaces';
import {FriendRequest} from '../models';

class FriendsClient {
  async createFriendRequest(
    token: string,
    createFriendRequestRequest: CreateFriendRequestRequest
  ) {
    const requestBody = {
      to: createFriendRequestRequest.to,
    };

    return await request(app)
      .post('/v1/friend-requests')
      .set('authorization', `Bearer ${token}`)
      .send(requestBody);
  }

  async createFriendRequestAndDecode(
    token: string,
    createFriendRequestRequest: CreateFriendRequestRequest
  ) {
    const createFriendRequestResponse = await this.createFriendRequest(
      token,
      createFriendRequestRequest
    );

    expect(createFriendRequestResponse.statusCode).toBe(201);

    const friendRequest: FriendRequest = {
      id: createFriendRequestResponse.body['id'],
      from: createFriendRequestResponse.body['from'],
      to: createFriendRequestResponse.body['to'],
    };

    return friendRequest;
  }

  async acceptFriendRequest(token: string, friendRequestId: string) {
    return await request(app)
      .post(`/v1/friend-requests/${friendRequestId}/accept`)
      .set('authorization', `Bearer ${token}`);
  }

  async acceptFriendRequestAndDecode(token: string, friendRequestId: string) {
    const acceptFriendRequestResponse = await this.acceptFriendRequest(
      token,
      friendRequestId
    );

    expect(acceptFriendRequestResponse.statusCode).toBe(201);
  }

  async deleteFriendRequest(token: string, friendRequestId: string) {
    return await request(app)
      .delete(`/v1/friend-requests/${friendRequestId}`)
      .set('authorization', `Bearer ${token}`);
  }

  async deleteFriendRequestAndDecode(token: string, friendRequestId: string) {
    const acceptFriendRequestResponse = await this.deleteFriendRequest(
      token,
      friendRequestId
    );

    expect(acceptFriendRequestResponse.statusCode).toBe(204);
  }

  async createFriendshipAndDecode(
    fromToken: string,
    to: string,
    toToken: string
  ) {
    const friendRequest = await this.createFriendRequestAndDecode(fromToken, {
      to,
    });

    return await this.acceptFriendRequestAndDecode(toToken, friendRequest.id);
  }

  async deleteFrienship(token: string, userId: string) {
    return await request(app)
      .delete(`/v1/friends?userId=${userId}`)
      .set('authorization', `Bearer ${token}`);
  }

  async deleteFriendshipAndDecode(token: string, userId: string) {
    const deleteFriendshipResponse = await this.deleteFrienship(token, userId);

    expect(deleteFriendshipResponse.statusCode).toBe(204);
  }
}

const friendsClient = new FriendsClient();

export {friendsClient};
