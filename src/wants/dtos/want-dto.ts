class WantDto {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly body: string,
    readonly start: Date,
    readonly end?: Date
  ) {}
}

export {WantDto};
