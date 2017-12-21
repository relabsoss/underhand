'use strict';

import { EventListener } from 'listeners/eventlistener.class.js';
import { MutationListener } from 'listeners/mutationllistener.class.js';
import { Actions } from 'actions.class.js';
import { deflate } from 'pako';

export class Underhand {

  constructor(params) {
    let opts = params || {};

    this.target = undefined;
    this._startedAt = undefined;
    this._compress = typeof opts.compress === 'boolean' ? opts.compress : true;
    this.sendAnySecs = opts.sendAnySecs || 10;
    this.actionsThreshold = opts.actionsThreshold || 100;
    this.onSend = typeof opts.onSend === 'function' ? opts.onSend : undefined;
    this._actions = undefined;
    this._saveTimerId = undefined;
  }

  init(targetSelector) {
    let self = this;

    window.addEventListener('load', () => {
      try {
        let
          node = targetSelector === undefined ? document : document.querySelector(targetSelector);

        self._startedAt = Date.now();
        self._actions = new Actions(this._startedAt);

        if (node) {
          self.target = node;
          self._eventListener =
            new EventListener(this.target, (e) => this.onEvent.apply(self, [e]));
          self._mutationListener =
            new MutationListener(this.target, (e) => this.onEvent.apply(self, [e]));

          self.scheduleSave();
          this.sendInitialData();

          console.log('Underhand initialised');
        }
      } catch (err) {
        console.exception('Initialization failed');
      }
    });

    window.addEventListener('beforeunload', () => {
      self.save();
      console.log('Underhand unloaded');
    });
  }

  onEvent(event) {
    this._actions.push(event);
    if (this._actions.length >= this.actionsThreshold) {
      this.save();
    }
  }

  scheduleSave() {
    let self = this;

    if (this._saveTimerId !== undefined) {
      window.clearTimeout(this._saveTimerId);
      this._saveTimerId = undefined;
    }
    this._saveTimerId = window.setTimeout(() => self.save(), this.sendAnySecs * 1000);
  }

  sendInitialData() {
    const
      width = window.innerWidth,
      height = window.innerHeight;

    this.onSend(
      this.compress(
        JSON.stringify(
          {init: [this._startedAt, width, height]}
        )));
  }

  save() {
    if (this.onSend && this._actions.length > 0) {
      let data = this.serialize();

      this.resetActions();
      if (data) {
        this.onSend(data);
      }
    }
    this.scheduleSave();
  }

  serialize() {
    let data = {};

    for (let key in this._actions.groups) {
      const
        group = this._actions.groups[key],
        value = group.reduce((acc, i) => {
          acc.push(i.serialise());
          return acc;
        }, []);

      if (value.length > 0) data[key] = value;
    }
    return this.compress(JSON.stringify(data));
  }

  compress(data) {
    if (!this._compress) return data;

    const
      compressed = window.btoa(deflate(data, {
        level: 9,
        to: 'string'
      }));

    console.log(
      'compression ratio: ' + data.length +
      ' / ' + compressed.length +
      ' = ' + (data.length / compressed.length));
    return compressed;
  }

  resetActions() {
    this._actions = new Actions(this._startedAt);
  }
}
