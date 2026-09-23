export class SlugTakenError extends Error {
  constructor() {
    super('Deze slug bestaat al. Kies een andere.');
  }
}
