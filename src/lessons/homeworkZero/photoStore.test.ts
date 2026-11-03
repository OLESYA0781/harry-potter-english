import { expect, test } from 'vitest';
import { isPhoto, maxPhotoSize, photoPath, validatePhoto } from './photoStore';
test('only supported nonempty photos within 8 MB are accepted', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) expect(() => validatePhoto({ type, size: maxPhotoSize })).not.toThrow();
  for (const file of [{ type: 'image/svg+xml', size: 20 }, { type: 'image/heic', size: 20 }, { type: 'image/png', size: 0 }, { type: 'image/png', size: maxPhotoSize + 1 }]) expect(() => validatePhoto(file)).toThrow();
});
test('cloud metadata must point to its owner and immutable object id', () => {
  const owner = '00000000-0000-0000-0000-000000000001', id = '11111111-1111-1111-1111-111111111111';
  const photo = { owner, id, path: photoPath(owner, id, 'image/jpeg'), name: 'homework.jpg', mime: 'image/jpeg', createdAt: '2026-11-03' };
  expect(isPhoto(photo)).toBe(true);
  expect(isPhoto({ ...photo, path: 'https://external.test/image.jpg' })).toBe(false);
  expect(isPhoto({ ...photo, owner: '22222222-2222-2222-2222-222222222222' })).toBe(false);
  expect(isPhoto({ ...photo, mime: 'text/html' })).toBe(false);
});
