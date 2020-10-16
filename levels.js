// empty: 0
// wall: 1
// ground: 2
// crystal: 3

let levels = [

  { // Level 1
    map: [
      0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,
      0,0,4,0,0,0,0,0,0,0,0,
      0,0,1,1,1,1,1,1,0,0,0,
      0,0,1,2,2,2,2,1,0,0,0,
      0,0,1,2,2,2,2,1,0,0,0,
      0,0,1,2,2,2,3,1,0,0,0,
      0,0,1,1,1,1,1,1,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,
    ],
    startPos: {
      x: 3,
      y: 5,
    },
    boxes: [
      { x:4, y:5 },
    ],
    labels: [
      {
        text: '01',
        pos: {x:2, y:2},
        width: 2,
        height: 1,
        align: 'right',
      },
    ],
  },

  { // Level 2
    map: [
      0,4,0,1,1,1,1,0,0,0,0,
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
        text: '02',
        pos: {x:1, y:0},
        width: 2,
        height: 1,
        align: 'right',
      },
    ],
  },

];
