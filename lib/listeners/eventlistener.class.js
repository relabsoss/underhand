'use strict';

const
  MOUSEMOVE_THRESHOLD = 2;

export class EventListener {

  constructor(target, callback) {
    this.target = target;
    this.callback = callback;

    this._lastMousePos = {
      x: undefined,
      y: undefined
    };
    this.init();
  }

  init() {
    let
      callbacks = this.getEventHandlers(),
      self = this;

    for (let eventName in callbacks) {
      this.target.addEventListener(eventName,
        (e) => {
          callbacks[eventName].apply(self, [e]);
        }, true);
    }

    window.addEventListener('resize', (e) => this.onAny.apply(self, [e]), true);
    if (this.target !== document) {
      document.addEventListener('scroll', (e) => this.onAny.apply(self, [e]), true);
    }
  }

  getEventHandlers() {
    return {
      mousemove: this.onMousemove,
      click: this.onAny,
      dblclick: this.onAny,
      change: this.onAny,
      focus: this.onAny,
      submit: this.onAny,
      reset: this.onAny,
      keypress: this.onAny,
      scroll: this.onAny
    };
  }

  onMousemove(event) {
    let
      prevX = this._lastMousePos.x,
      prevY = this._lastMousePos.y,
      xChanged = prevX === undefined ? event.pageX : Math.abs(prevX - event.pageX),
      yChanged = prevY === undefined ? event.pageY : Math.abs(prevY - event.pageY);

    if (xChanged > MOUSEMOVE_THRESHOLD || yChanged > MOUSEMOVE_THRESHOLD) {
      this._lastMousePos.x = event.pageX;
      this._lastMousePos.y = event.pageY;

      this.callback(event);
    }
  };

  onAny(event) {
    this.callback(event);
  }
}
