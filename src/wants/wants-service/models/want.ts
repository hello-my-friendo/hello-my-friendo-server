import {Place} from './place';
import {Visibility} from './visibility';

class Want {
  constructor(
    readonly id: string,
    readonly creatorId: string,
    readonly admins: string[],
    readonly members: string[],
    readonly title: string,
    readonly visibility: Visibility,
    readonly openToOffers: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly when?: Date,
    readonly where?: Place
  ) {}
}

export {Want};
