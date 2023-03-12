import {
  Firestore,
  FieldValue,
  FirestoreDataConverter,
} from '@google-cloud/firestore';
import {UsersService} from '../../users';
import {
  AlreadyExistsError,
  NotFoundError,
  NotImplementedError,
} from '../../errors';
import {Follow, FriendRequest} from '../models';

const friendRequestConverter: FirestoreDataConverter<FriendRequest> = {
  fromFirestore: function (snapshot) {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      from: data.from,
      to: data.to,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toFirestore: function (_want) {
    throw new NotImplementedError();
  },
};

const followConverter: FirestoreDataConverter<Follow> = {
  fromFirestore: function (snapshot) {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      followerId: data.followerId,
      followedId: data.followedId,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toFirestore: function (_want) {
    throw new NotImplementedError();
  },
};

class FriendsService {
  private readonly followsCollectionName = 'follows';
  private readonly deletedFollowsCollectionName = 'follows-deleted';
  private readonly friendRequestsCollectionName = 'friend-requests';
  private readonly deletedFriendRequestsCollectionName =
    'friend-requests-deleted';

  constructor(
    private readonly firestore: Firestore,
    private readonly usersService: UsersService
  ) {}

  async createFriendRequest(from: string, to: string): Promise<FriendRequest> {
    if (await this.areFriends(from, to)) {
      throw new AlreadyExistsError(
        `Users ${from} and ${to} are already friends`
      );
    }

    if (await this.getFriendRequestByFromAndTo(from, to)) {
      throw new AlreadyExistsError(
        `Friend Request from ${from} to ${to} already exists`
      );
    }

    const fromUser = await this.usersService.getUserById(from);

    if (!fromUser) {
      throw new NotFoundError(`From User ${from} not found`);
    }

    const toUser = await this.usersService.getUserById(to);

    if (!toUser) {
      throw new NotFoundError(`To User ${to} not found`);
    }

    const friendshipRequestsCollection = this.firestore.collection(
      this.friendRequestsCollectionName
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const friendshipData: any = {
      from: fromUser.id,
      to: toUser.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const friendshipRequestDocRef = await friendshipRequestsCollection.add(
      friendshipData
    );

    return (await this.getFriendRequestById(friendshipRequestDocRef.id))!;
  }

  async getFriendRequestById(
    friendRequestId: string
  ): Promise<FriendRequest | undefined> {
    const friendRequestSnapshot = await this.firestore
      .doc(`${this.friendRequestsCollectionName}/${friendRequestId}`)
      .withConverter(friendRequestConverter)
      .get();

    if (!friendRequestSnapshot.exists) {
      return;
    }

    return friendRequestSnapshot.data();
  }

  async getFriendRequestByFromAndTo(
    from: string,
    to: string
  ): Promise<FriendRequest | undefined> {
    const friendRequestSnapshot = await this.firestore
      .collection(this.friendRequestsCollectionName)
      .where('from', '==', from)
      .where('to', '==', to)
      .withConverter(friendRequestConverter)
      .limit(1)
      .get();

    if (friendRequestSnapshot.empty) {
      return;
    }

    return friendRequestSnapshot.docs[0].data();
  }

  async deleteFriendRequest(friendRequestId: string) {
    const friendRequest = await this.getFriendRequestById(friendRequestId);

    if (!friendRequest) {
      throw new NotFoundError(`Friend Request ${friendRequestId} not found`);
    }

    await this.firestore.runTransaction(async t => {
      const deletedFriendRequestDocRef = this.firestore.doc(
        `${this.deletedFriendRequestsCollectionName}/${friendRequestId}`
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {id, ...deletedFriendRequestData} = friendRequest;

      t.set(deletedFriendRequestDocRef, deletedFriendRequestData);

      const friendRequestDocRef = this.firestore
        .collection(this.friendRequestsCollectionName)
        .doc(friendRequest.id);

      t.delete(friendRequestDocRef);
    });
  }

  async createFriendship(userId1: string, userId2: string) {
    if (await this.areFriends(userId1, userId2)) {
      throw new AlreadyExistsError(
        `Users ${userId1} and ${userId2} are already friends`
      );
    }

    const user1 = await this.usersService.getUserById(userId1);

    if (!user1) {
      throw new NotFoundError(`userId1 ${userId1} not found`);
    }

    const user2 = await this.usersService.getUserById(userId2);

    if (!user2) {
      throw new NotFoundError(`userId2 ${userId2} not found`);
    }

    const followsCollection = this.firestore.collection(
      this.followsCollectionName
    );

    await this.firestore.runTransaction(async t => {
      const user1FollowDocRef = followsCollection.doc();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user1FollowData: any = {
        followerId: user1.id,
        followedId: user2.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      t.set(user1FollowDocRef, user1FollowData);

      const user2FollowDocRef = followsCollection.doc();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user2FollowData: any = {
        followerId: user2.id,
        followedId: user1.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      t.set(user2FollowDocRef, user2FollowData);
    });
  }

  async deleteFriendship(userId1: string, userId2: string) {
    const user1 = await this.usersService.getUserById(userId1);

    if (!user1) {
      throw new NotFoundError(`userId1 ${userId1} not found`);
    }

    const user2 = await this.usersService.getUserById(userId2);

    if (!user2) {
      throw new NotFoundError(`userId2 ${userId2} not found`);
    }

    if (!(await this.areFriends(userId1, userId2))) {
      throw new NotFoundError(
        `Users ${userId1} and ${userId2} are not friends`
      );
    }

    const followsCollection = this.firestore.collection(
      this.followsCollectionName
    );

    await this.firestore.runTransaction(async t => {
      const user1Follow = await this.getFollowByFromAndTo(user1.id, user2.id);

      if (!user1Follow) {
        throw new Error(
          `user1Follow from ${user1.id} to ${user2.id} not found. This should not happen.`
        );
      }

      const {id: user1FollowId, ...deletedUser1FollowData} = user1Follow;

      const deletedUser1FollowDocRef = this.firestore
        .collection(this.deletedFollowsCollectionName)
        .doc(user1FollowId);

      t.set(deletedUser1FollowDocRef, deletedUser1FollowData);

      const user2Follow = await this.getFollowByFromAndTo(user2.id, user1.id);

      if (!user2Follow) {
        throw new Error(
          `user2Follow from ${user2.id} to ${user1.id} not found. This should not happen.`
        );
      }

      const {id: user2FollowId, ...deletedUser2FollowData} = user2Follow;

      const deletedUser2FollowDocRef = this.firestore
        .collection(this.deletedFollowsCollectionName)
        .doc(user2FollowId);

      t.set(deletedUser2FollowDocRef, deletedUser2FollowData);

      const user1FollowDocRef = followsCollection.doc(user1FollowId);

      t.delete(user1FollowDocRef);

      const user2FollowDocRef = followsCollection.doc(user2FollowId);

      t.delete(user2FollowDocRef);
    });
  }

  private async areFriends(userId1: string, userId2: string): Promise<boolean> {
    return (
      (await this.isFollowing(userId1, userId2)) &&
      (await this.isFollowing(userId2, userId1))
    );
  }

  private async getFollowByFromAndTo(
    followerId: string,
    followedId: string
  ): Promise<Follow | undefined> {
    const followsSnapshot = await this.firestore
      .collection(this.followsCollectionName)
      .where('followerId', '==', followerId)
      .where('followedId', '==', followedId)
      .withConverter(followConverter)
      .limit(1)
      .get();

    if (followsSnapshot.empty) {
      return;
    }

    return followsSnapshot.docs[0].data();
  }

  private async isFollowing(
    followerId: string,
    followedId: string
  ): Promise<boolean> {
    const follow = await this.getFollowByFromAndTo(followerId, followedId);

    if (follow) {
      return true;
    }

    return false;
  }
}

export {FriendsService};
