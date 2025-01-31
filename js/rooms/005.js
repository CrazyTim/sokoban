export const room = {

  map: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,2,2,2,2,2,2,1,0,0,1,1,2,2,3,3,2,2,1,0,0,1,2,2,1,3,3,1,1,1,0,0,1,2,2,2,2,1,1,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],

  pos: { x:-7, y:15},

  startPos: { x:8, y:4 },

  boxes: [
    { x:7, y:4 },
    { x:5, y:6 },
    { x:4, y:6 },
    { x:3, y:6 },
  ],

  labels: [
    {
      pos: { x:6, y:6 },
      width: 2,
      height: 1,
      align: 'right',
    }
  ],

  doors: [
    {
      pos: { x:8, y:2 },
      style: 0,
      horizontal: true,
      state: 'closed',
    },
  ],

};
