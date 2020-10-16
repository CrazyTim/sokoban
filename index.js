let state = {

  player: {
    pos: {
      x: 0,
      y: 0,
    },
    name: '',
  },

  boxes: [],

}

let currentlevel = 0;

let history = [];

let boardSize = {
  width: 11,
  height: 11,
}

squareSize = 30; // Pixels.

let container; // The DOM node we are drawing inside of.

let canInput = true;

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

let entity = {
  empty: 0,
  wall: 1,
  ground: 2,
  crystal: 3,
  labelH: 4,
  labelV: 5,
}

window.onload = () => {
  container = document.querySelector('body');
  changeLevel(currentlevel);
}

function changeLevel(l) {

  if (!levels[l]) {
    // todo...
  }

  canInput = true;
  history = [];
  level = levels[l];
  state.player.pos.x = level.startPos.x;
  state.player.pos.y = level.startPos.y;
  state.boxes = deepCopy(level.boxes);
  drawBoard();

}

window.onkeydown = (e) => {

  console.log(e);

  if (!canInput) return;

  // Undo:
  if (e.key === 'Delete' || (e.key === 'z' && e.ctrlKey)) {
    undo();
    return;
  }

  if (e.key === 'Escape') {
    changeLevel(currentlevel);
    return;
  }

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

  if ( x === 0 && y === 0) return; // Cancel if no movement.

  // Check movement is valid:
  let adj = getAdjacent(state.player.pos, {x, y});
  if (adj) {

    // Cancel if its a wall:
    if (adj === 'wall') return;

    // Cancel if the next adjacent space isn't empty:
    let adj2 = getAdjacent(adj, {x, y});
    if (adj2) return;

  }

  // Move...

  history.push(deepCopy(state));

  if (adj) {
    adj.x += x;
    adj.y += y;
  }

  // Move player:
  state.player.pos.x += x;
  state.player.pos.y += y;

  drawBoard();

  checkWin();

}

function checkWin() {

  for (let i = 0; i < state.boxes.length; i++) {
    if(level.map[ convertPosToMapIndex(state.boxes[i]) ] !== entity.crystal) return;
  }

  canInput = false;
  setTimeout(() => {
    changeLevel(++currentlevel);
  }, 1000);

}

function undo() {
  if (history.length === 0) return;
  state = history.pop();
  drawBoard();
}

function convertPosToMapIndex(pos) {
  return pos.x + (pos.y * boardSize.width);
}

function getAdjacent(pos, offset) {

  // Check box:
  for (let i = 0; i < state.boxes.length; i++) {
    if(state.boxes[i].x === pos.x + offset.x &&
       state.boxes[i].y === pos.y + offset.y) {
      return state.boxes[i];
    }
  }

  // Check wall:
  let i = convertPosToMapIndex(pos);
  let j;
  if (offset.y === -1) {
    j = i - boardSize.width;
  } else if (offset.y === 1) {
    j = i + boardSize.width;
  } else if (offset.x === -1) {
    j = i - 1;
  } else if (offset.x === 1) {
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
      if (cell === entity.empty) {
        color = 'white';
      } else if (cell === entity.wall) {
        color = 'green';
      } else if (cell === entity.ground) {
        color = 'yellow';
      } else if (cell === entity.crystal) {
        color = 'purple';
      }

      // Draw cell:
      drawBox(
        {x,y},
        color,
        squareSize,
      );

    }
  }

  // Draw boxes:
  state.boxes.forEach(i => {
    drawBox(
      i,
      'blue',
      squareSize,
    );
  });

  // Draw player:
  drawBox(
    state.player.pos,
    'orange',
    squareSize,
  );

  level.labels.forEach(i => {
    drawLabel(i);
  });

}

function drawBox(pos, color, squareSize) {
  let d = document.createElement('div');
  d.style.position = 'absolute';
  d.style.width = squareSize + 'px';
  d.style.height = squareSize + 'px';
  d.style.left = (pos.x * squareSize) + 'px';
  d.style.top = (pos.y * squareSize) + 'px';
  d.style.backgroundColor = color;
  container.appendChild(d);
}

function drawLabel(label) {
  let d = document.createElement('div');
  d.style.position = 'absolute';
  d.style.width = (squareSize * label.width) + 'px';
  d.style.height = (squareSize * label.height) + 'px';
  d.style.left = (label.pos.x * squareSize) + 'px';
  d.style.top = (label.pos.y * squareSize) + 'px';
  d.textContent = label.text;
  d.style.fontSize = (squareSize - 2) + 'px';
  d.style.lineHeight = (squareSize - 2) + 'px';
  d.classList.add('label');
  d.classList.add('align-' + label.align);
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
