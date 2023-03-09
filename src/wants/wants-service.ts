import {
  Firestore,
  FieldValue,
  FirestoreDataConverter,
} from '@google-cloud/firestore';
import * as geofire from 'geofire-common';
import {Location} from '../common/models';
import {NotImplementedError} from '../errors';
import {Want} from './models';

const wantConverter: FirestoreDataConverter<Want> = {
  fromFirestore: function (snapshot) {
    const data = snapshot.data();

    const end = data.end?.toDate();

    return new Want(
      snapshot.id,
      data.userId,
      data.body,
      data.start.toDate(),
      new Location(data.location.lat, data.location.lng),
      snapshot.createTime.toDate(),
      snapshot.updateTime.toDate(),
      end
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

  async createWant(
    userId: string,
    body: string,
    start: Date,
    location: Location,
    end?: Date
  ): Promise<Want> {
    const wantsCollection = this.firestore.collection(this.wantsCollectionName);

    const geohash = geofire.geohashForLocation([location.lat, location.lng]);

    const wantData = {
      userId,
      body,
      start,
      end,
      location: {
        lat: location.lat,
        lng: location.lng,
        geohash,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

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
