# Sokoban

## Motivation

My kids found a Sokoban variant on their digital cameras. We were determined to finish it, and even more when we discovered that the game would restart if the device went to sleep due to inactivity. Finally we reached the last level, but it just gliched and restarted back at the beginning! Not the best ending, so I thought it would be fun to make my own Sokoban game and involve the kids in the process.

## Getting Started

Host the files on a web server, or if you have Node.js run:

```sh
npm init
npm start
```

## Notes

- Square size is 20 pixels.
- Level design:
  - When you want a transition point between rooms, overlap 'ground' cells.
  - When placing a door, you only need it in the top-most room.
