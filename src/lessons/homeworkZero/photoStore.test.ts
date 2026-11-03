import { expect, test } from 'vitest';
import { isDeletedPhoto, isMissingPhoto, isPhoto, maxPhotoSize, photoPath, photoPrefix, validatePhoto } from './photoStore';
import { expand } from '../../progress';
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

test('deletion requires confirmed object absence, not a generic permission/network error', () => {
  expect(isMissingPhoto({statusCode:'400',message:'Object not found'})).toBe(true);
  for(const error of [null,{statusCode:'403',message:'Forbidden'},{statusCode:'404',message:'Bucket not found'},{message:'Failed to fetch'}]) expect(isMissingPhoto(error)).toBe(false);
});
test('photo deletion marker survives journal expansion and cannot become a preview', () => {
  const marker = {deleted:true,id:'11111111-1111-1111-1111-111111111111',owner:'00000000-0000-0000-0000-000000000001'};
  const key = photoPrefix + marker.id;
  const state = expand({['answers:' + key]:marker});
  expect(isDeletedPhoto(state.answers[key])).toBe(true);
  expect(isPhoto(state.answers[key])).toBe(false);
  expect(isDeletedPhoto(undefined)).toBe(false);
});
