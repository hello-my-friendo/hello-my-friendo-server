class Want {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly body: string,
    readonly start: Date,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly end?: Date
  ) {}
}

export {Want};
