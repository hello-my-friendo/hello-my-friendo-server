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
import {FriendRequest} from '../models';

const friendshipRequestConverter: FirestoreDataConverter<FriendRequest> = {
  fromFirestore: function (snapshot) {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      from: data.from,
      to: data.to,
      seen: data.seen,
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
  private readonly friendRequestsCollectionName = 'friend-requests';

  constructor(
    private readonly firestore: Firestore,
    private readonly usersService: UsersService
  ) {}

  async createFriendRequest(from: string, to: string): Promise<FriendRequest> {
    if (await this.getFriendRequestByFromAndTo(from, to)) {
      throw new AlreadyExistsError(
        `friend request from ${from} to ${to} already exists`
      );
    }

    const fromUser = await this.usersService.getUserById(from);

    if (!fromUser) {
      throw new NotFoundError(`from user ${from} not found`);
    }

    const toUser = await this.usersService.getUserById(to);

    if (!toUser) {
      throw new NotFoundError(`to user ${to} not found`);
    }

    const friendshipRequestsCollection = this.firestore.collection(
      this.friendRequestsCollectionName
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const friendshipData: any = {
      from: fromUser.id,
      to: toUser.id,
      seen: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const friendshipRequestDocRef = await friendshipRequestsCollection.add(
      friendshipData
    );

    return (await this.getFriendRequestById(friendshipRequestDocRef.id))!;
  }

  async getFriendRequestById(
    friendshipRequestId: string
  ): Promise<FriendRequest | undefined> {
    const friendRequestSnapshot = await this.firestore
      .doc(`${this.friendRequestsCollectionName}/${friendshipRequestId}`)
      .withConverter(friendshipRequestConverter)
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
      .withConverter(friendshipRequestConverter)
      .get();

    if (friendRequestSnapshot.empty) {
      return;
    }

    return friendRequestSnapshot.docs[0].data();
  }
}

export {FriendsService};
