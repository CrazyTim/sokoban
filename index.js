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
    face: '',
    state: '',
  },

  boxes: [],

}

let level = {}; // The current level.
let levelIndex = 0;
let inputStack = [];
const inputStackLength = 1;

let moves = [];

let stage; // The DOM node we are drawing inside of.
let _mode = null;

let canInput = false;
let canAct = true;

const boardSize = {
  width: 11,
  height: 11,
}

const squareSize = 60; // Pixels.

const moveDuration = 0.2;
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

  // Compose labels
  for (var i = 0; i < levels.length; i++) {
    levels[i].labels[0].text = util.pad(i + 1, 2);
  }

  // Build level buttons:
  for (let i = 0; i < levels.length; i++) {

    let btn = document.createElement('button');
    btn.classList.add('btn');
    btn.textContent = 'level ' + levels[i].labels[0].text;
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

  const btnExport = document.querySelector('.btn-export');
  btnExport.onclick = e => util.downloadFile(JSON.stringify(level), 'application/json', 'level');

  const btnModeClear = document.querySelector('.btn-clear');
  btnModeClear.onclick = e => empty();

  const btnModeEmpty = document.querySelector('.btn-mode-empty');
  btnModeEmpty.onclick = e => changeMode('empty');

  const btnModeWall = document.querySelector('.btn-mode-wall');
  btnModeWall.onclick = e => changeMode('wall');

  const btnModeGround = document.querySelector('.btn-mode-ground');
  btnModeGround.onclick = e => changeMode('ground');

  const btnModeCrystal = document.querySelector('.btn-mode-crystal');
  btnModeCrystal.onclick = e => changeMode('crystal');

  const btnModePlayer = document.querySelector('.btn-mode-player');
  btnModePlayer.onclick = e => changeMode('player');

}

function changeMode(m) {

  const btn = document.querySelector('.btn-mode-' + m); // Button that was clicked on
  const modeButtons = document.querySelectorAll('.btn-mode');

  if (btn.classList.contains('active')) {

    btn.classList.remove('active');
    stage.classList.remove('edit');
    _mode = null;

  } else {

    modeButtons.forEach(b => {
      b.classList.remove('active');
    });

    btn.classList.add('active');
    stage.classList.add('edit');
    _mode = m;

  }

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
  state.player.state = 'idle';
  state.player.face = level.startPos.face || 'se';
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
  let dir;

  // Determine pos offset
  if (e.key === 'ArrowUp') {
    dir = 'up';
    y -= 1;
    state.player.face = state.player.face.includes('e') ? 'ne' : 'nw';
  } else if (e.key === 'ArrowDown') {
    dir = 'down';
    y += 1;
    state.player.face = state.player.face.includes('e') ? 'se' : 'sw';
  } else if (e.key === 'ArrowLeft') {
    dir = 'left';
    x -= 1;
    state.player.face = 'sw';
  } else if (e.key === 'ArrowRight') {
    dir = 'right';
    x += 1;
    state.player.face = 'se';
  }

  let move = true;
  state.player.state = 'idle';

  if ( x === 0 && y === 0) move = false; // Cancel if no movement.

  // Check movement is valid:
  let adj = getAdjacent(state.player.pos, {x, y});
  if (adj) {
    move = canBePushed(adj, {x, y});
  }

  if (move) { // Check can move. Regardless, we still need to update `player.face`.

    moves.push(util.deepCopy(state));

    updateGui();

    if (adj) {
      adj.x += x;
      adj.y += y;
      updateBox(adj);
      state.player.state = 'push-' + dir;
    }

    // Move player:
    state.player.pos.x += x;
    state.player.pos.y += y;

    // Wait for css to animate:
    canAct = false;
    setTimeout(() => {

      // Change state from 'push' to 'idle' if the box can't be pushed any further.
      let adj = getAdjacent(state.player.pos, {x, y});
      if (!adj || !canBePushed(adj, {x, y}) ) {
        state.player.state = 'idle';
        updatePlayer();
      }

      canAct = true;
      checkWin();
      sendQueuedInput();
    }, moveDuration * 1000);

  }

  updatePlayer();

}

function canBePushed(item, direction = {x:0, y:0}) {

  // Cancel if its a wall:
  if (item === 'wall') return false;

  // Cancel if the next adjacent space isn't empty:
  let adj = getAdjacent(item, direction);
  if (adj) return false;

  return true

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

  state.player.state = 'win';
  updatePlayer();

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

      div.onmousedown = (e) => {
        if (_mode == 'player') {
          console.log(e);
          // Move player:
          state.player.pos.x = x;
          state.player.pos.y = y;

          updatePlayer();

        } else if (_mode) {

          changeCell(i, _mode);

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

function empty() {
  for (let i = 0; i < level.map.length; i++) {
    changeCell(i, 'empty');
  }
}

function moveSquare(id, pos) {
  const d = document.querySelector('.' + id);
  d.style.transform = `translate(${pos.x * squareSize}px, ${pos.y * squareSize}px)`
}

function updatePlayer() {

  moveSquare('player-' + state.player.id, state.player.pos);

  const div = document.querySelector('.player');
  div.classList.remove('face-ne');
  div.classList.remove('face-nw');
  div.classList.remove('face-se');
  div.classList.remove('face-sw');
  div.classList.add('face-' + state.player.face);

  div.classList.remove('state-idle');
  div.classList.remove('state-push-up');
  div.classList.remove('state-push-down');
  div.classList.remove('state-push-left');
  div.classList.remove('state-push-right');
  div.classList.remove('state-win');

  if (state.player.state.includes('push')) {
    div.classList.add('state-' + state.player.state);
  } else if (state.player.state === 'win') {
    div.classList.add('state-win');
  } else {
    div.classList.add('state-idle');
  }

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
  d.style.fontSize = (squareSize - 0) + 'px';
  //d.style.lineHeight = (squareSize - 2) + 'px';
  d.classList.add('label');
  d.classList.add('align-' + label.align);
  stage.appendChild(d);
}

function clear() {
  stage.innerHTML = '';
}
