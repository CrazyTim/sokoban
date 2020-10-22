import levels from './levels.js'

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

let level = {}; // The current level.
let levelIndex = 0;

let history = [];

let stage; // The DOM node we are drawing inside of.

let canInput = true;

const boardSize = {
  width: 11,
  height: 11,
}

const squareSize = 30; // Pixels.

const entity = {
  empty: 0,
  wall: 1,
  ground: 2,
  crystal: 3,
  labelH: 4,
  labelV: 5,
}

window.onload = () => {

  stage = document.querySelector('.stage');
  changeLevel(levelIndex);

  for (let i = 0; i < levels.length; i++) {

    let btn = document.createElement('button');
    btn.classList.add('btn');
    btn.textContent = 'level ' + i;
    btn.onclick = e => {
      changeLevel(i);
    }
    document.querySelector('.buttons').appendChild(btn);

  }

  // Set stage size:
  stage.style.width = boardSize.width * squareSize + 'px';
  stage.style.height = boardSize.height * squareSize + 'px';

  setEventHandlers();

}

function setEventHandlers() {

    // Event handler for btnToggleGrid:
  const btnToggleGrid = document.querySelector('.btnToggleGrid');
  btnToggleGrid.onclick = e => {
    stage.classList.toggle('gridVisible');
  }

  // Event handler for btnModeWall:
  const btnModeWall = document.querySelector('.btnModeWall');
  btnModeWall.onclick = e => {
    resetMode();
    stage.classList.add('modeWall');
  }

  // Event handler for btnModeWall:
  const btnModeGround = document.querySelector('.btnModeGround');
  btnModeGround.onclick = e => {
    resetMode();
    stage.classList.add('modeGround');
  }

}

function resetMode() {
  stage.classList.remove('modeEmpty');
  stage.classList.remove('modeWall');
  stage.classList.remove('modeGround');
  stage.classList.remove('modeCrystal');
}

function changeLevel(l) {

  if (!levels[l]) {
    // todo...
    alert('game over!');
    return;
  }

  canInput = true;
  history = [];
  level = levels[l];
  levelIndex = l;
  state.player.pos.x = level.startPos.x;
  state.player.pos.y = level.startPos.y;
  state.boxes = deepCopy(level.boxes);
  drawBoard();

}

window.onkeydown = (e) => {

  //console.log(e);

  if (!canInput) return;

  // Undo:
  if (e.key === 'Delete' || (e.key === 'z' && e.ctrlKey)) {
    undo();
    return;
  }

  // Restart level:
  if (e.key === 'Escape') {
    changeLevel(levelIndex);
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
    if(!isBoxOnCrystal(state.boxes[i])) return;
  }

  canInput = false;
  setTimeout(() => {
    changeLevel(levelIndex + 1);
  }, 1000);

}

function isBoxOnCrystal(box) {
  return level.map[convertPosToMapIndex(box)] === entity.crystal;
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
      drawSquare(
        {x,y},
        color,
        squareSize,
        'cell',
      );

    }
  }

  // Draw boxes:
  state.boxes.forEach(i => {

    let boxColor = 'blue';
    if (isBoxOnCrystal(i)) boxColor = 'lightpink';

    drawSquare(
      i,
      boxColor,
      squareSize,
      'box',
    );

  });

  // Draw player:
  drawSquare(
    state.player.pos,
    'orange',
    squareSize,
    'person',
  );

  level.labels.forEach(i => {
    drawLabel(i);
  });

}

function drawSquare(pos, color, squareSize, className) {
  let d = document.createElement('div');
  d.style.position = 'absolute';
  d.style.width = squareSize + 'px';
  d.style.height = squareSize + 'px';
  d.style.left = (pos.x * squareSize) + 'px';
  d.style.top = (pos.y * squareSize) + 'px';
  d.style.backgroundColor = color;
  d.classList.add(className);
  stage.appendChild(d);
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
  //d.style.lineHeight = (squareSize - 2) + 'px';
  d.classList.add('label');
  d.classList.add('align-' + label.align);
  stage.appendChild(d);
}

function clear() {
  stage.innerHTML = '';
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
