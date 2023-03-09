import {Want} from '../models';
import {WantDto} from './want-dto';

class CreateWantResponse {
  readonly want;

  constructor(want: Want) {
    this.want = new WantDto(
      want.id,
      want.userId,
      want.body,
      want.start,
      want.location,
      want.end
    );
  }
}

export {CreateWantResponse};
