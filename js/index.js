import {rooms} from './rooms.js';
import * as util from './util.js';
import {Player} from './player.js';

// Settings:
const VIEWPORT_SIZE = {
  width: 11,
  height: 11,
};

const SQUARE_SIZE = 60; // Pixels.
const _pixelSize = SQUARE_SIZE / 20;
const _worldOffset = SQUARE_SIZE * 1; // Number of squares to offset the world.
const _winDuration = .8;
const _roomTransitionDuration = 1;
const _inputStackLength = 1; // number of keyboard presses to store on the stack.

const ANIMATION_PROP = {
  move: {
    duration: .2,
    easing: 'ease',
  },
  moveSlow: {
    duration: .26,
    easing: 'linear',
  },
};

// Globals:

const _state = {

  player: new Player(),

  levels: [],

  canInput: false,

  isPendingMove: false, // Keypress mutex.

  history: [], // Undo stack.

  level: {}, // The current room.

}

let _world; // The DOM node that holds all the rooms stiched together.
let _viewport; // The DOM node that holds the world. The world is moved inside the viewport as the player transitions from room-to-room.
let _editMode = null;
let _viewportOverflow = false;
const _lastRoomIds  = [];
const _inputStack = [];
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

function init() {

  _viewport = document.querySelector('.viewport');

  window.onkeydown = onKeyDown;
  window.onload = onLoad;

  // Expose public methods:
  window.game = {
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

}

function onLoad() {

  // Pre-load images to avoid flicker the first time they are used:
  util.preloadImages([
    './img/player-up.svg',
    './img/player-down.svg',
    './img/player-walk-down-sprite.svg',
    './img/player-push.svg',
    './img/player-push-up.svg',
    './img/player-push-down.svg',
    './img/player-push-sprite.svg',
    './img/player-dance.svg',
    './img/player-bored-0.svg',
    './img/player-bored-1.svg',
    './img/player-bored-2.svg',
    './img/player-bored-3.svg',
  ]);

  // Add styles for animations:
  var style = document.createElement('style');
  style.innerHTML = `
    .player {
      transition: transform ${ANIMATION_PROP.move.duration}s ease;
    }

    .box,
    .player.state-push-up,
    .player.state-push-down,
    .player.state-push-left,
    .player.state-push-right {
      transition: transform ${ANIMATION_PROP.moveSlow.duration}s linear;
    }

    .cell,
    .box,
    .player,
    .door {
      width: ${SQUARE_SIZE}px;
      height: ${SQUARE_SIZE}px;
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

  _viewport.style.width = (_worldOffset * 2) + (VIEWPORT_SIZE.width * SQUARE_SIZE) + 'px';
  _viewport.style.height = (_worldOffset * 2) + (VIEWPORT_SIZE.height * SQUARE_SIZE) + 'px';

  // Make world:
  _world = document.createElement('div');
  _world.classList.add(
    'world',
    'hidden',
  )
  _viewport.appendChild(_world);

  makeEditGrid();

  makeRooms();

  setEventHandlers();

  changeRoom(0);

  _state.player.pos.x = _state.level.startPos.x;
  _state.player.pos.y = _state.level.startPos.y;

  initPlayer(0);

  input(true);

  window.requestAnimationFrame(t => {
    _world.classList.remove('hidden'); // Begin fade-in animation once node has been added to DOM.
  });

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

  const room = util.deepCopy(rooms[roomId]);

  room.id = roomId;

  // Initalise boxes:
  for (const [i, box] of room.boxes.entries()) {
    box.id = i;
    box.type = 'box';
  }

  // Compose text for first label:
  if (room.labels.length) {
    room.labels[0].text = util.pad(roomId + 1, 2);
  }

  // Set onWin event:
  room.onWin = onWinEventFactory(roomId);

  // Create doors array if it doesn't exist:
  if (!room.doors) room.doors = [];

  // Initalise doors:
  for (const [i, door] of room.doors.entries()) {

    door.id = i;
    door.type = 'door';

    if (door.state === undefined) door.state = 'open'; // Default value if not specified.

    if (door.allowPushThrough === undefined) door.allowPushThrough = false; // Default value if not specified.

    // Ensure the cell under the door is ground (for convenience when designing rooms and joining them together):
    const cellIndex = convertPosToMapIndex(door.pos)
    room.map[cellIndex] = entity.ground.id;

  }

  return room;

}

function initPlayer() {

  _state.player.div = makeDiv(
    _state.player.pos,
    _world,
    ['player'],
  );

  // Add child div to hold the background image.
  // We need another div because we apply separate transforms to the background-image.
  const d = document.createElement('div');
  _state.player.div.appendChild(d);

}

function makeEditGrid() {
  // Note: the edit grid overlays the viewport and is only used for edit mode.

  // Make viewport edge:
  const editGrid = document.createElement('div');
  editGrid.classList.add('edit-grid')
  editGrid.style.width = (VIEWPORT_SIZE.width * SQUARE_SIZE) + 'px';
  editGrid.style.height = (VIEWPORT_SIZE.height * SQUARE_SIZE) + 'px';
  editGrid.style.transform = `translate(${_worldOffset}px, ${_worldOffset}px)`
  _viewport.appendChild(editGrid);

  // Make cells:
  for (let y = 0; y < VIEWPORT_SIZE.height; y++) {
    for (let x = 0; x < VIEWPORT_SIZE.width; x++) {

      const i = convertPosToMapIndex({x,y})

      // Make cell:
      const div = makeDiv(
        {x,y},
        editGrid,
        [
          'cell',
        ],
      );

      // Handle cell click:
      div.onmousedown = e => {

        e.stopPropagation();

        if(!_editMode) return;

        if (_editMode === 'player') {
          movePlayer({
            x: x + _state.level.pos.x,
            y: y + _state.level.pos.y,
          });

        } else if (_editMode) {
          changeCellType(i, _editMode);
        }

      }

      div.setAttribute('aria-label', `${x},${y}`);
      div.setAttribute('role', 'tooltip');
      div.dataset.microtipPosition = 'bottom';
    }
  }

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
      _state.player.face('sw');
      await moveViewPort(_state.levels[0].pos);
      openDoor(1, 0);
      await wait(1);
      await moveViewPort(_state.levels[1].pos, .8);
      input(true);
    }

  } else if (roomId === 2) {

    return () => {
      _state.player.face('se');
      openDoor(0, 2);
    }

  } else if (roomId === 3) {

    return () => {
      _state.player.face('sw');
      openDoor(0, 3);
    }

  } else if (roomId === 4) {

    return async () => {
      _state.player.face('sw');
      openDoor(0, 4);
      await wait(0.1); // Pause for effect.
      openDoor(1, 4);
    }

  } else if (roomId === 5) {

    return async () => {
      _state.player.face('se');
      openDoor(0, 5);
      openDoor(1, 2);
    }

  } else if (roomId === 6) {

    return async () => {
      _state.player.face('se');
      openDoor(0, 6);
    }

  } else {

    return () => {
      console.error('unhandled `onWin()` event for room ' + roomId);
    }

  }

}

async function moveViewPort(pos = {x:0, y:0}, durationSeconds = _roomTransitionDuration, easing = 'ease-in-out') {

  // Animate:
  const translate = `translate(${_worldOffset - (pos.x * SQUARE_SIZE)}px, ${_worldOffset - (pos.y * SQUARE_SIZE)}px)`;
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

  hideDistantRooms();

}

async function movePlayer(props) {

  if (!props.easing) props.easing = ANIMATION_PROP.move.easing;
  if (!props.duration) props.duration = ANIMATION_PROP.move.duration;

  _state.player.pos.x = props.x;
  _state.player.pos.y = props.y;
  _state.player.move(true);

  // Animate:
  const translate = `translate(${props.x * SQUARE_SIZE}px, ${props.y * SQUARE_SIZE}px)`;
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

  _state.player.move(false);

  _state.player.div.style.transform = translate; // Preserve the effect after animation has finished.

}

function openDoor(doorId, roomId) {

  if (roomId === undefined) roomId = _state.level.id;

  const room = _state.levels[roomId];
  const door = room.doors[doorId];

  door.state = 'open';
  updateDoor(door);

}

function setEventHandlers() {

  const btnExport = document.querySelector('.btn-export');
  btnExport.onclick = e => util.downloadFile(JSON.stringify(_state.level), 'application/json', 'room-' + _state.level.id);

  const btnModeClear = document.querySelector('.btn-clear');
  btnModeClear.onclick = e => clearCells();

  const btnModeEmpty = document.querySelector('.btn-mode-empty');
  btnModeEmpty.onclick = e => toggleEditMode('empty');

  const btnModeWall = document.querySelector('.btn-mode-wall');
  btnModeWall.onclick = e => toggleEditMode('wall');

  const btnModeGround = document.querySelector('.btn-mode-ground');
  btnModeGround.onclick = e => toggleEditMode('ground');

  const btnModeCrystal = document.querySelector('.btn-mode-crystal');
  btnModeCrystal.onclick = e => toggleEditMode('crystal');

  const btnModePlayer = document.querySelector('.btn-mode-player');
  btnModePlayer.onclick = e => toggleEditMode('player');

  const btnMoveRoomUp = document.querySelector('.btn-move-room-up');
  btnMoveRoomUp.onclick = e => moveRoom({x:0, y:-1});

  const btnMoveRoomDown = document.querySelector('.btn-move-room-down');
  btnMoveRoomDown.onclick = e => moveRoom({x:0, y:1});

  const btnMoveRoomLeft = document.querySelector('.btn-move-room-left');
  btnMoveRoomLeft.onclick = e => moveRoom({x:-1, y:0});

  const btnMoveRoomRight = document.querySelector('.btn-move-room-right');
  btnMoveRoomRight.onclick = e => moveRoom({x:1, y:0});

  const btnToggleOverflow = document.querySelector('.btn-overflow');
  btnToggleOverflow.onclick = e => toggleOverflow();

}

function toggleOverflow() {
  _viewportOverflow = _viewportOverflow ? false : true;
  _viewport.style.overflow = _viewportOverflow ? 'visible' : 'hidden';
}

function moveRoom(offset) {
  const room = _state.level
  room.pos.x += offset.x;
  room.pos.y += offset.y;
  room.div.style.transform = `translate(${room.pos.x * SQUARE_SIZE}px, ${room.pos.y * SQUARE_SIZE}px)`
}

function toggleEditMode(mode) {

  const btn = document.querySelector('.btn-mode-' + mode); // Button that was clicked on
  const modeButtons = document.querySelectorAll('.btn-mode');

  if (btn.classList.contains('active')) {

    btn.classList.remove('active');
    _viewport.classList.remove('edit');
    _editMode = null;

  } else {

    for (const button of modeButtons) {
      button.classList.remove('active');
    }

    btn.classList.add('active');
    _viewport.classList.add('edit');
    _editMode = mode;

  }

}

function changeRoom(roomId, animationDuration = 0) {

  // Set the new room as the current room:
  _state.level = _state.levels[roomId];

  _state.level.div.classList.remove('hidden');

  // Center viewport on the room:
  moveViewPort(_state.level.pos, animationDuration, 'ease');

  { // Edit mode - activate button for this level:
    const thisButton = document.querySelector('.btn-room-' + roomId);
    const allButtons = document.querySelectorAll('.btn-room');

    for (const button of allButtons) {
      button.classList.remove('active');
    }

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
    undoState();
    return;
  }

  // Reset room:
  if (e.key === 'Escape') {
    resetState();
    return;
  }

  let x = 0;
  let y = 0;
  let pushDirection;

  // Determine pos offset
  const oldPlayerFaceDirection = _state.player.faceDirection;
  if (e.key === 'ArrowUp' || e.key === 'w') {
    pushDirection = 'up';
    y -= 1;
    _state.player.face( oldPlayerFaceDirection.includes('e') ? 'ne' : 'nw' );
  } else if (e.key === 'ArrowDown' || e.key === 's') {
    pushDirection = 'down';
    y += 1;
    _state.player.face( oldPlayerFaceDirection.includes('e') ? 'se' : 'sw' );
  } else if (e.key === 'ArrowLeft' || e.key === 'a') {
    pushDirection = 'left';
    x -= 1;
    _state.player.face('sw');
  } else if (e.key === 'ArrowRight'  || e.key === 'd') {
    pushDirection = 'right';
    x += 1;
    _state.player.face('se');
  } else {
    return; // ignore all other keys
  }

  let move = true;

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

      for (const room of _state.levels) {
        levelsCopy.push({
          id: room.id,
          boxes: util.deepCopy(room.boxes),
        });
      }

      _state.history.push({
        player: {
          pos: util.deepCopy(_state.player.pos),
          faceDirection: oldPlayerFaceDirection,
          isMoving: _state.player.isMoving,
          pushDirection: _state.player.pushDirection,
        },
        levels: levelsCopy,
      });

    }

    let animationProps = ANIMATION_PROP.move;

    if (adj.type === 'box') {
      // Move box:
      adj.x += x;
      adj.y += y;
      updateBox(adj);
      _state.player.pushBox(pushDirection);
      _state.player.didPushBox = true; // We save this for the undo animation.
      animationProps = ANIMATION_PROP.moveSlow;
    } else {
      _state.player.pushBox(null);
      _state.player.didPushBox = false;
    }

    _state.isPendingMove = true;

    const movePlayerAnimation = movePlayer({
      x: _state.player.pos.x + x,
      y: _state.player.pos.y + y,
      ...animationProps,
    });

    checkChangeRoom();

    await movePlayerAnimation;

    { // Remove 'push' state if the box can't be pushed any further.

      const playerLocalPos = getLocalPos(_state.player.pos);
      let adj = getObject({
        x: playerLocalPos.x + x,
        y: playerLocalPos.y + y,
      });

      if (adj.type !== 'box' || !canBePushed(adj, {x, y}) ) {
        _state.player.pushBox(null);
      }

    }

    if (await checkWin()) {
      _state.player.pushBox(null); // No need to push further if level has been won.
    }

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
  _lastRoomIds.push(...currentRoomIds);

  // Find the first (top-most) room that is not the current room and transition into it.
  for (const room of currentRooms) {

    if (room.id === _state.level.id) continue; // Ignore current room.

    changeRoom(room.id, _roomTransitionDuration);

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

  for (const room of _state.levels) {

    const pos = getLocalPos(globalPos, room.id)

    // check out of bounds
    if (pos.x >= 0 && pos.x < VIEWPORT_SIZE.width &&
        pos.y >= 0 && pos.y < VIEWPORT_SIZE.height) {

      const cell = room.map[ convertPosToMapIndex(pos) ];

      // Ensure cell is not empty
      if (cell !== entity.empty.id) {
        currentRooms.push(room);
      }

    }

  }

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

  for (const box of _state.level.boxes) {
    if(!isBoxOnCrystal(box)) return;
  }

  // Room has been won...

  input(false);
  _state.history.length = 0; // Clear undo.

  _state.player.dance(true);

  // Wait for win animation to finish:
  await wait(_winDuration);

  input(true);
  _state.player.dance(false);
  _state.level.hasWon = true;
  _state.level.div.classList.add('win');
  _inputStack.length = 0; // Truncate input stack.

  _state.level.onWin();

  return true;

}

function isBoxOnCrystal(box) {
  return _state.level.map[convertPosToMapIndex(box)] === entity.crystal.id;
}

function resetState() {

  if (_state.history.length === 0) return;

  _state.history = [ _state.history[0] ]; // Reset to the first move.

  undoState();

}

function undoState() {

  if (_state.history.length === 0) return;

  const oldState = _state.history.pop();

  // Restore boxes:
  for (const room of oldState.levels) {
    _state.levels[room.id].boxes = room.boxes;
  }
  updateBoxes();

  const animationProps = (_state.player.didPushBox === true) ? ANIMATION_PROP.moveSlow : ANIMATION_PROP.move;
  movePlayer({
    ...oldState.player.pos,
    ...animationProps,
  });

  _state.player.move(oldState.player.isMoving);
  _state.player.face(oldState.player.faceDirection);
  _state.player.pushBox(oldState.player.pushDirection);

  checkChangeRoom();

}

// Return the map index for the given position.
// local coords.
function convertPosToMapIndex(pos) {
  return pos.x + (pos.y * VIEWPORT_SIZE.width);
}


/**
 * Return the entity object that is located at `pos`
 * (local room coords).
 */
function getObject(pos) {

  // Check box:
  for (const box of _state.level.boxes) {
    if(box.x === pos.x &&
       box.y === pos.y) {
      return box;
    }
  }

  { // Check doors at this position in each room:
    const globalPos = getGlobalPos(pos);
    for (const room of getRoomsAtGlobalPos(globalPos)) {
      for (const door of room.doors) {
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

function makeRooms() {

  for (let i = 0; i < rooms.length; i++) {

    const room = roomFactory(i);

    _state.levels.push(room);

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
    room.div.style.transform = `translate(${room.pos.x * SQUARE_SIZE}px, ${room.pos.y * SQUARE_SIZE}px)`

    // Make cells:
    for (let y = 0; y < VIEWPORT_SIZE.height; y++) {
      for (let x = 0; x < VIEWPORT_SIZE.width; x++) {

        const index = convertPosToMapIndex({x,y})

        let cell = room.map[index];

        // Get entity type:
        let e;
        for (const value of Object.values(entity)) {
          if (cell === value.id) {
            e = value;
            break;
          }
        }

        // Make cell:
        const div = makeDiv(
          {x,y},
          room.div,
          [
            'cell',
            'cell-' + index,
            'type-' + e.id,
          ],
        );

      }
    }

    // Make boxes:
    for (const box of room.boxes) {

      makeDiv(
        box,
        room.div,
        [
          'box',
          'box-' + box.id,
          'state-init',
        ],
      );

    }

    // Make labels:
    for (const label of room.labels) {
      makeLabel(label, room.div);
    }

    // Make doors:
    for (const door of room.doors) {
      makeDoor(door, room.div);
    }

    makeGotoRoomButton(room);

  }

}

function makeDiv(pos, div, classes) {

  const d = document.createElement('div');
  div.appendChild(d);

  d.style.transform = `translate(${pos.x * SQUARE_SIZE}px, ${pos.y * SQUARE_SIZE}px)`

  d.classList.add(...classes);

  return d;

}

function changeCellType(id, entityKey) {

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

function clearCells() {
  for (let i = 0; i < _state.level.map.length; i++) {
    changeCellType(i, 'empty');
  }
}

function updateBoxes() {
  for (const box of _state.level.boxes) {
    updateBox(box);
  }
}

function updateBox(b) {

  const d = document.querySelector('.level-' + _state.level.id + ' .box-' + b.id);
  d.style.transform = `translate(${b.x * SQUARE_SIZE}px, ${b.y * SQUARE_SIZE}px)`

  if(isBoxOnCrystal(b)) {
    d.classList.add('state-win');
  } else {
    d.classList.remove('state-win');
  }

}

function makeLabel(label, div) {

  let d = document.createElement('div');
  div.appendChild(d);

  d.style.width = (SQUARE_SIZE * label.width) + 'px';
  d.style.height = (SQUARE_SIZE * label.height) + 'px';
  d.style.transform = `translate(${label.pos.x * SQUARE_SIZE}px, ${label.pos.y * SQUARE_SIZE}px)`;
  d.style.fontSize = (SQUARE_SIZE + 10) + 'px';

  d.classList.add(
    'label',
    'align-' + label.align,
  );

  // Add individual characters
  for (const char of label.text) {
    const span = document.createElement('span');
    span.classList.add('char-' + char);
    span.textContent = char;
    d.appendChild(span);
  }

}

function makeDoor(door, div) {

  const d = document.createElement('div');
  div.appendChild(d);

  door.div = d;

  d.style.transform = `translate(${door.pos.x * SQUARE_SIZE}px, ${door.pos.y * SQUARE_SIZE}px)`

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

  for (const room of _state.levels) {

    if (_viewportOverflow) {
      room.div.style.display = '';
      continue;
    }

    const xOffset = Math.abs(room.pos.x - _state.level.pos.x);
    const yOffset = Math.abs(room.pos.y - _state.level.pos.y);

    if (xOffset > (VIEWPORT_SIZE.width + 2) ||
        yOffset > (VIEWPORT_SIZE.height + 2)) {

      // This room is definitely outside the viewport
      room.div.style.display = 'none';

    } else {

      room.div.style.display = '';

    }

  }

}

// Get/set whether or not the users input is allowed.
function input(canInput = null) {
  if (canInput !== null) {
    _state.canInput = canInput;
  }
  return _state.canInput;
}

function makeGotoRoomButton(room) {

  let btn = document.createElement('button');

  btn.classList.add(
    'btn',
    'btn-room',
    'btn-room-' + room.id,
  );

  btn.textContent = 'level ' + util.pad(room.id,2);

  const roomId = room.id;

  btn.onclick = () => {

    const room = _state.levels[roomId];

    changeRoom(room.id);

    movePlayer({
      x: room.startPos.x + room.pos.x,
      y: room.startPos.y + room.pos.y,
      duration: _roomTransitionDuration,
    });

  }

  document.querySelector('.buttons').appendChild(btn);

}

async function wait(seconds) {
  await util.delay(seconds * 1000);
}

init();
