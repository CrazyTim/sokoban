import * as util from './util.js';

const BORED_DURATION = 1000;
const BORED_DELAY_RANGE = [3000, 6000];
const BORED_CHECK_DURATION = .3;
const INITIAL_BORED_DELAY = 5000;

export class Player {

  constructor(div) {
    this.pos = {x:0, y:0}; // Position (world coordinates).
    this.div = div; // DOM node representing the player.
    this.isMoving = false;
    this.faceDirection = 'se'; // ne|nw|se|sw.
    this.pushDirection = null; // null|up|down|left|right
    this.isDancing = false;
    this.isBored = false;
    this.boredInterval = null;
    this.lastBoredType = -1;
    this.boredDelay = 1500;
    this.lastActionTimestamp = INITIAL_BORED_DELAY * -1;
    this.startBoredTimer();
  }

  move(state = true) {
    this.isMoving = state;
    this.resetBoredTimer();
    this.updateHtmlClassList();
  }

  face(direction = 'se') {
    this.faceDirection = direction;
    this.resetBoredTimer();
    this.updateHtmlClassList();
  }

  pushBox(direction = null) {
    this.pushDirection = direction;
    this.resetBoredTimer();
    this.updateHtmlClassList();
  }

  dance(state = true) {
    this.isDancing = state;
    this.resetBoredTimer();
    this.updateHtmlClassList();
  }

  bored(state = true) {
    this.isBored = state;
    this.updateHtmlClassList();
  }

  get() {

    let state = [];

    if (this.isMoving) state.push('state-moving');
    if (this.faceDirection) state.push('state-face-' + this.faceDirection);
    if (this.pushDirection) state.push('state-push-' + this.pushDirection);
    if (this.isDancing) state.push('state-dancing');

    if (this.isBored && !this.isMoving && !this.pushDirection && !this.isDancing) {
      state.push('state-bored-' + this.getRandomBoredType());
    }

    return state;

  }

  set(state = []) {

    this.isMoving = false;
    this.pushDirection = null;
    this.isDancing = false

    if (state.includes('state-moving')) this.isMoving = true;
    if (state.includes('state-face-ne')) this.faceDirection = 'ne';
    if (state.includes('state-face-nw')) this.faceDirection = 'nw';
    if (state.includes('state-face-se')) this.faceDirection = 'se';
    if (state.includes('state-face-sw')) this.faceDirection = 'sw';
    if (state.includes('state-push-up')) this.pushDirection = 'up';
    if (state.includes('state-push-down')) this.pushDirection = 'down';
    if (state.includes('state-push-left')) this.pushDirection = 'left';
    if (state.includes('state-push-right')) this.pushDirection = 'right';
    if (state.includes('state-dancing')) this.isDancing = true;

    this.resetBoredTimer();

  }

  updateHtmlClassList() {

    this.div.classList.remove(
      'state-face-ne',
      'state-face-nw',
      'state-face-se',
      'state-face-sw',
      'state-moving',
      'state-push-up',
      'state-push-down',
      'state-push-left',
      'state-push-right',
      'state-dancing',
      'state-bored-0',
      'state-bored-1',
      'state-bored-2',
      'state-bored-3',
    );

    this.div.classList.add(...this.get());

  }

  startBoredTimer() {
    this.boredInterval = setInterval(t => {
      this.checkBored();
    }, BORED_CHECK_DURATION * 1000);
  }

  resetBoredTimer() {
    this.isBored = false;
    this.lastActionTimestamp = performance.now();
    this.boredDelay = util.getRandom(BORED_DELAY_RANGE[0], BORED_DELAY_RANGE[1]);
  }

  getRandomBoredType() {
    let boredType;
    do {
      boredType = util.getRandom(0, 3);
    } while (boredType === this.lastBoredType); // Ensure different than last time.
    return this.lastBoredType = boredType;
  }

  checkBored() {

    const elapsed = performance.now() - this.lastActionTimestamp;

    if (elapsed < this.boredDelay) return;

    if (elapsed > this.boredDelay && !this.isBored) {
      // Player is bored.
      window.requestAnimationFrame(t => {
        this.bored(true);
      });
    }

    if (elapsed > (this.boredDelay) + (BORED_DURATION)) {
      // Player has been bored for long enough - stop being bored.
      window.requestAnimationFrame(t => {
        this.bored(false);
        this.resetBoredTimer();
      });
    }

  }

}
