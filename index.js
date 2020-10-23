import levels from './levels.js';
import * as util from './util.js';

window.state = {

  player: {
    id: 0,
    pos: {
      x: 0,
      y: 0,
    },
    name: '',
    face: 'left',
  },

  boxes: [],

}

let level = {}; // The current level.
let levelIndex = 0;
let inputStack = [];
const inputStackLength = 1;

let moves = [];

let stage; // The DOM node we are drawing inside of.

let canInput = false;
let canAct = true;

let mode = null;

const boardSize = {
  width: 11,
  height: 11,
}

const squareSize = 60; // Pixels.

const moveDuration = 0.1;
const winDuration = 1;

const entity = {

  empty: {
    id: 0,
    color: 'white',
  },

  wall: {
    id: 1,
    color: 'green',
  },

  ground: {
    id: 2,
    color: '#b8cbbe',
  },

  crystal: {
    id: 3,
    color: 'purple',
  },

}

window.onload = () => {

  // Build level buttons:
  for (let i = 0; i < levels.length; i++) {

    let btn = document.createElement('button');
    btn.classList.add('btn');
    btn.textContent = 'level ' + (i + 1);
    btn.onclick = e => {
      changeLevel(i);
    }
    document.querySelector('.buttons').appendChild(btn);

  }

  // Add styles for animations:
  var style = document.createElement('style');
  style.innerHTML = `
    .player,
    .box {
      transition: transform ${moveDuration}s;
    }
  `;
  document.head.appendChild(style);


  // Define stage:
  stage = document.querySelector('.stage');
  stage.style.width = boardSize.width * squareSize + 'px';
  stage.style.height = boardSize.height * squareSize + 'px';

  setEventHandlers();

  changeLevel(levelIndex);

}

function setEventHandlers() {

   // Event handler for btnToggleGrid:
  const btnToggleGrid = document.querySelector('.btnToggleGrid');
  btnToggleGrid.onclick = e => {
    stage.classList.toggle('gridVisible');
  }

  const btnExport = document.querySelector('.btn-export');
  btnExport.onclick = e => {
    util.downloadFile(JSON.stringify(level), 'application/json', 'level');
  }

  const btnModeEmpty = document.querySelector('.btn-mode-empty');
  btnModeEmpty.onclick = e => {
    setMode('empty');
  }

  const btnModeWall = document.querySelector('.btn-mode-wall');
  btnModeWall.onclick = e => {
    setMode('wall');
  }

  const btnModeGround = document.querySelector('.btn-mode-ground');
  btnModeGround.onclick = e => {
    setMode('ground');
  }

  const btnModeCrystal = document.querySelector('.btn-mode-crystal');
  btnModeCrystal.onclick = e => {
    setMode('crystal');
  }

}

function setMode(m) {
  stage.classList.remove('mode-empty');
  stage.classList.remove('mode-wall');
  stage.classList.remove('mode-ground');
  stage.classList.remove('mode-crystal');
  stage.classList.add('mode-' + m);
  mode = m;

  const modeButtons = document.querySelectorAll('.btn-mode');
  modeButtons.forEach(b => {
    b.classList.remove('active');
  });

  const btn = document.querySelector('.btn-mode-' + m);
  btn.classList.add('active');

}

function changeLevel(l) {

  canInput = true;

  if (!levels[l]) {
    // Game over
    // Todo...
    return;
  }

  moves = [];
  level = levels[l];
  levelIndex = l;
  state.player.pos.x = level.startPos.x;
  state.player.pos.y = level.startPos.y;
  state.boxes = util.deepCopy(level.boxes);

  // Add id to each box.
  for (var i = 0; i < state.boxes.length; i++) {
    state.boxes[i].id = i
  }

  drawBoard();

  // Make boxes:
  state.boxes.forEach(b => {

    makeSquare(
      b,
      squareSize,
      [
        'box',
        'box-' + b.id,
        'state-init',
      ],
    );

  });

  // Make player:
  const div = makeSquare(
    state.player.pos,
    squareSize,
    [
      'player',
      'player-' + state.player.id,
      'state-idle',
    ],
  );

  updateGui();

  updatePlayer(); // Update classes on player div.

}

window.onkeydown = handleKeyDown;

function handleKeyDown(e) {

  //console.log(e);

  if (!canInput) return;

  // Wait for prev input to finish:
  inputStack.push(e);
  if (!canAct) return;
  inputStack.shift();

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
  let face;

  // Determine pos offset
  if (e.key === 'ArrowUp') {
    y -= 1;
    face = 'up';
  } else if (e.key === 'ArrowDown') {
    y += 1;
    face = 'down';
  } else if (e.key === 'ArrowLeft') {
    x -= 1;
    face = 'left';
  } else if (e.key === 'ArrowRight') {
    x += 1;
    face = 'right';
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

  moves.push(util.deepCopy(state));

  if (adj) {
    adj.x += x;
    adj.y += y;
    updateBox(adj);
  }

  // Move player:
  state.player.pos.x += x;
  state.player.pos.y += y;
  state.player.face = face;
  updatePlayer();

  updateGui();

  // Wait for css to animate:
  canAct = false;
  setTimeout(() => {
    canAct = true;
    checkWin();
    sendQueuedInput();
  }, moveDuration * 1000);

}

function sendQueuedInput() {

  // Truncate stack if its too bog.
  if (inputStack.length > inputStackLength) {
    inputStack.length = inputStackLength;
  }

  if (inputStack.length > 0) {
    handleKeyDown(inputStack.shift());
  }

}

function checkWin() {

  for (let i = 0; i < state.boxes.length; i++) {
    if(!isBoxOnCrystal(state.boxes[i])) return;
  }

  canInput = false;
  document.querySelector('.player').classList.add('state-win');

  setTimeout(() => {
    changeLevel(levelIndex + 1);
  }, winDuration * 1000);

}

function isBoxOnCrystal(box) {
  return level.map[convertPosToMapIndex(box)] === entity.crystal.id;
}

function undo() {

  if (moves.length === 0) return;

  state = moves.pop();

  state.boxes.forEach(b => {
    updateBox(b);
  });

  updatePlayer();

  updateGui();

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

  if (level.map[j] === entity.wall.id) {
    return 'wall';
  }

}

function drawBoard() {

  clear();

  // Draw map:
  for (let y = 0; y < boardSize.height; y++) {
    for (let x = 0; x < boardSize.width; x++) {

      const i = convertPosToMapIndex({x,y})

      let cell = level.map[i];

      // Get entity type:
      let e;
      for (const value of Object.values(entity)) {
        if (cell === value.id) {
          e = value;
          break;
        }
      }

      // Draw cell:
      const div = makeSquare(
        {x,y},
        squareSize,
        [
          'cell',
          'cell-' + i,
          'type-' + e.id,
        ],
      );

      div.onclick = (e) => {
        if (mode) {
          changeCell(i, mode);
        }
      }

    }
  }

  level.labels.forEach(i => {
    drawLabel(i);
  });

}

function makeSquare(pos, squareSize, classes) {
  let d = document.createElement('div');
  d.style.position = 'absolute';
  d.style.width = squareSize + 'px';
  d.style.height = squareSize + 'px';
  d.style.transform = `translate(${pos.x * squareSize}px, ${pos.y * squareSize}px)`
  classes.forEach(c => {
    d.classList.add(c);
  });
  stage.appendChild(d);
  return d;
}

function changeCell(id, entityKey) {

  //console.log({id,entityKey});

  const div = document.querySelector('.cell-' + id);

  // Get entity:
  let e;
  for (const [key, value] of Object.entries(entity)) {
    if (entityKey === key) {
      e = value;
      break;
    }
  }

  div.classList.remove('type-0');
  div.classList.remove('type-1');
  div.classList.remove('type-2');
  div.classList.remove('type-3');

  div.classList.add('type-' + e.id);

  level.map[id] = e.id;

}

function moveSquare(id, pos) {
  const d = document.querySelector('.' + id);
  d.style.transform = `translate(${pos.x * squareSize}px, ${pos.y * squareSize}px)`
}

function updatePlayer() {
  moveSquare('player-' + state.player.id, state.player.pos);

  const d = document.querySelector('.player');

  // Ensure we always have a x facing AND a y facing:
  if (state.player.face === 'left' || state.player.face === 'right') {
    d.classList.remove('face-left');
    d.classList.remove('face-right');
  } else {
    d.classList.remove('face-up');
    d.classList.remove('face-down');
  }

  d.classList.add('face-' + state.player.face);

}

function updateGui() {
  document.querySelector('.lable-moves').textContent = 'Moves: ' + moves.length;
}

function updateBox(b) {
  moveSquare('box-' + b.id, b);

  const d = document.querySelector('.box-' + b.id);

  if(isBoxOnCrystal(b)) {
    d.classList.add('state-win');
  } else {
    d.classList.remove('state-win');
  }

}

function drawLabel(label) {
  let d = document.createElement('div');
  d.style.position = 'absolute';
  d.style.width = (squareSize * label.width) + 'px';
  d.style.height = (squareSize * label.height) + 'px';
  d.style.left = (label.pos.x * squareSize) + 'px';
  d.style.top = (label.pos.y * squareSize) + 'px';
  d.textContent = label.text;
  d.style.fontSize = (squareSize - 10) + 'px';
  //d.style.lineHeight = (squareSize - 2) + 'px';
  d.classList.add('label');
  d.classList.add('align-' + label.align);
  stage.appendChild(d);
}

function clear() {
  stage.innerHTML = '';
}
