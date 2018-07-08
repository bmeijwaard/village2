namespace Guid {
  export function newGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      return randomHex(c);
    });
  }
  export function empty(): string {
    return '00000000-0000-0000-0000-000000000000';
  }
  export function short(): string {
    return 'xxxxxxxxx'.replace(/[x]/g, (c) => {
      return randomHex(c);
    });
  }
  export function randomHex(c: string): string {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  }
}
