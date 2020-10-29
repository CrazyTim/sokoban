// empty: 0
// wall: 1
// ground: 2
// crystal: 3

export default [

  {
    map: [1,1,1,1,1,1,1,1,0,0,0,1,2,2,2,2,2,2,0,0,0,0,1,2,2,2,2,2,3,1,0,0,0,1,2,2,2,2,2,2,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    startPos: {
      x: 2,
      y: 2,
      face: 'sw',
    },
    boxes: [
      { x:4, y:2 },
    ],
    labels: [
      {
        pos: {x:0, y:0},
        width: 2,
        height: 1,
        align: 'left',
      },
    ],
    doors: [
      {
        pos: { x:7, y:1 },
        state: 'closed',
        style: 0,
       },
    ],
  },

/*
  // todo: needs ladder
  {
    "map": [0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,3,1,0,0,0,0,0,1,1,1,1,2,1,0,0,0,0,0,1,3,2,2,2,1,1,1,0,0,0,1,1,1,2,2,2,3,1,0,0,0,0,0,1,2,1,1,1,1,0,0,0,0,0,1,3,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:1, y:4 },
    "startPos": {
      x: 4,
      y: 4,
      face: 'sw',
    },
    "boxes": [
      { x:3, y:3 },
      { x:4, y:3 },
      { x:3, y:5 },
      { x:5, y:4 },
    ],
    "labels": [
      {
        pos: { x:0, y:2 },
        width: 2,
        height: 1,
        align: "left",
      }
    ],
  },
*/

  {
    "map": [1,1,1,1,0,0,0,0,0,0,0,0,2,3,1,0,0,0,0,0,0,0,1,2,2,1,1,1,0,0,0,0,0,1,3,2,2,2,1,0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0,1,2,2,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:7, y:0 },
    "startPos": {
      x: 2,
      y: 3,
    },
    "boxes": [
      { x:1, y:3 },
      { x:3, y:4 },
    ],
    "labels": [
      {
        pos: { x:4, y:5 },
        width: 2,
        height: 1,
        align: "right",
      }
    ],
  },

  {
    map: [0,1,1,1,1,1,1,0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,1,2,2,1,1,2,2,1,0,0,0,1,3,2,2,2,2,3,1,0,0,0,1,2,2,1,1,2,2,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    startPos: {
      x: 2,
      y: 1,
    },
    boxes: [
      { x:2, y:3 },
      { x:5, y:3 },
    ],
    labels: [
      {
        pos: { x:6, y:1 },
        width: 2,
        height: 1,
        align: 'right',
      },
    ],
  },

  {
    "map": [0,1,1,1,1,1,1,1,0,0,0,1,1,2,1,2,3,3,1,0,0,0,1,2,2,2,2,2,3,1,0,0,0,1,2,2,2,2,2,2,1,0,0,0,1,1,1,1,2,2,3,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    "startPos": {
      x: 2,
      y: 1
    },
    "boxes": [
      { x:2, y:2 },
      { x:3, y:2 },
      { x:4, y:3 },
      { x:5, y:2 },
    ],
    "labels": [
      {
        pos: { x:3, y:5 },
        width: 2,
        height: 1,
        align: "left",
      }
    ],
  },

  {
    "map": [0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,3,3,3,1,0,0,0,1,2,2,1,1,2,2,1,0,0,0,1,2,2,2,2,2,2,1,0,0,0,1,1,2,1,1,2,2,1,0,0,0,0,1,2,2,2,1,2,1,0,0,0,0,1,1,1,2,2,2,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    "startPos": {
      x: 2,
      y: 2,
    },
    "boxes": [
      { x:2, y:3 },
      { x:5, y:2 },
      { x:6, y:5 },
    ],
    "labels": [
      {
        pos: { x:0, y:4 },
        width: 2,
        height: 1,
        align: "left",
      }
    ],
  },

  {
    "map": [0,0,1,1,1,1,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,1,1,1,2,2,1,0,0,0,0,0,1,2,2,2,3,1,1,0,0,0,0,1,2,2,3,3,2,1,0,0,0,0,1,2,2,3,3,2,1,0,0,0,0,1,2,2,2,1,1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    "startPos": {
      "x": 3,
      "y": 1,
    },
    "boxes": [
      { x:4, y:2 },
      { x:3, y:3 },
      { x:2, y:3 },
      { x:2, y:4 },
      { x:2, y:5 },
    ],
    "labels": [
      {
        pos: { x:4, y:0 },
        width: 2,
        height: 1,
        align: "right",
      }
    ],
  },

  {
    "map": [0,1,1,1,1,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,1,1,2,2,1,1,1,0,0,0,0,1,2,2,3,2,2,1,0,0,0,0,1,2,3,2,2,2,1,0,0,0,0,1,2,2,3,2,2,1,0,0,0,0,1,1,1,2,2,1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    "startPos": {
      "x": 1,
      "y": 5,
    },
    "boxes": [
      { x:2, y:3 },
      { x:3, y:4 },
      { x:4, y:5 },
    ],
    "labels": [
      {
        pos: { x:5, y:2 },
        width: 2,
        height: 1,
        align: "right",
      }
    ],
  },

  {
    "map": [1,1,1,1,1,1,1,0,0,0,0,1,2,2,2,2,2,1,0,0,0,0,1,2,2,2,2,2,1,0,0,0,0,1,1,3,3,3,1,1,0,0,0,0,1,2,3,2,3,2,1,0,0,0,0,1,2,2,2,2,2,1,0,0,0,0,1,2,2,1,2,2,1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    "startPos": {
      "x": 3,
      "y": 1,
    },
    "boxes": [
      { x:2, y:2 },
      { x:3, y:2 },
      { x:4, y:2 },
      { x:2, y:5 },
      { x:4, y:5 },
    ],
    "labels": [
      {
        pos: { x:0, y:0 },
        width: 2,
        height: 1,
        align: "left",
      }
    ],
  },

  {
    "map": [0,0,1,1,1,1,0,0,0,0,0,1,1,1,2,2,1,1,1,1,0,0,1,2,2,2,2,2,2,2,1,0,0,1,2,1,2,2,1,2,2,1,0,0,1,2,3,2,3,1,2,2,1,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    "startPos": {
      x: 6,
      y: 4,
      face: 'se',
    },
    "boxes": [
      { x:6, y:2 },
      { x:6, y:3 },
    ],
    "labels": [
      {
        pos: { x:1, y:1 },
        width: 2,
        height: 1,
        align: "right",
      }
    ],
  },

  {
    "map": [0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,2,2,1,0,0,0,1,1,1,2,2,2,2,1,0,0,0,1,3,2,2,2,1,2,1,0,0,0,1,3,3,2,2,2,2,1,0,0,0,1,1,1,3,2,2,2,1,0,0,0,0,0,1,1,1,2,2,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    "startPos": {
      "x": 6,
      "y": 3,
    },
    "boxes": [
      { x:3, y:4 },
      { x:4, y:3 },
      { x:5, y:4 },
      { x:5, y:5 },
    ],
    "labels": [
      {
        pos: { x:6, y:7 },
        width: 2,
        height: 1,
        align: "right",
      }
    ],
  },

  {
    "map": [1,1,1,1,1,1,1,1,0,0,0,1,3,3,2,2,2,2,1,0,0,0,1,3,3,2,2,2,2,1,0,0,0,1,2,1,2,2,2,1,1,0,0,0,1,3,3,2,2,2,2,1,0,0,0,1,3,3,2,2,2,2,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    "startPos": {
      "x": 6,
      "y": 4,
    },
    "boxes": [
      { x:3, y:2 },
      { x:5, y:2 },
      { x:1, y:3 },
      { x:3, y:3 },
      { x:4, y:3 },
      { x:5, y:3 },
      { x:3, y:4 },
      { x:5, y:4 },
    ],
    "labels": [
      {
        pos: { x:6, y:3 },
        width: 2,
        height: 1,
        align: "right",
      }
    ],
  },

  {
    "map": [0,1,1,1,1,1,0,0,0,0,0,1,1,2,3,2,1,0,0,0,0,0,1,2,2,3,2,1,1,0,0,0,0,1,2,2,3,2,2,1,0,0,0,0,1,2,2,3,2,2,1,0,0,0,0,1,2,2,3,2,1,1,0,0,0,0,1,1,2,3,2,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    "startPos": {
      "x": 5,
      "y": 4,
    },
    "boxes": [
      { x:2, y:2 },
      { x:2, y:4 },
      { x:2, y:5 },
      { x:4, y:2 },
      { x:4, y:3 },
      { x:4, y:5 },
    ],
    "labels": [
      {
        pos: { x:5, y:5 },
        width: 2,
        height: 1,
        align: "right",
      }
    ],
  },

  {
    "map": [0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,2,2,2,1,0,0,0,1,3,3,1,2,1,2,1,0,0,0,1,2,2,2,2,2,2,1,0,0,0,1,3,2,2,2,1,2,1,0,0,0,1,3,3,2,2,1,2,1,0,0,0,1,1,1,1,2,2,2,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    "startPos": {
      "x": 6,
      "y": 4,
    },
    "boxes": [
      { x:2, y:4 },
      { x:3, y:5 },
      { x:4, y:5 },
      { x:4, y:2 },
      { x:5, y:3 },
    ],
    "labels": [
      {
        pos: { x:3, y:7 },
        width: 2,
        height: 1,
        align: "left",
      }
    ],
  },

  {
    map: [1,1,1,1,1,0,0,0,0,0,0,1,2,3,3,1,1,1,1,0,0,0,1,2,2,2,2,2,2,1,0,0,0,1,2,2,1,2,1,2,1,0,0,0,1,2,2,2,3,2,2,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    startPos: {
      x:2,
      y:4
    },
    boxes: [
      { x:2, y:2 },
      { x:4, y:3 },
      { x:5, y:4 }
    ],
    labels: [
      {
        pos: {x:4, y:1},
        width: 2,
        height: 1,
        align: 'left',
      },
    ],
  },

  {
    map: [
      0,0,0,1,1,1,1,0,0,0,0,
      1,1,1,1,2,2,1,0,0,0,0,
      1,2,2,2,2,2,1,1,1,1,0,
      1,2,2,2,1,2,2,3,2,1,1,
      1,2,2,1,2,2,2,3,2,2,1,
      1,1,2,1,2,2,1,3,2,2,1,
      1,1,2,2,2,2,1,1,1,1,1,
      1,2,2,2,1,1,1,0,0,0,0,
      1,2,2,2,1,0,0,0,0,0,0,
      1,1,1,1,1,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,
    ],
    startPos: {
      x:2,
      y:7
    },
    boxes: [
      { x:2, y:3 },
      { x:4, y:5 },
      { x:5, y:5 }
    ],
    labels: [
      {
        pos: {x:3, y:0},
        width: 2,
        height: 1,
        align: 'left',
      },
    ],
  },

  {
    "map": [1,1,1,1,1,1,1,0,0,0,0,1,3,2,3,2,3,1,0,0,0,0,1,2,2,2,2,2,1,0,0,0,0,1,3,2,2,2,3,1,0,0,0,0,1,2,2,2,2,2,1,0,0,0,0,1,3,2,3,2,3,1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    pos: { x:0, y:0 },
    "startPos": {
      "x": 3,
      "y": 3,
    },
    "boxes": [
      { x:2, y:2 },
      { x:2, y:3 },
      { x:2, y:4 },
      { x:3, y:2 },
      { x:3, y:4 },
      { x:4, y:2 },
      { x:4, y:3 },
      { x:4, y:4 },
    ],
    "labels": [
      {
        pos: { x:0, y:0 },
        width: 2,
        height: 1,
        align: "left",
      }
    ],
  },

]; // End
