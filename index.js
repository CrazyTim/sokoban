function move() {
}

function draw() {
  //drawBoard();
}

function onKeyDown() {
}

// Setup
function init() {

let player = {
  pos: {
    x: 0,
    y: 0,
  },
  name: '',
},
custimation: RandomSource
};

let board = [10,10;




let levels = [
  [0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,2,2,1,0,0,0,0,1,2,2,2,2,2,1,1,1,1,0,1,2,3,2,1,2,2,5,2,1,1,1,2,2,1,2,2,2,5,2,2,1,1,1,2,1,3,3,1,5,2,2,1,1,1,2,2,2,2,1,1,1,1,1,1,2,4,2,1,1,1,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
  [],
  [],
  [],
  [],
];

let space = 0;
let wall = 1;
let ground = 2;
let box = 3;
let player = 4;
let cristayl = 5;
let

function drawBoard(board, xOffset, yOffset, xCount, yCount, squareSize) {

  clear();

  for (let y = 0; y < yCount; y++) {
    for (let x = 0; x < xCount; x++) {

      let cell = board[ (y*xCount) + x ];

      let color;
      if (cell === 0) {
        color = 'red';
      } else if (cell === 1) {
        color = 'green';
      } else if (cell === 2) {
        color = 'yellow';
      } else if (cell === 3) {
        color = 'blue';
      } else if (cell === 4) {
        color = 'orange';
      } else if (cell === 5) {
        color = 'purple';
      }


      console.log({cell, x, y, color});
      drawBox(xOffset, yOffset, x, y, color, squareSize);

    }
  }

}

function drawBox(xOffset, yOffset, xPos, yPos, color, squareSize) {
  let d = document.createElement('div');
  d.style.position = 'absolute';
  d.style.width = squareSize + 'px';
  d.style.height = squareSize + 'px';
  d.style.left = xOffset + (xPos * squareSize) + 'px';
  d.style.top = yOffset + (yPos * squareSize) + 'px';
  d.style.backgroundColor = color;
  document.body.appendChild(d);
}

function clear() {
  document.body.innerHTML = '';
}

drawBoard(level[0], 11, 10);







































// Start game
// todo ...

}
