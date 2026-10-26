import { expect, it } from 'vitest';
import { canUseTeacherMode } from './teacherAccess';
it('hides teacher controls for ddarya.rr and preserves other accounts and local lessons', () => {
  expect(canUseTeacherMode({ email: 'ddarya.rr@gmail.com' })).toBe(false);
  expect(canUseTeacherMode({ email: 'DDARYA.RR@gmail.com' })).toBe(false);
  for (const email of ['ddarya.rr@another.example', 'other.ddarya.rr@gmail.com', 'ddarya.rr+other@gmail.com', 'learner@example.test', '', undefined]) {
    expect(canUseTeacherMode({ email })).toBe(true);
  }
  expect(canUseTeacherMode(null)).toBe(true);
  expect(canUseTeacherMode(undefined)).toBe(true);
});
