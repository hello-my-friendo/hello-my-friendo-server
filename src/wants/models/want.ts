import {Location} from '../../common/models';

class Want {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly body: string,
    readonly start: Date,
    readonly location: Location,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly end?: Date
  ) {}
}

export {Want};
