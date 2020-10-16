let player = {
  pos: {
    x: 0,
    y: 0,
  },
  name: '',
};

let boxes = [];

let boardSize = {
  width: 11,
  height: 10,
}

squareSize = 30; // Pixels.

let container; // The DOM node we are drawing inside of.

let levels = [

  { // Level 1
    map: [0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,2,2,1,0,0,0,0,1,2,2,2,2,2,1,1,1,1,0,1,2,2,2,1,2,2,3,2,1,1,1,2,2,1,2,2,2,3,2,2,1,1,1,2,1,2,2,1,3,2,2,1,1,1,2,2,2,2,1,1,1,1,1,1,2,2,2,1,1,1,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    startPos: { x:2, y:7 },
    boxes: [
      { x:2, y:3 },
      { x:4, y:5 },
      { x:5, y:5 }
    ],
  },

];

currentlevel = -1;

let entity = {
  empty: 0,
  wall: 1,
  ground: 2,
  crystal: 3,
}

window.onload = () => {
  container = document.querySelector('body');
  nextlevel();
  drawBoard();
}

function nextlevel() {
  level = levels[++currentlevel];
  player.pos = level.startPos;
  boxes = deepCopy(level.boxes);
}

window.onkeydown = (e) => {

  //console.log(e);

  let x = 0;
  let y = 0;

  // Determine pos offset
  if (e.key === 'ArrowUp') {
    y -= 1;
  } else if (e.key === 'ArrowDown') {
    y += 1;
  } else if (e.key === 'ArrowLeft') {
    x -= 1;
  } else if (e.key === 'ArrowRight') {
    x += 1;
  }

  // Check what is in the adjacent space:
  let adj = getAdjacent(player.pos, {x, y});
  if (adj) {

    // Cancel if its a wall:
    if (adj === 'wall') return;

    // Cancel if the next adjacent space isn't empty:
    let adj2 = getAdjacent(adj, {x, y});
    if (adj2) return;

    adj.x += x;
    adj.y += y;

  }

  // Move player:
  player.pos.x += x;
  player.pos.y += y;

  drawBoard();

  checkWin();

}

function checkWin() {

}

function convertPosToMapIndex(pos) {
  return pos.x + (pos.y * boardSize.width);
}

function getAdjacent(pos, offset) {

  // Check box:
  for (let i = 0; i < boxes.length; i++) {
    if(boxes[i].x === pos.x + offset.x &&
       boxes[i].y === pos.y + offset.y) {
      return boxes[i];
    }
  }

  // Check wall:
  let i = convertPosToMapIndex(pos);
  let j;
  if (offset.y == -1) {
    j = i - boardSize.width;
  } else if (offset.y == 1) {
    j = i + boardSize.width;
  } else if (offset.x == -1) {
    j = i - 1;
  } else if (offset.x == 1) {
    j = i + 1;
  }

  if (level.map[j] === entity.wall) {
    return 'wall';
  }

}

function drawBoard() {

  clear();

  // Draw map:
  for (let y = 0; y < boardSize.height; y++) {
    for (let x = 0; x < boardSize.width; x++) {

      let cell = level.map[ convertPosToMapIndex({x,y}) ];

      let color;
      if (cell === 0) {
        color = 'white';
      } else if (cell === 1) {
        color = 'green';
      } else if (cell === 2) {
        color = 'yellow';
      } else if (cell === 3) {
        color = 'purple';
      }

      //console.log({cell, x, y, color});

      // Draw cell:
      drawBox(
        x,
        y,
        color,
        squareSize,
      );

    }
  }

  // Draw boxes:
  boxes.forEach(b => {
    drawBox(
      b.x,
      b.y,
      'blue',
      squareSize,
    );
  });

  // Draw player:
  drawBox(
    player.pos.x,
    player.pos.y,
    'orange',
    squareSize,
  );

}

function drawBox(xPos, yPos, color, squareSize) {
  let d = document.createElement('div');
  d.style.position = 'absolute';
  d.style.width = squareSize + 'px';
  d.style.height = squareSize + 'px';
  d.style.left = (xPos * squareSize) + 'px';
  d.style.top = (yPos * squareSize) + 'px';
  d.style.backgroundColor = color;
  container.appendChild(d);
}

function clear() {
  container.innerHTML = '';
}

function deepCopy(inObject) {

  let outObject, value, key

  if (typeof inObject !== "object" || inObject === null) {
    return inObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (key in inObject) {
    value = inObject[key]

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopy(value)
  }

  return outObject

}
