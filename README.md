# Sokoban

## Motivation

My kids found a Sokoban variant on their digital cameras. Annoyingly the game would reset when the device turned off after inactivity, so it was a fun challenge to finish it. Finally we reached the last level and it just gliched and restarted back at the beginning! Not the best ending, so I thought it would be fun to put my own spin on Sokoban and involve the kids in the process.

## Getting started

Clone the repo, install node, then run:

```sh
npm init
npm run start
```

## Notes

- Square size is 20 pixels.
- Level design:
  - When you want a transition point between rooms, overlap 'ground' cells.
  - When placing a door, you only need it in the top-most room.
