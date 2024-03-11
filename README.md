<img src="https://crazytim.github.io/sokoban/repo-thumbnail.jpg" width="450px" alt="thumbnail">

# Sokoban

## Motivation

My kids found a glitchy Sokoban variant and we were determined to finish it. Then I thought it would be fun to make my own and involve the kids in the process.

My spin on the genre was to have connecting rooms and doors. I also made a basic level-editor.

## Getting Started

Host the files on a web server, or if you have Node.js run:

```sh
npm install
npm start
```

## Notes

- Square size is 20 pixels.
- Level design:
  - When you want a transition point between rooms, overlap 'ground' cells.
  - When placing a door, you only need it in the top-most room.
