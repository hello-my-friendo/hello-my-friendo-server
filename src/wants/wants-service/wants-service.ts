import {
  Firestore,
  FieldValue,
  FirestoreDataConverter,
} from '@google-cloud/firestore';
import * as geofire from 'geofire-common';
import {NotImplementedError} from '../../errors';
import {CreateWantOptions} from './interfaces';
import {Want} from './models';

const wantConverter: FirestoreDataConverter<Want> = {
  fromFirestore: function (snapshot) {
    const data = snapshot.data();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {geohash, ...where} = data.where;

    return new Want(
      snapshot.id,
      data.creatorId,
      data.admins,
      data.members,
      data.title,
      data.visibility,
      data.openToOffers,
      data.createdAt.toDate(),
      data.updatedAt.toDate(),
      data.when.toDate(),
      where
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toFirestore: function (_want) {
    throw new NotImplementedError();
  },
};

class WantsService {
  private readonly wantsCollectionName = 'wants';

  constructor(private readonly firestore: Firestore) {}

  async createWant(createWantOptions: CreateWantOptions): Promise<Want> {
    const wantsCollection = this.firestore.collection(this.wantsCollectionName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wantData: any = {
      creatorId: createWantOptions.creatorId,
      admins: [createWantOptions.creatorId],
      members: [createWantOptions.creatorId],
      title: createWantOptions.title,
      visibility: createWantOptions.visibility,
      openToOffers: createWantOptions.openToOffers,
      when: createWantOptions.when,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (createWantOptions.where) {
      const geohash = geofire.geohashForLocation([
        createWantOptions.where.location.lat,
        createWantOptions.where.location.lng,
      ]);
      wantData.where = {
        ...createWantOptions.where,
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
