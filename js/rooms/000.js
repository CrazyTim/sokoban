export const room = {

  map: [1,1,1,1,1,1,1,1,0,0,0,1,2,2,2,2,2,2,1,0,0,0,1,2,2,2,2,2,3,1,0,0,0,1,2,2,2,2,2,2,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],

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
      style: 0,
      state: 'closed',
    },
    {
      pos: { x:1, y:4 },
      style: 0,
      horizontal: true,
      state: 'closed',
    },
  ],

};




