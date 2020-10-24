// empty: 0
// wall: 1
// ground: 2
// crystal: 3

export default [

  { // Level 1
    map: [1,1,1,1,1,1,1,1,0,0,0,1,2,2,2,2,2,2,1,0,0,0,1,2,2,2,2,2,3,1,0,0,0,1,2,2,2,2,2,2,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
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
        text: '01',
        pos: {x:0, y:0},
        width: 2,
        height: 1,
        align: 'left',
      },
    ],
  },

  { // Level 2
    "map": [0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,3,1,0,0,0,0,0,1,1,1,1,2,1,0,0,0,0,0,1,3,2,2,2,1,1,1,0,0,0,1,1,1,2,2,2,3,1,0,0,0,0,0,1,2,1,1,1,1,0,0,0,0,0,1,3,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    "startPos": {
      "x": 4,
      "y": 4
    },
    "boxes": [
      { x:3, y:3 },
      { x:4, y:3 },
      { x:3, y:5 },
      { x:5, y:4 },
    ],
    "labels": [
      {
        "text": "02",
        "pos":
        {
          "x": 0,
          "y": 2
        },
        "width": 2,
        "height": 1,
        "align": "left"
      }
    ],
  },

  { // Level 3
    "map": [0,1,1,1,1,1,1,1,0,0,0,1,1,2,1,2,3,3,1,0,0,0,1,2,2,2,2,2,3,1,0,0,0,1,2,2,2,2,2,2,1,0,0,0,1,1,1,1,2,2,3,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    "startPos": {
      "x": 2,
      "y": 1
    },
    "boxes": [
      { x:2, y:2 },
      { x:3, y:2 },
      { x:4, y:3 },
      { x:5, y:2 },
    ],
    "labels": [
      {
        "text": "03",
        "pos":
        {
          "x": 3,
          "y": 5
        },
        "width": 2,
        "height": 1,
        "align": "left"
      }
    ],
  },

  { // Level 4
    "map": [0,0,1,1,1,1,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,1,1,1,2,2,1,0,0,0,0,0,1,2,2,2,3,1,1,0,0,0,0,1,2,2,3,3,2,1,0,0,0,0,1,2,2,3,3,2,1,0,0,0,0,1,2,2,2,1,1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    "startPos": {
      "x": 3,
      "y": 1
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
        "text": "04",
        "pos":
        {
          "x": 4,
          "y": 0
        },
        "width": 2,
        "height": 1,
        "align": "right"
      }
    ],
  },

  { // Level 5
    "map": [0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,2,2,1,0,0,0,1,1,1,2,2,2,2,1,0,0,0,1,3,2,2,2,1,2,1,0,0,0,1,3,3,2,2,2,2,1,0,0,0,1,1,1,3,2,2,2,1,0,0,0,0,0,1,1,1,2,2,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    "startPos": {
      "x": 6,
      "y": 3
    },
    "boxes": [
      { x:3, y:4 },
      { x:4, y:3 },
      { x:5, y:4 },
      { x:5, y:5 },
    ],
    "labels": [
      {
        "text": "05",
        "pos":
        {
          "x": 6,
          "y": 7
        },
        "width": 2,
        "height": 1,
        "align": "right"
      }
    ],
  },

  { // Level 99
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
        text: '99',
        pos: {x:3, y:0},
        width: 2,
        height: 1,
        align: 'left',
      },
    ],
  },

]; // End
