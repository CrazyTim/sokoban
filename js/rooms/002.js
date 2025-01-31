export const room = {

  map: [0,1,2,1,1,1,1,0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,1,2,2,1,1,2,2,1,0,0,0,1,3,2,2,2,2,3,1,0,0,0,1,2,2,1,1,2,2,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],

  pos: { x:-1, y:4 },

  startPos: { x:2, y:1 },

  boxes: [
    { x:2, y:3 },
    { x:5, y:3 },
  ],

  labels: [
    {
      pos: { x:0, y:1 },
      width: 2,
      height: 1,
      align: 'right',
    },
  ],

  doors: [
    {
      pos: { x:5, y:5 },
      style: 0,
      horizontal: true,
      state: 'closed',
    },
    {
      pos: { x:2, y:5 },
      style: 0,
      horizontal: true,
      state: 'closed',
    },
  ],

};
