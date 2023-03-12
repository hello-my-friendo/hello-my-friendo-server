import {Place} from './place';
import {Visibility} from './visibility';

interface Want {
  id: string;
  creatorId: string;
  admins: string[];
  members: string[];
  title: string;
  visibility: Visibility;
  openToOffers: boolean;
  createdAt: Date;
  updatedAt: Date;
  when?: Date;
  where?: Place;
}

export {Want};
