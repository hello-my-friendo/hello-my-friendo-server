import {Place, Visibility} from '../models';

interface CreateWantOptions {
  creatorId: string;
  title: string;
  visibility: Visibility;
  openToOffers: boolean;
  when?: Date;
  where?: Place;
}

export {CreateWantOptions};
