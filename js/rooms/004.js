export const room = {

  map: [0,0,0,1,1,1,1,1,0,0,0,0,1,1,1,2,2,3,1,0,0,0,0,1,2,2,2,1,3,1,0,0,0,0,1,2,3,2,2,2,1,0,0,0,1,1,2,3,1,2,2,1,1,1,0,2,2,2,2,2,2,2,2,2,2,0,1,1,2,2,2,2,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],

  pos: { x:2, y:14},

  startPos: { x:4, y:1 },

  boxes: [
    { x:3, y:2 },
    { x:3, y:3 },
    { x:4, y:3 },
    { x:5, y:4 },
  ],

  labels: [
    {
      pos: { x:2, y:1 },
      width: 2,
      height: 1,
      align: 'right',
    }
  ],

  doors: [
    {
      pos: { x:0, y:5 },
      style: 0,
      state: 'closed',
    },
    {
      pos: { x:9, y:5 },
      style: 0,
      state: 'closed',
    },
  ],

};
