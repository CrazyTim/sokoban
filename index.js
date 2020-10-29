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
    type: 'empty',
  },

  wall: {
    id: 1,
    type: 'wall',
  },

  ground: {
    id: 2,
    type: 'ground',
  },

  crystal: {
    id: 3,
    type: 'crystal',
  },

}

function levelFactory(i) {

  const l = util.deepCopy(data[i]);

  // Add id to level:
  l.id =  i

  // Add id to each box:
  for (let j = 0; j < l.boxes.length; j++) {
    l.boxes[j].id = j;
    l.boxes[j].type = 'box';
  }

  // Compose text for first label:
  l.labels[0].text = util.pad(i + 1, 2);

  // Set onWin event:
  l.onWin = onWinEventFactory(i);

  if (!l.startPos.face) l.startPos.face = 'se';

  // Create doors if it doesn't exist
  if (!l.doors) l.doors = [];

  // Add id to each door:
  for (let j = 0; j < l.doors.length; j++) {
    l.doors[j].id = j;
    l.doors[j].type = 'door';
  }

  return l;

}

window.onload = () => {

  // Clone level data into state
  for (let i = 0; i < data.length; i++) {
    state.levels.push(levelFactory(i));
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
  _stage = document.querySelector('.stage');
  _stage.style.width = boardSize.width * _squareSize + 'px';
  _stage.style.height = boardSize.height * _squareSize + 'px';

  setEventHandlers();

  changeLevel(0);

  makeLevel(state.levels[1]); // temp

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

function onWinEventFactory(levelId) {

  if (levelId === 0) {

    return () => {

      // Open door:
      const d = level.doors[0];
      d.state = 'open';
      updateDoor(d);

    }

  } else {
    return () => {}
  }

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
  state.player.state = 'idle';
  state.player.face = level.startPos.face || 'se';

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
    restartLevel();
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

  if (adj.type === 'door' && adj.state === 'closed') {
    move = false;
  }

  if (adj.type === 'box' || adj.type === 'wall') {
    move = canBePushed(adj, {x, y});
  }

  if (move) { // Check can move. Regardless, we still need to update `player.face`.

    // pop history
    // todo...
    //moves.push(util.deepCopy(state));

    updateGui();

    if (adj.type === 'box') {
      // Push box:
      adj.x += x;
      adj.y += y;
      updateBox(adj);
      state.player.state = 'push-' + dir;
    }

    if (adj.type === 'door') {
      // Go through door:

      console.log('move off board');

      // Change level
      // todo...

    }

    // Move player:
    state.player.pos.x += x;
    state.player.pos.y += y;

    // Wait for css to animate:
    canAct = false;
    setTimeout(() => {

      // Change state from 'push' to 'idle' if the box can't be pushed any further.
      let adj = getAdjacent(state.player.pos, {x, y});
      if (adj.type !== 'box' || !canBePushed(adj, {x, y}) ) {
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
  if (item.type === 'wall') return false;

  if (level.hasWon) return false;

  // Cancel if the next adjacent space isn't empty:
  let adj = getAdjacent(item, direction);
  if (adj.type === 'box' || adj.type === 'wall') return false;

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

  updateBoxes();

  updatePlayer();

  updateGui();

}

function convertPosToMapIndex(pos) {
  return pos.x + (pos.y * boardSize.width);
}


// Return either a box object, or an entity object.
function getAdjacent(pos, offset) {

  // Check box:
  for (let i = 0; i < level.boxes.length; i++) {
    if(level.boxes[i].x === pos.x + offset.x &&
       level.boxes[i].y === pos.y + offset.y) {
      return level.boxes[i];
    }
  }

  // Check door:
  for (let i = 0; i < level.doors.length; i++) {
    if(level.doors[i].pos.x === pos.x + offset.x &&
       level.doors[i].pos.y === pos.y + offset.y) {
      return level.doors[i];
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

  for (const value of Object.values(entity)) {
    if (value.id === level.map[j]) return value;
  }

  return null; // Shouldn't happen.

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

    // Make labels:
    level.labels.forEach(i => {
      makeLabel(i, level.div);
    });

    // Make doors:
    level.doors.forEach(i => {
      makeDoor(i, level.div);
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

function moveSquare(className, pos) {
  const d = document.querySelector(className);
  d.style.transform = `translate(${pos.x * _squareSize}px, ${pos.y * _squareSize}px)`
}

function updateBoxes() {
  level.boxes.forEach(b => {
    updateBox(b);
  });
}

function updatePlayer() {

  const div = document.querySelector('.player');

  if (!div) return;

  moveSquare('.player-' + state.player.id, state.player.pos);

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
  moveSquare('.level-' + level.id + ' .box-' + b.id, b);

  const d = document.querySelector('.level-' + level.id + ' .box-' + b.id);

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

function makeDoor(door, div) {

  let d = document.createElement('div');
  div.appendChild(d);

  d.style.position = 'absolute';
  d.style.width = (_squareSize * 1) + 'px';
  d.style.height = (_squareSize * 1) + 'px';
  d.style.transform = `translate(${door.pos.x * _squareSize}px, ${door.pos.y * _squareSize}px)`
  d.classList.add('door');
  d.classList.add('door-' + door.id);
  d.classList.add('state-' + door.state);
  d.classList.add('style-' + door.style);

}

function updateDoor(door) {

  const d = document.querySelector('.level-' + level.id + ' .door-' + door.id);

  d.classList.remove('state-open');
  d.classList.remove('state-closed');
  d.classList.add('state-' + door.state);

}

function restartLevel() {

  if (level.hasWon) return; // Todo: replace with a better mechanic?

  state.levels[level.id] = levelFactory(level.id);
  level = state.levels[level.id];
  state.player.pos = util.deepCopy(state.levels[level.id].startPos);
  state.player.state = 'idle';
  state.player.face = level.startPos.face;
  updateBoxes();
  updatePlayer();
}
