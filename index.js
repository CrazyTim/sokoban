import data from './rooms.js';
import * as util from './util.js';

const _state = {

  player: {
    id: 0,
    div: null, // DOM node representing the player.
    face: 'se', // Facing direction (ne|nw|se|sw).
    pos: {x:0, y:0}, // Position (world coordinates).
    state: 'idle',
  },

  levels: [],

  canInput: false,

  isPendingMove: false, // Keypress mutex.

  history: [], // Undo stack.

  level: {}, // The current room.

}

// Settings:
const _viewportSize = {width: 11, height: 11}
const _squareSize = 60; // Pixels.
const _pixelSize = _squareSize / 20;
const _worldOffset = _squareSize * 1; // Number of squares to offset the world.
const _moveDuration = .15;
const _winDuration = .8;
const _roomTransitionDuration = 1;
const _inputStackLength = 1; // number of keyboard presses to store on the stack.
const _pushFriction = 1.3;

// Constants:
const _startRoomId = 0;
let _world; // The DOM node that holds all the rooms stiched together.
let _viewport; // The DOM node that holds the world. The world is moved inside the viewport as the player transitions from room-to-room.
let _mode = null;
const _lastRoomIds  = [];
const _inputStack = [];
let _tippy = null;
const entity = { // These entity types are stateless in the world and do not change.

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

function getLocalPos(globalPos, roomId) {

  if (roomId === undefined) roomId = _state.level.id;

  return {
    x: globalPos.x - _state.levels[roomId].pos.x,
    y: globalPos.y - _state.levels[roomId].pos.y,
  };

}

function getGlobalPos(pos, roomId) {

  if (roomId === undefined) roomId = _state.level.id;

  return {
    x: pos.x + _state.levels[roomId].pos.x,
    y: pos.y + _state.levels[roomId].pos.y,
  };

}

// Clone a room and set default values.
function roomFactory(roomId) {

  const room = util.deepCopy(data[roomId]);

  room.id = roomId;

  // Give id to each box:
  for (let j = 0; j < room.boxes.length; j++) {
    room.boxes[j].id = j;
    room.boxes[j].type = 'box';
  }

  // Compose text for first label:
  if (room.labels.length) {
    room.labels[0].text = util.pad(roomId + 1, 2);
  }

  // Set onWin event:
  room.onWin = onWinEventFactory(roomId);

  // Create doors if it doesn't exist
  if (!room.doors) room.doors = [];

  // Give id to each door:
  for (let j = 0; j < room.doors.length; j++) {

    const door = room.doors[j];
    door.id = j;
    door.type = 'door';

    if (door.state === undefined) door.state = 'open'; // Default value if not specified.

    if (door.allowPushThrough === undefined) door.allowPushThrough = false; // Default value if not specified.

    // Ensure ground is always under a door (for convenience when joining rooms together):
    const cellIndex = convertPosToMapIndex(door.pos)
    room.map[cellIndex] = entity.ground.id;

  }

  return room;

}

function onLoad(props = {viewport: null}) {

  // Pre-load images to avoid flicker the first time they are used:
  util.preloadImages([
    './img/player-down.svg',
    './img/player-up.svg',
    './img/player-push.svg',
    './img/player-push-up.svg',
    './img/player-push-down.svg',
    './img/player-win.svg',
  ]);

  // Add styles for animations:
  var style = document.createElement('style');
  style.innerHTML = `
    .player {
      transition: transform ${_moveDuration}s ease;
    }

    .box {
      transition: transform ${_moveDuration * _pushFriction}s linear;
    }

    .cell,
    .box,
    .player,
    .door {
      position: absolute;
      width: ${_squareSize}px;
      height: ${_squareSize}px;
    }

    .label {
      padding: ${2 * _pixelSize}px;
    }

    .label span {
      width: ${12 * _pixelSize}px;
      height: ${16 * _pixelSize}px;
      margin-right: ${_pixelSize}px;
    }

    .label .char-1 {
      width: ${8 * _pixelSize};
    }

  `;
  document.head.appendChild(style);

  // Make viewport:
  _viewport = props.viewport;
  _viewport.style.width = (_worldOffset * 2) + (_viewportSize.width * _squareSize) + 'px';
  _viewport.style.height = (_worldOffset * 2) + (_viewportSize.height * _squareSize) + 'px';

  // Make world:
  _world = document.createElement('div');
  _world.classList.add(
    'world',
    'hidden',
  )
  _viewport.appendChild(_world);

  // Make visible once the node has been added to DOM:
  window.requestAnimationFrame(t => {
    _world.classList.remove('hidden');
  });

  makeEditGrid();

  // Make each room:
  for (let i = 0; i < data.length; i++) {

    const r = roomFactory(i);
    _state.levels.push(r);
    makeRoom(r);

    // Make button to edit room:
    let btn = document.createElement('button');
    btn.classList.add(
      'btn',
      'btn-room',
      'btn-room-' + i,
    );
    btn.textContent = 'level ' + util.pad(i,2);
    btn.onclick = async e => {

      changeRoom(i);

      // Move player to room:
      const room = _state.levels[i];
      movePlayer({
        x: room.startPos.x + room.pos.x,
        y: room.startPos.y + room.pos.y,
        duration: _roomTransitionDuration,
      });

    }
    document.querySelector('.buttons').appendChild(btn);

  }

  setEventHandlers();

  changeRoom(_startRoomId, 0);
  _state.level.div.classList.remove('hidden');

  _state.player.pos.x = _state.level.startPos.x;
  _state.player.pos.y = _state.level.startPos.y;

  makePlayer(_state.player.id);

  input(true);

}

function makePlayer(id) {

  _state.player.div = makeSquare(
    _state.player.pos,
    _world,
    [
      'player',
      'player-' + id,
      'state-idle',
    ],
  );

  facePlayer(_state.player.face);
  updatePlayerState(_state.player.state);
  movePlayer({
    ..._state.player.pos,
    duration: 0
  });

}

function makeEditGrid() {
  // Note: the edit grid overlays the viewport and is only used for edit mode.

  // Make viewport edge:
  const editGrid = document.createElement('div');
  editGrid.classList.add('edit-grid')
  editGrid.style.width = (_viewportSize.width * _squareSize) + 'px';
  editGrid.style.height = (_viewportSize.height * _squareSize) + 'px';
  editGrid.style.transform = `translate(${_worldOffset}px, ${_worldOffset}px)`
  _viewport.appendChild(editGrid);

  // Make cells:
  for (let y = 0; y < _viewportSize.height; y++) {
    for (let x = 0; x < _viewportSize.width; x++) {

      const i = convertPosToMapIndex({x,y})

      // Make cell:
      const div = makeSquare(
        {x,y},
        editGrid,
        [
          'cell',
        ],
      );

      // Handle cell click:
      div.onmousedown = e => {

        e.stopPropagation();

        if(!_mode) return;

        if (_mode === 'player') {
          movePlayer({
            x: x + _state.level.pos.x,
            y: y + _state.level.pos.y,
          });

        } else if (_mode) {
          changeCell(i, _mode);
        }

      }

      div.dataset.tippyContent = `${x},${y}`;

    }
  }

  _tippy = tippy.createSingleton(tippy('[data-tippy-content]'), {
    placement: 'bottom',
    arrow: false,
    hideOnClick: false,
    offset: [0, -2],
  });

  _tippy.disable();

}

function onWinEventFactory(roomId) {

  if (roomId === 0) {

    return async () => {
      await wait(.2); // slight delay for the first time we see a door opening.
      openDoor(0, 0);
    }

  } else if (roomId === 1) {

    return async () => {
      // Move viewport back to level 0 to see the door opening:
      input(false);
      facePlayer('sw');
      await moveViewPort(_state.levels[0].pos);
      openDoor(1, 0);
      await wait(1);
      await moveViewPort(_state.levels[1].pos, .8);
      input(true);
    }

  } else if (roomId === 2) {

    return () => {
      facePlayer('se');
      openDoor(0, 2);
    }

  } else if (roomId === 3) {

    return () => {
      facePlayer('sw');
      openDoor(0, 3);
    }

  } else if (roomId === 4) {

    return async () => {
      facePlayer('sw');
      openDoor(0, 4);
      await wait(0.1); // Pause for effect.
      openDoor(1, 4);
    }

  } else {

    return () => {
      console.error('unhandled `onWin()` event for room ' + roomId);
    }

  }

}

async function moveViewPort(pos = {x:0, y:0}, durationSeconds = _roomTransitionDuration, easing = 'ease-in-out') {

  // Animate:
  const translate = `translate(${_worldOffset - (pos.x * _squareSize)}px, ${_worldOffset - (pos.y * _squareSize)}px)`;
  await _world.animate(
    [
      { transform: translate },
    ],
    {
      duration: durationSeconds * 1000,
      easing,
      fill: 'forwards',
    },
  ).finished;

  _world.style.transform = translate; // Preserve the effect after animation has finished.

  hideDistantRooms(); // Todo: test this works.

}

async function movePlayer(props) {

  if (!props.easing) props.easing = 'ease';
  if (!props.duration) props.duration = _moveDuration;

  _state.player.pos.x = props.x;
  _state.player.pos.y = props.y;

  // Animate:
  const translate = `translate(${props.x * _squareSize}px, ${props.y * _squareSize}px)`;
  await _state.player.div.animate(
    [
      { transform: translate },
    ],
    {
      duration: props.duration * 1000,
      easing: props.easing,
      fill: 'forwards',
    },
  ).finished;

}

function openDoor(doorId, roomId) {

  if (roomId === undefined) roomId = _state.level.id;

  const room = _state.levels[roomId];
  const door = room.doors[doorId];

  door.state = 'open';
  updateDoor(door);

}

function facePlayer(direction) {

  _state.player.face = direction;

  const div = _state.player.div;

  if (!div) return;

  div.classList.remove(
    'face-ne',
    'face-nw',
    'face-se',
    'face-sw',
  );

  div.classList.add('face-' + direction);

}

function updatePlayerState(playerState) {

  _state.player.state = playerState;

  const div = _state.player.div;

  if (!div) return;

  div.classList.remove(
    'state-idle',
    'state-push-up',
    'state-push-down',
    'state-push-left',
    'state-push-right',
    'state-win',
  );

  div.classList.add('state-' + playerState);

}

function setEventHandlers() {

  const btnExport = document.querySelector('.btn-export');
  btnExport.onclick = e => util.downloadFile(JSON.stringify(_state.level), 'application/json', 'room-' + _state.level.id);

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

  const btnMoveRoomUp = document.querySelector('.btn-move-room-up');
  btnMoveRoomUp.onclick = e => moveRoom({x:0, y:-1});

  const btnMoveRoomDown = document.querySelector('.btn-move-room-down');
  btnMoveRoomDown.onclick = e => moveRoom({x:0, y:1});

  const btnMoveRoomLeft = document.querySelector('.btn-move-room-left');
  btnMoveRoomLeft.onclick = e => moveRoom({x:-1, y:0});

  const btnMoveRoomRight = document.querySelector('.btn-move-room-right');
  btnMoveRoomRight.onclick = e => moveRoom({x:1, y:0});

}

function moveRoom(offset) {
  const room = _state.level
  room.pos.x += offset.x;
  room.pos.y += offset.y;
  room.div.style.transform = `translate(${room.pos.x * _squareSize}px, ${room.pos.y * _squareSize}px)`
}

function changeMode(m) {

  const btn = document.querySelector('.btn-mode-' + m); // Button that was clicked on
  const modeButtons = document.querySelectorAll('.btn-mode');

  if (btn.classList.contains('active')) {

    btn.classList.remove('active');
    _viewport.classList.remove('edit');
    _mode = null;
    _tippy.disable();

  } else {

    modeButtons.forEach(b => {
      b.classList.remove('active');
    });

    btn.classList.add('active');
    _viewport.classList.add('edit');
    _mode = m;
    _tippy.enable();

  }

}

function changeRoom(roomId, animationDuration) {

  // Set the new room as the current room:
  _state.level = _state.levels[roomId];

  // Make visible once the node has been added to DOM:
  window.requestAnimationFrame(t => {
    _state.level.div.classList.remove('hidden');
  });

  // Center viewport on the room:
  moveViewPort(_state.level.pos, animationDuration, 'ease');

  { // Edit mode - activate button for this level:
    const thisButton = document.querySelector('.btn-room-' + roomId);
    const allButtons = document.querySelectorAll('.btn-room');

    allButtons.forEach(b => {
      b.classList.remove('active');
    });

    thisButton.classList.add('active');
  }

}

async function onKeyDown(e) {

  //console.log(e);

  if (!input()) return;

  // Wait for prev input to finish:
  _inputStack.push(e);
  if (_state.isPendingMove) return;
  _inputStack.shift();

  // Undo:
  if (e.key === 'Delete' || e.key === 'z' || (e.key === 'z' && e.ctrlKey)) {
    undo();
    return;
  }

  // Reset room:
  if (e.key === 'Escape') {
    resetState();
    return;
  }

  let x = 0;
  let y = 0;
  let dir;

  // Determine pos offset
  if (e.key === 'ArrowUp' || e.key === 'w') {
    dir = 'up';
    y -= 1;
    facePlayer( _state.player.face.includes('e') ? 'ne' : 'nw' );
  } else if (e.key === 'ArrowDown' || e.key === 's') {
    dir = 'down';
    y += 1;
    facePlayer( _state.player.face.includes('e') ? 'se' : 'sw' );
  } else if (e.key === 'ArrowLeft' || e.key === 'a') {
    dir = 'left';
    x -= 1;
    facePlayer('sw');
  } else if (e.key === 'ArrowRight'  || e.key === 'd') {
    dir = 'right';
    x += 1;
    facePlayer('se');
  } else {
    return; // ignore all other keys
  }

  let move = true;
  _state.player.state = 'idle';

  if ( x === 0 && y === 0) move = false; // Cancel if no movement.

  // Check movement is valid:
  const playerLocalPos = getLocalPos(_state.player.pos);
  let adj = getObject({
    x: playerLocalPos.x + x,
    y: playerLocalPos.y + y,
  });

  if (adj.type === 'door' && adj.state === 'closed') {
    move = false;
  }

  if (adj.type === 'box' || adj.type === 'wall') {
    move = canBePushed(adj, {x, y});
  }

  if (move) {


    { // Store history (undo)

      const levelsCopy = [];

      _state.levels.forEach(l => {
        levelsCopy.push({
          id: l.id,
          boxes: util.deepCopy(l.boxes),
        });
      });

      _state.history.push({
        player: {
          face: _state.player.face,
          pos: util.deepCopy(_state.player.pos),
          state: _state.player.state,
        },
        levels: levelsCopy,
      });

    }

    let moveAdjust = 1;
    let moveEasing = 'ease';

    if (adj.type === 'box') {
      // Move box:
      adj.x += x;
      adj.y += y;
      updateBox(adj);
      updatePlayerState('push-' + dir);
      moveAdjust = _pushFriction;
      moveEasing = 'linear';
    } else {
      updatePlayerState('idle');
    }

    _state.isPendingMove = true;

    const movePlayerAnimation = movePlayer({
      x: _state.player.pos.x + x,
      y: _state.player.pos.y + y,
      duration: _moveDuration * moveAdjust,
      easing: moveEasing,
    });

    checkChangeRoom();

    await movePlayerAnimation;

    { // Change state from 'push' to 'idle' if the box can't be pushed any further.

      const playerLocalPos = getLocalPos(_state.player.pos);
      let adj = getObject({
        x: playerLocalPos.x + x,
        y: playerLocalPos.y + y,
      });

      if (adj.type !== 'box' || !canBePushed(adj, {x, y}) ) {
        updatePlayerState('idle');
      }

    }

    await checkWin()

    _state.isPendingMove = false;

    { // Send queued input:

      // Truncate stack if its too long.
      if (_inputStack.length > _inputStackLength) {
        _inputStack.length = _inputStackLength;
      }

      if (_inputStack.length > 0) {
        await onKeyDown(_inputStack.shift());
      }

    }

  }

  updateGui();

}

/**
 * Check if we need to transition into a new room.
 * A transition point is where any 'ground' cell in one room overlaps a 'ground' cell in another room.
 */
function checkChangeRoom() {

  const currentRooms = getRoomsAtGlobalPos(_state.player.pos);
  const currentRoomIds = currentRooms.map(room => room.id);

  // Only trigger a room transition if the rooms the player has moved into are different than the last time.
  // This prevents the player constantly switching rooms when moving over identical adjacent transition cells.
  if (util.areArraysIdentical(_lastRoomIds, currentRoomIds)) return;

  // Remember the rooms the player was in for the next time:
  _lastRoomIds.length = 0;
  currentRoomIds.forEach(id => {
    _lastRoomIds.push(id);
  })

  // Find the first (top-most) room that is not the current room and transition into it.
  for (let i = 0; i < currentRooms.length; i++) {

    const r = currentRooms[i];

    if (r.id === _state.level.id) continue; // Ignore current room.

    changeRoom(r.id, _roomTransitionDuration);

    return;

  }

}

/**
 * Return an array of room ids that the player is currently over.
 * The player is considered to be in a room if they are over a cell that != empty.
 */
function getRoomsAtGlobalPos(globalPos) {

  // todo: to push boxes between rooms, use this to loop over each room when checking for collisions.

  const currentRooms = [];

  _state.levels.forEach(room => {

    const pos = getLocalPos(globalPos, room.id)

    // check out of bounds
    if (pos.x >= 0 && pos.x < _viewportSize.width &&
        pos.y >= 0 && pos.y < _viewportSize.height) {

      const cell = room.map[ convertPosToMapIndex(pos) ];

      // Ensure cell is not empty
      if (cell !== entity.empty.id) {
        currentRooms.push(room);
      }

    }

  });

  return currentRooms;

}

function canBePushed(item, direction = {x:0, y:0}) {

  // Cancel if its a wall:
  if (item.type === 'wall') return false;

  // Prevent boxes from being moved once the level has been won
  // (otherwise player could move boxes out of the level)
  if (_state.level.hasWon) return false;

  // Cancel if the box can't be pushed into the next adjacent space...
  const adj = getObject({
    x: item.x + direction.x,
    y: item.y + direction.y,
  });

  if (adj.type === 'box' || adj.type === 'empty' || adj.type === 'wall') {
    return false;
  }

  if (adj.type === 'door') {
    if (adj.state === 'closed') return;
    if (!adj.allowPushThrough) return;
  }

  return true;

}

async function checkWin() {

  if (_state.level.hasWon) return;

  for (let i = 0; i < _state.level.boxes.length; i++) {
    if(!isBoxOnCrystal(_state.level.boxes[i])) return;
  }

  // Room has been won...

  input(false);
  _state.history.length = 0; // Clear undo.

  updatePlayerState('win');

  // Wait for win animation to finish:
  await wait(_winDuration);

  input(true);
  updatePlayerState('idle');
  _state.level.hasWon = true;
  _state.level.div.classList.add('win');
  updateGui();
  _inputStack.length = 0; // Truncate input stack.

  _state.level.onWin();

  return true;

}

function isBoxOnCrystal(box) {
  return _state.level.map[convertPosToMapIndex(box)] === entity.crystal.id;
}

function undo() {

  if (_state.history.length === 0) return;

  undoState();

}

function resetState() {

  if (_state.history.length === 0) return;

  _state.history = [ _state.history[0] ]; // Reset to the first move.

  undoState();

}

function undoState() {

  const oldState = _state.history.pop();

  // Restore boxes:
  oldState.levels.forEach(l => {
    _state.levels[l.id].boxes = l.boxes;
  });
  updateBoxes();

  movePlayer(oldState.player.pos);
  facePlayer(oldState.player.face);
  updatePlayerState(oldState.player.state);

  checkChangeRoom();

  updateGui();

}

// Return the map index for the given position.
// local coords.
function convertPosToMapIndex(pos) {
  return pos.x + (pos.y * _viewportSize.width);
}


/**
 * Return the entity object that is located at `pos`
 * (local room coords).
 */
function getObject(pos) {

  // Check box:
  for (let i = 0; i < _state.level.boxes.length; i++) {
    const box = _state.level.boxes[i];
    if(box.x === pos.x &&
       box.y === pos.y) {
      return box;
    }
  }

  { // Check doors at this position in each room:
    const globalPos = getGlobalPos(pos);
    const currentRooms = getRoomsAtGlobalPos(globalPos);
    for (let j = 0; j < currentRooms.length; j++) {
      const room = currentRooms[j];
      for (let i = 0; i < room.doors.length; i++) {
        const door = room.doors[i];
        const doorGlobalPos = getGlobalPos(door.pos, room.id);
        if(doorGlobalPos.x === globalPos.x &&
           doorGlobalPos.y === globalPos.y) {
          return door;
        }
      }
    }
  }

  // Check wall:
  let i = convertPosToMapIndex(pos);
  for (const value of Object.values(entity)) {
    if (value.id === _state.level.map[i]) return value;
  }

  // Player ran off the edge of board...
  return {
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

    room.div.classList.add(
      'room',
      'hidden',
      'level-' + room.id,
    );
    room.div.style.transform = `translate(${room.pos.x * _squareSize}px, ${room.pos.y * _squareSize}px)`

    // Make cells:
    for (let y = 0; y < _viewportSize.height; y++) {
      for (let x = 0; x < _viewportSize.width; x++) {

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

  const d = document.createElement('div');
  div.appendChild(d);

  d.style.transform = `translate(${pos.x * _squareSize}px, ${pos.y * _squareSize}px)`
  classes.forEach(c => {
    d.classList.add(c);
  });

  return d;

}

function changeCell(id, entityKey) {

  //console.log({id,entityKey});

  const div = document.querySelector('.level-' + _state.level.id + ' .cell-' + id);

  // Get entity:
  let e;
  for (const [key, value] of Object.entries(entity)) {
    if (entityKey === key) {
      e = value;
      break;
    }
  }

  div.classList.remove(
    'type-0',
    'type-1',
    'type-2',
    'type-3',
  );

  div.classList.add('type-' + e.id);

  _state.level.map[id] = e.id;

}

function clearCell() {
  for (let i = 0; i < _state.level.map.length; i++) {
    changeCell(i, 'empty');
  }
}

function updateBoxes() {
  _state.level.boxes.forEach(b => {
    updateBox(b);
  });
}

function updateGui() {
  // ...
}

function updateBox(b) {

  const d = document.querySelector('.level-' + _state.level.id + ' .box-' + b.id);
  d.style.transform = `translate(${b.x * _squareSize}px, ${b.y * _squareSize}px)`

  if(isBoxOnCrystal(b)) {
    d.classList.add('state-win');
  } else {
    d.classList.remove('state-win');
  }

}

function makeLabel(label, div) {

  let d = document.createElement('div');
  div.appendChild(d);

  d.style.width = (_squareSize * label.width) + 'px';
  d.style.height = (_squareSize * label.height) + 'px';
  d.style.transform = `translate(${label.pos.x * _squareSize}px, ${label.pos.y * _squareSize}px)`;
  d.style.fontSize = (_squareSize + 10) + 'px';

  d.classList.add(
    'label',
    'align-' + label.align,
  );

  // Add individual characters
  label.text.split('').forEach(i => {
    const span = document.createElement('span');
    span.classList.add('char-' + i);
    span.textContent = i;
    d.appendChild(span);
  });

}

function makeDoor(door, div) {

  const d = document.createElement('div');
  div.appendChild(d);

  door.div = d;

  d.style.transform = `translate(${door.pos.x * _squareSize}px, ${door.pos.y * _squareSize}px)`

  d.classList.add(
    'door',
    'door-' + door.id,
    'state-' + door.state,
    'style-' + door.style,
  );

  if (door.horizontal) {
    d.classList.add('horizontal');
  }

  // Note: svg is styled entirely in css.
  d.appendChild(util.makeSvg(
    '0 0 20 20',
    ['opener'],
    `
    <defs>
      <linearGradient id="grad-1" x1="0%" y1="50%" x2="100%" y2="50%" >
      <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
      <stop offset="40%" style="stop-color:rgb(0,0,0);stop-opacity:1" />
      <stop offset="60%" style="stop-color:rgb(0,0,0);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
      </linearGradient>
    </defs>

    <g class="groove">
      <rect />
    </g>
    <g class="div div-1">
      <rect fill="url(#grad-1)" />
      <rect />
      <rect />
    </g>
    <g class="div div-2">
      <rect fill="url(#grad-1)" />
      <rect />
      <rect />
    </g>
    `
  ));

}

function updateDoor(door) {

  door.div.classList.remove(
    'state-open',
    'state-closed',
  );

  door.div.classList.add('state-' + door.state);

}

/**
 * Hide rooms that are too far away from the current room.
 * This is based on viewport size, and should improve performance.
 */
function hideDistantRooms() {

  _state.levels.forEach(r => {

    const xOffset = Math.abs(r.pos.x - _state.level.pos.x);
    const yOffset = Math.abs(r.pos.y - _state.level.pos.y);

    if (xOffset > (_viewportSize.width + 2) ||
        yOffset > (_viewportSize.height + 2)) {

      // This room is definitely outside the viewport
      r.div.style.display = 'none';

    } else {

      r.div.style.display = '';

    }

  });

}

// Get/set whether or not the users input is allowed.
function input(canInput = null) {
  if (canInput !== null) {
    _state.canInput = canInput;
  }
  return _state.canInput;
}

async function wait(seconds) {
  await util.delay(seconds * 1000);
}

// Expose public methods:
export default {
  _lastRoomIds,
  _state,
  moveViewPort,
  getRoomsAtGlobalPos,
  onLoad,
  onKeyDown,
  openDoor,
  getLocalPos,
  getGlobalPos,
  hideDistantRooms,
}
