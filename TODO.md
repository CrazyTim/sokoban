# Todo

## High

- Hold down key to move instead of tapping.

- Rename 'level' -> 'room'.

- Improve room transition performance (slow without a GPU).

- Preload all images (prevent flicker).

## Low

- Use icons for edit buttons (instead of text).

- Save game progress in local storage.

- Design: take screen shots of rooms so easier to piece them together.

- Add faux lighting effects (and shadows ??).

- Tweak push-down img:
  - move to bottom edge
  - make head wider
  - adjust face perspective

- Add physical boundaries inside a room that you can't push over (groves in floor).
  - Use these as a mechanic to stop user from pushing boxes into adjacent rooms, when it makes sense in the level design.

- Idea: allow push boxes between rooms.
  - instead of transitioning (always in one room), keep track of the 'rooms' player is in and
    check move rules against each room (loop). This means we also need to check collisions against objects in both rooms.
