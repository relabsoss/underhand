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
  }

  getEventHandlers() {
    return {
      mousemove: this.onMousemove,
      click: this.onClick,
      dblclick: this.onDblClick,
      change: this.onChange,
      focus: this.onFocus,
      submit: this.onSubmit,
      reset: this.onReset,
      keypress: this.onKeypress
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

  onClick(event) {
    this.callback(event);
  };

  onDblClick(event) {
    this.callback(event);
  };

  onChange(event) {
    this.callback(event);
  };

  onFocus(event) {
    this.callback(event);
  };

  onSubmit(event) {
    this.callback(event);
  };

  onReset(event) {
    this.callback(event);
  };

  onKeypress(event) {
    this.callback(event);
  };
}
