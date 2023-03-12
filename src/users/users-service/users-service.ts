import {
  Firestore,
  FieldValue,
  FirestoreDataConverter,
} from '@google-cloud/firestore';
import {Joi} from 'celebrate';
import {AlreadyExistsError, NotImplementedError} from '../../errors';
import {User} from '../models';
import {CreateUserOptions} from './interfaces';

const userConverter: FirestoreDataConverter<User> = {
  fromFirestore: function (snapshot) {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toFirestore: function (_want) {
    throw new NotImplementedError();
  },
};

class UsersService {
  private readonly usersCollectionName = 'users';

  constructor(private readonly firestore: Firestore) {}

  async createUser(options: CreateUserOptions): Promise<User> {
    if (options.email) {
      await this.validateEmailOrThrow(options.email);
    }

    const userDocRef = this.firestore
      .collection(this.usersCollectionName)
      .doc(options.userId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userData: any = {
      email: options.email,
      name: options.name,
      picture: options.picture,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await userDocRef.set(userData);

    return (await this.getUserById(userDocRef.id))!;
  }

  async getUserById(userId: string): Promise<User | undefined> {
    const userSnapshot = await this.firestore
      .doc(`${this.usersCollectionName}/${userId}`)
      .withConverter(userConverter)
      .get();

    if (!userSnapshot.exists) {
      return;
    }

    return userSnapshot.data();
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const userSnapshot = await this.firestore
      .collection(this.usersCollectionName)
      .where('email', '==', email)
      .withConverter(userConverter)
      .get();

    if (userSnapshot.empty) {
      return;
    }

    return userSnapshot.docs[0].data();
  }

  private async validateEmailOrThrow(email: string) {
    const validatedEmail = await Joi.string().email().validateAsync(email);

    if (await this.getUserByEmail(validatedEmail)) {
      throw new AlreadyExistsError('"email" is taken');
    }
  }
}

export {UsersService};
