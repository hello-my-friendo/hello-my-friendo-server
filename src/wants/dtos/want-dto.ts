import {Location} from '../../common/models';

class WantDto {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly body: string,
    readonly start: Date,
    readonly location: Location,
    readonly end?: Date
  ) {}
}

export {WantDto};
