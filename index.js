import data from './levels.js';
import * as util from './util.js';

window.state = {

  player: {
    id: 0,
    pos: { x:2, y:2}, // Start position.
    name: '',
    face: '',
    state: '',
  },

  levelIndex: 0, // current level

  levels: [],

}

let level = {}; // The current level.

let inputStack = [];
const inputStackLength = 1;

let moves = [];

let _stage; // The DOM node we are drawing inside of.
let _mode = null;

let canInput = false;
let canAct = true;

const boardSize = {
  width: 11,
  height: 11,
}

const _squareSize = 60; // Pixels.

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

  // Clone level data into state
  for (let i = 0; i < data.length; i++) {
    state.levels.push(util.deepCopy(data[i]));
    state.levels[i].id = i;
    state.levels[i].labels[0].text = util.pad(i + 1, 2);
  }

  setOnWinEvents();

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
  _stage = document.querySelector('.stage');
  _stage.style.width = boardSize.width * _squareSize + 'px';
  _stage.style.height = boardSize.height * _squareSize + 'px';

  setEventHandlers();

  changeLevel(state.levelIndex);
  makeLevel(state.levels[1]);

  // Make player:
  const div = makeSquare(
    state.player.pos,
    _stage,
    [
      'player',
      'player-' + state.player.id,
      'state-idle',
    ],
  );

  updatePlayer();

}

function setOnWinEvents() {

  state.levels[0].onWin = () => {
      openDoor(state.levels[0], 0);
  };

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
    _stage.classList.remove('edit');
    _mode = null;

  } else {

    modeButtons.forEach(b => {
      b.classList.remove('active');
    });

    btn.classList.add('active');
    _stage.classList.add('edit');
    _mode = m;

  }

}

function openDoor(level, doorIndex) {

  changeCell(level.doors[doorIndex].id, 'ground');

  // animate
  // todo...

}

function changeLevel(l) {

  canInput = true;

  if (!state.levels[l]) {
    // Game over
    // Todo...
    return;
  }

  moves = [];
  level = state.levels[l];
  state.levelIndex = l;
  state.player.state = 'idle';
  state.player.face = level.startPos.face || 'se';

  // Add id to each box.
  for (var i = 0; i < level.boxes.length; i++) {
    level.boxes[i].id = i
  }

  makeLevel(level);

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
  if (e.key === 'Delete' || e.key === 'Shift' || (e.key === 'z' && e.ctrlKey)) {
    undo();
    return;
  }

  // Restart level:
  if (e.key === 'Escape') {
    // todo...
    return;
  }

  let x = 0;
  let y = 0;
  let dir;

  // Determine pos offset
  if (e.key === 'ArrowUp' || e.key === 'w') {
    dir = 'up';
    y -= 1;
    state.player.face = state.player.face.includes('e') ? 'ne' : 'nw';
  } else if (e.key === 'ArrowDown' || e.key === 's') {
    dir = 'down';
    y += 1;
    state.player.face = state.player.face.includes('e') ? 'se' : 'sw';
  } else if (e.key === 'ArrowLeft' || e.key === 'a') {
    dir = 'left';
    x -= 1;
    state.player.face = 'sw';
  } else if (e.key === 'ArrowRight'  || e.key === 'd') {
    dir = 'right';
    x += 1;
    state.player.face = 'se';
  } else {
    return; // ignore all other keys
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

    // pop history
    // todo...
    //moves.push(util.deepCopy(state));

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

  if (level.hasWon) return;

  for (let i = 0; i < level.boxes.length; i++) {
    if(!isBoxOnCrystal(level.boxes[i])) return;
  }

  canInput = false;

  state.player.state = 'win';
  updatePlayer();

  setTimeout(() => {

    level.onWin();
    level.hasWon = true;

    // Prevent boxes from being moved once the level has been won
    // (otherwise player could move boxes out of level)
    // todo...

    canInput = true;

    state.player.state = 'idle';
    state.player.face = level.startPos.face || 'se';

    // Make level visible
    // todo...

    updateGui();

    updatePlayer(); // Update classes on player div.

  }, winDuration * 1000);

}

function isBoxOnCrystal(box) {
  return level.map[convertPosToMapIndex(box)] === entity.crystal.id;
}

function undo() {

  if (moves.length === 0) return;

  state = moves.pop();

  level.boxes.forEach(b => {
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
  for (let i = 0; i < level.boxes.length; i++) {
    if(level.boxes[i].x === pos.x + offset.x &&
       level.boxes[i].y === pos.y + offset.y) {
      return level.boxes[i];
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

function makeLevel(level) {

  if (!level.div) {

    // Create level container div:
    level.div = document.createElement('div');
    _stage.appendChild(level.div);

    level.div.classList.add('level');
    level.div.classList.add('level-' + level.id);
    level.div.style.transform = `translate(${level.pos.x * _squareSize}px, ${level.pos.y * _squareSize}px)`

    // Make cells:
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

        // Make cell:
        const div = makeSquare(
          {x,y},
          level.div,
          [
            'cell',
            'cell-' + i,
            'type-' + e.id,
          ],
        );

        // Handle cell click:
        div.onmousedown = (e) => {
          if (_mode === 'player') {
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

    // Make boxes:
    level.boxes.forEach(b => {

      makeSquare(
        b,
        level.div,
        [
          'box',
          'box-' + b.id,
          'state-init',
        ],
      );

    });

    // Add id to each box.
    for (var i = 0; i < level.boxes.length; i++) {
      level.boxes[i].id = i
    }

    // Make labels:
    level.labels.forEach(i => {
      makeLabel(i, level.div);
    });

  }

  level.div.style.display = 'block';

}

function makeSquare(pos, div, classes) {

  let d = document.createElement('div');
  div.appendChild(d);

  d.style.position = 'absolute';
  d.style.width = _squareSize + 'px';
  d.style.height = _squareSize + 'px';
  d.style.transform = `translate(${pos.x * _squareSize}px, ${pos.y * _squareSize}px)`
  classes.forEach(c => {
    d.classList.add(c);
  });

  return d;

}

function changeCell(id, entityKey) {

  //console.log({id,entityKey});

  const div = document.querySelector('.level-' + level.id + ' .cell-' + id);

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
  d.style.transform = `translate(${pos.x * _squareSize}px, ${pos.y * _squareSize}px)`
}

function updatePlayer() {

  const div = document.querySelector('.player');

  if (!div) return;

  moveSquare('player-' + state.player.id, state.player.pos);

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

function makeLabel(label, div) {

  let d = document.createElement('div');
  div.appendChild(d);

  d.style.position = 'absolute';
  d.style.width = (_squareSize * label.width) + 'px';
  d.style.height = (_squareSize * label.height) + 'px';
  d.style.transform = `translate(${label.pos.x * _squareSize}px, ${label.pos.y * _squareSize}px)`
  d.textContent = label.text;
  d.style.fontSize = (_squareSize - 0) + 'px';
  //d.style.lineHeight = (_squareSize - 2) + 'px';
  d.classList.add('label');
  d.classList.add('align-' + label.align);

}
