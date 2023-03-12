import {
  Firestore,
  FieldValue,
  FirestoreDataConverter,
} from '@google-cloud/firestore';
import * as geofire from 'geofire-common';
import {UsersService} from '../../users';
import {NotFoundError, NotImplementedError} from '../../errors';
import {CreateWantOptions} from './interfaces';
import {Want} from '../models';

const wantConverter: FirestoreDataConverter<Want> = {
  fromFirestore: function (snapshot) {
    const data = snapshot.data();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {geohash, ...where} = data.where;

    return {
      id: snapshot.id,
      creatorId: data.creatorId,
      admins: data.admins,
      members: data.members,
      title: data.title,
      visibility: data.visibility,
      openToOffers: data.openToOffers,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      when: data.when.toDate(),
      where,
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toFirestore: function (_want) {
    throw new NotImplementedError();
  },
};

class WantsService {
  private readonly wantsCollectionName = 'wants';

  constructor(
    private readonly firestore: Firestore,
    private readonly usersService: UsersService
  ) {}

  async createWant(options: CreateWantOptions): Promise<Want> {
    const creator = await this.usersService.getUserById(options.creatorId);

    if (!creator) {
      throw new NotFoundError(`creator ${options.creatorId} not found`);
    }

    const wantsCollection = this.firestore.collection(this.wantsCollectionName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wantData: any = {
      creatorId: creator.id,
      admins: [creator.id],
      members: [creator.id],
      title: options.title,
      visibility: options.visibility,
      openToOffers: options.openToOffers,
      when: options.when,
      where: undefined,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (options.where) {
      const geohash = geofire.geohashForLocation([
        options.where.location.lat,
        options.where.location.lng,
      ]);
      wantData.where = {
        ...options.where,
        geohash,
      };
    }

    const wantDocRef = await wantsCollection.add(wantData);

    return (await this.getWantById(wantDocRef.id))!;
  }

  async getWantById(wantId: string): Promise<Want | undefined> {
    const wantSnapshot = await this.firestore
      .doc(`${this.wantsCollectionName}/${wantId}`)
      .withConverter(wantConverter)
      .get();

    if (!wantSnapshot.exists) {
      return;
    }

    return wantSnapshot.data();
  }
}

export {WantsService};
