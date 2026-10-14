import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTrack, progress, updateTask, addTask, removeTask, validTrack } from '../src/core.js';

test('a preset creates six useful weeks with trackable tasks', () => {
  const track = makeTrack({ programId: 'frontend' }, 'demo');
  assert.equal(track.weeks.length, 6);
  assert.equal(progress(track).percent, 0);
  assert.equal(progress(track).total, 18);
  assert.equal(validTrack(track), true);
});

test('custom weeks are bounded and progress follows edits', () => {
  const track = makeTrack({ title: 'Learn sketching', weeks: 3 }, 'custom');
  const weekId = track.weeks[0].id;
  const added = addTask(track, weekId, 'Draw ten circles', 'new');
  const checked = updateTask(added, weekId, 'new', true);
  assert.equal(progress(checked).done, 1);
  assert.equal(removeTask(checked, weekId, 'new').weeks[0].tasks.length, 2);
  assert.equal(makeTrack({ weeks: 90 }, 'bounded').weeks.length, 12);
});
