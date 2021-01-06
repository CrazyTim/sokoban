export default class playerState {

  constructor(div) {

    this.div = div;

    this.isMoving = false;
    this.pushDirection = null;
    this.isDancing = false;

  }

  move(state = true) {
    this.isMoving = state;
    this.updateHtmlClassList();
  }

  push(direction = 'up') {
    this.pushDirection = direction;
    this.updateHtmlClassList();
  }

  dance(state = true) {
    this.isDancing = state;
    this.updateHtmlClassList();
  }

  get() {

    let state = [];

    if (this.isMoving) state.push('state-moving');
    if (this.pushDirection) state.push('state-push-' + this.pushDirection);
    if (this.isDancing) state.push('state-dancing');

    return state;

  }

  set(state = []) {

    this.isMoving = false;
    this.pushDirection = null;
    this.isDancing = false

    if (state.includes('state-moving')) this.isMoving = true;
    if (state.includes('state-push-up')) this.pushDirection = 'up';
    if (state.includes('state-push-down')) this.pushDirection = 'down';
    if (state.includes('state-push-left')) this.pushDirection = 'left';
    if (state.includes('state-push-right')) this.pushDirection = 'right';
    if (state.includes('state-dancing')) this.isDancing = true;

  }

  updateHtmlClassList() {

    this.div.classList.remove(
      'state-moving',
      'state-push-up',
      'state-push-down',
      'state-push-left',
      'state-push-right',
      'state-dancing',
    );

    this.div.classList.add(...this.get());

  }

}
