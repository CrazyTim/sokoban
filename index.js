import data from './levels.js';
import * as util from './util.js';
/*

todo:

- store state in local storage.

- take screen shots of rooms so easier to piece them together.

- convert to class so easier to expose methods and debug.

- rename 'level' to 'room'.

- tweak push-down img:
  - move to bottom edge
  - make head wider
  - adjust face perspective

- add physical boundries inside a room that you can't push over (groves in floor).
  - Use these as a mechanic to sopt user from pushing boxes into adjacent rooms, when it makes sense in the level design.

- idea: allow push boxes between rooms.
  - instead of transitioning (always in one room), keep track of the 'rooms' player is in and
    check move rules against each room (loop). This means we also need to check colisions against objects in both rooms.

*/

window.state = {

  player: {
    id: 0,
    pos: { x:2, y:2}, // Start position.
    name: '',
    face: 'se', // Facing direction (ne|nw|se|sw).
    state: '',
    getLocalPos: function(roomId) {

      if (roomId === undefined) roomId = state.level.id;

      return {
        x: this.pos.x - state.levels[roomId].pos.x,
        y: this.pos.y - state.levels[roomId].pos.y,
      };

    }
  },

  levels: [],

  canInput: false,

  isPendingMove: false,

  moves: [],

  level: {}, // The current room.

}

let _inputStack = [];
const _inputStackLength = 1;

let _stage; // The DOM node we are drawing inside of.
let _world; // The DOM node that wraps everything inside the stage. Used to easily adjust the users viewpoint.
let _mode = null;

const _boardSize = {
  width: 11,
  height: 11,
}

const _squareSize = 60; // Pixels.
const _worldOffset = _squareSize * 1; // Number of squares to offset the world
const _moveDuration = .2;
const _winDuration = 1;
const _roomTransitionDuration = 1;

const entity = { // These entities are stateless and do not change.

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

window.onload = onLoad;
window.onkeydown = onKeyDown;

// Clone room data from `level.js` and set default values.
function roomFactory(i) {

  const l = util.deepCopy(data[i]);

  // Add id to room:
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

  l.moves = [];

  // Create doors if it doesn't exist
  if (!l.doors) l.doors = [];

  // Add id to each door:
  for (let j = 0; j < l.doors.length; j++) {

    const door = l.doors[j];
    door.id = j;
    door.type = 'door';

    if (!door.state) door.state = 'open'; // Open door if not specified.

    // Ensure ground is always under a door (for convenience when joining rooms tolgether):
    const cellIndex = convertPosToMapIndex(door.pos)
    l.map[cellIndex] = entity.ground.id;

  }

  return l;

}

function onLoad() {

  // Add styles for animations:
  var style = document.createElement('style');
  style.innerHTML = `
    .player,
    .box {
      transition: transform ${_moveDuration}s;
    }

    .world {
      transition: transform ${_roomTransitionDuration}s;
    }
  `;
  document.head.appendChild(style);

  // Make stage:
  _stage = document.querySelector('.stage');
  _stage.style.width = (_worldOffset * 2) + (_boardSize.width * _squareSize) + 'px';
  _stage.style.height = (_worldOffset * 2) + (_boardSize.height * _squareSize) + 'px';

  // Make world:
  _world = document.createElement('div');
  _world.classList.add('world')
  _stage.appendChild(_world);

  // Make stage edge:
  const stageEdge = document.createElement('div');
  stageEdge.classList.add('stage-edge')
  stageEdge.style.width = (_boardSize.width * _squareSize) + 'px';
  stageEdge.style.height = (_boardSize.height * _squareSize) + 'px';
  stageEdge.style.transform = `translate(${_worldOffset}px, ${_worldOffset}px)`
  _stage.appendChild(stageEdge);

  // Make each room:
  for (let i = 0; i < data.length; i++) {
    const r = roomFactory(i);
    state.levels.push(r);
    makeRoom(r);
  }

  setEventHandlers();

  changeRoom(0);

  // Make player:
  const div = makeSquare(
    state.player.pos,
    _world,
    [
      'player',
      'player-' + state.player.id,
      'state-idle',
    ],
  );

  updatePlayer();

  state.canInput = true;

}

function onWinEventFactory(roomId) {

  if (roomId === 0) {

    return () => {
      makeRoom(state.levels[1]);
      openDoor(0, 0);
    }

  } else if (roomId === 1) {

    return () => {
      facePlayer('se');
      makeRoom(state.levels[2]);
      openDoor(0, 1);
    }

  } else if (roomId === 2) {

    return () => {
      console.log('end game');
    }

  } else {

    return () => {
      console.error('unhandled `onWin()` event for room ' + roomId);
    }

  }

}

function openDoor(roomIndex, doorIndex) {

  const room = state.levels[roomIndex];
  const door = room.doors[doorIndex];

  // todo: animate door

  door.state = 'open';
  updateDoor(room, door);

}

function facePlayer(direction) {
  state.player.face = direction;
  updatePlayer();
}

function setEventHandlers() {

  const btnExport = document.querySelector('.btn-export');
  btnExport.onclick = e => util.downloadFile(JSON.stringify(state.level), 'application/json', 'level');

  const btnModeClear = document.querySelector('.btn-clear');
  btnModeClear.onclick = e => clearCell();

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

function changeRoom(roomId) {

  state.level = state.levels[roomId];

  // ensure room has been made:
  makeRoom(state.level);

  // Center viewport on the room:
  _world.style.transform = `translate(${_worldOffset - (state.level.pos.x * _squareSize)}px, ${_worldOffset - (state.level.pos.y * _squareSize)}px)`

  // Wait until node has been added to DOM:
  setTimeout(() => {
    state.level.div.classList.remove('hidden');
  }, 50);

}

function onKeyDown(e) {

  //console.log(e);

  if (!state.canInput) return;

  // Wait for prev input to finish:
  _inputStack.push(e);
  if (state.isPendingMove) return;
  _inputStack.shift();

  // Undo:
  if (e.key === 'Delete' || e.key === 'z' || (e.key === 'z' && e.ctrlKey)) {
    undo();
    return;
  }

  // Reset room:
  if (e.key === 'Escape') {
    resetRoom();
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
  let adj = getObject(state.player.getLocalPos(), {x, y});

  if (adj.type === 'door' && adj.state === 'closed') {
    move = false;
  }

  if (adj.type === 'box' || adj.type === 'wall') {
    move = canBePushed(adj, {x, y});
  }

  if (move) {


    { // store history

      const levelsCopy = [];

      state.levels.forEach(l => {
        levelsCopy.push({
          id: l.id,
          boxes: util.deepCopy(l.boxes),
        });
      });

      state.moves.push({
        player: util.deepCopy(state.player),
        levels: levelsCopy,
      });

    }

    if (adj.type === 'box') {
      // Move box:
      adj.x += x;
      adj.y += y;
      updateBox(adj);
      state.player.state = 'push-' + dir;
    }

    // Move player:
    state.player.pos.x += x;
    state.player.pos.y += y;

    enterRoom();

    // Wait for move animation to finish:
    state.isPendingMove = true;
    setTimeout(() => {

      // Change state from 'push' to 'idle' if the box can't be pushed any further.
      let adj = getObject(state.player.getLocalPos(), {x, y});
      if (adj.type !== 'box' || !canBePushed(adj, {x, y}) ) {
        state.player.state = 'idle';
        updatePlayer();
      }

      state.isPendingMove = false;
      checkWin();
      sendQueuedInput();

    }, _moveDuration * 1000);

  }

  updatePlayer(); // We still need to update `player.face` even if we don't move.
  updateGui();

}

// Check if we need to transition to a new room.
// Return the room id if we have moved onto a non-null square in another room, otherwise return null
function enterRoom() {

  const currentRooms = getCurrentRooms();

  // Find the first room that is not the current room and switch to it.
  for (let i = 0; i < currentRooms.length; i++) {

    const r = currentRooms[i];

    if (r.id === state.level.id) continue; // Ignore current room.

    // Get cell in the new room.
    const otherRoomAdj = getObject(state.player.getLocalPos(r.id));

    if (otherRoomAdj.type === entity.empty.type) continue; // Ignore empty (only overlapping cells allow transition between rooms).

    console.log('Enter room ' + r.id);

    changeRoom(r.id);

    return;

  }

}

// Return an array of room ids that the player is currently over.
// The player is considered to be in a room if they are over a cell that != empty.
function getCurrentRooms() {
  // Can use this to loop over each room when checking for collisions,
  // and push boxes between rooms.

  const currentRooms = [];

  state.levels.forEach(l => {

    const playerLocalPos = state.player.getLocalPos(l.id)

    // check out of bounds
    if (playerLocalPos.x >= 0 && playerLocalPos.x < _boardSize.width &&
        playerLocalPos.y >= 0 && playerLocalPos.y < _boardSize.height) {

      const i = convertPosToMapIndex(playerLocalPos);
      const cell = l.map[i];

      // Ensure cell is not empty
      if (cell !== entity.empty.id) {
        currentRooms.push(l);
      }

    }

  });

  return currentRooms;

}

function canBePushed(item, direction = {x:0, y:0}) {

  // Cancel if its a wall:
  if (item.type === 'wall') return false;

  // Prevent boxes from being moved once the level has been won
  // (otherwise player could move boxes out of level)
  if (state.level.hasWon) return false;

  // Cancel if the next adjacent space isn't empty:
  let adj = getObject(item, direction);
  if (adj.type === 'box' || adj.type === 'wall') return false;

  return true

}

function sendQueuedInput() {

  // Truncate stack if its too bog.
  if (_inputStack.length > _inputStackLength) {
    _inputStack.length = _inputStackLength;
  }

  if (_inputStack.length > 0) {
    onKeyDown(_inputStack.shift());
  }

}

function checkWin() {

  if (state.level.hasWon) return;

  for (let i = 0; i < state.level.boxes.length; i++) {
    if(!isBoxOnCrystal(state.level.boxes[i])) return;
  }

  state.canInput = false;
  state.moves = []; // Clear undo.

  state.player.state = 'win';
  updatePlayer();

  // Wait for win animation to finish:
  setTimeout(() => {

    state.level.onWin();
    state.level.hasWon = true;

    state.canInput = true;

    state.player.state = 'idle';

    updateGui();

    updatePlayer(); // Update classes on player div.

  }, _winDuration * 1000);

}

function isBoxOnCrystal(box) {
  return state.level.map[convertPosToMapIndex(box)] === entity.crystal.id;
}

function undo() {

  if (state.moves.length === 0) return;

  undoState();

}

function resetRoom() {

  if (state.moves.length === 0) return;

  state.moves = [ state.moves[0] ]; // Reset to the first move;

  undoState();

}

function undoState() {

  const oldState = state.moves.pop();

  // Restore boxes
  oldState.levels.forEach(l => {
    state.levels[l.id].boxes = l.boxes;
  });
  updateBoxes();

  // Restore player
  state.player = oldState.player;
  updatePlayer();

  enterRoom();

  updateGui();

}

// Return the map index for the given position.
// local coords.
function convertPosToMapIndex(pos) {
  return pos.x + (pos.y * _boardSize.width);
}


// Return either a box object, or an entity object.
// local coords.
function getObject(pos, offset = { x:0, y:0 }) {

  // todo: rename to `getCell()`

  // Check box:
  for (let i = 0; i < state.level.boxes.length; i++) {
    if(state.level.boxes[i].x === pos.x + offset.x &&
       state.level.boxes[i].y === pos.y + offset.y) {
      return state.level.boxes[i];
    }
  }

  // Check door:
  for (let i = 0; i < state.level.doors.length; i++) {
    if(state.level.doors[i].pos.x === pos.x + offset.x &&
       state.level.doors[i].pos.y === pos.y + offset.y) {
      return state.level.doors[i];
    }
  }

  // Check wall:
  let i = convertPosToMapIndex(pos);
  let j;
  if (offset.y === -1) {
    j = i - _boardSize.width;
  } else if (offset.y === 1) {
    j = i + _boardSize.width;
  } else if (offset.x === -1) {
    j = i - 1;
  } else if (offset.x === 1) {
    j = i + 1;
  }

  for (const value of Object.values(entity)) {
    if (value.id === state.level.map[j]) return value;
  }

  return { // Player ran off the edge of board.
    type: 'null',
  };

}

function makeRoom(room) {

  if (!room.div) {

    // Create div to hold room contents:
    room.div = document.createElement('div');

    // *Prepend* to DOM so the first rooms z-index is always above the others.
    // This makes it simpler when designing rooms, in particular overlapping elements like doors.
    _world.prepend(room.div);

    room.div.classList.add('room');
    room.div.classList.add('hidden');
    room.div.classList.add('level-' + room.id);
    room.div.style.transform = `translate(${room.pos.x * _squareSize}px, ${room.pos.y * _squareSize}px)`

    // Make cells:
    for (let y = 0; y < _boardSize.height; y++) {
      for (let x = 0; x < _boardSize.width; x++) {

        const i = convertPosToMapIndex({x,y})

        let cell = room.map[i];

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
          room.div,
          [
            'cell',
            'cell-' + i,
            'type-' + e.id,
          ],
        );

        // Handle cell click:
        div.onmousedown = e => {

          if (_mode === 'player') { // Move player...
            state.player.pos.x = x;
            state.player.pos.y = y;
            updatePlayer();

          } else if (_mode) { // Change cell...
            changeCell(i, _mode);
          }

        }

      }
    }

    // Make boxes:
    room.boxes.forEach(b => {

      makeSquare(
        b,
        room.div,
        [
          'box',
          'box-' + b.id,
          'state-init',
        ],
      );

    });

    // Make labels:
    room.labels.forEach(i => {
      makeLabel(i, room.div);
    });

    // Make doors:
    room.doors.forEach(i => {
      makeDoor(i, room.div);
    });

  }

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

  const div = document.querySelector('.level-' + state.level.id + ' .cell-' + id);

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

  state.level.map[id] = e.id;

}

function clearCell() {
  for (let i = 0; i < state.level.map.length; i++) {
    changeCell(i, 'empty');
  }
}

function moveSquare(className, pos) {
  const d = document.querySelector(className);
  d.style.transform = `translate(${pos.x * _squareSize}px, ${pos.y * _squareSize}px)`
}

function updateBoxes() {
  state.level.boxes.forEach(b => {
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
  // ...
}

function updateBox(b) {
  moveSquare('.level-' + state.level.id + ' .box-' + b.id, b);

  const d = document.querySelector('.level-' + state.level.id + ' .box-' + b.id);

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
  d.style.fontSize = (_squareSize + 10) + 'px';
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

function updateDoor(room, door) {

  const d = document.querySelector('.level-' + room.id + ' .door-' + door.id);

  d.classList.remove('state-open');
  d.classList.remove('state-closed');
  d.classList.add('state-' + door.state);

}

// Un-render rooms that are too far away from the current room.
// This is based on the viewport size, and should improve performance.
function hideDistantRooms() {

  state.levels.forEach(r => {

    if (r.id === state.level.id) return;

    const xOffset = Math.abs(r.pos.x - state.level.pos.x);
    const yOffset = Math.abs(r.pos.y - state.level.pos.y);

    if (xOffset > (_boardSize.width + 2) ||
        yOffset > (_boardSize.height + 2)) {

      // This room is definitely outside the viewport
      r.div.style.display = 'none';

    } else {

      r.div.style.display = '';

    }

  });

}
