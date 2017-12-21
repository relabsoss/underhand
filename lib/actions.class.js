'use strict';

import { getQuerySelector } from './utils';

export class Actions {
  constructor(startedAt) {
    this._startedAt = startedAt;
    this.groups = {};
    this.length = 0;
  }

  push(origin) {
    const
      delta = Date.now() - this._startedAt,
      name = this.groupName(origin),
      action = this.getAction(origin, delta);

    if (!(name in this.groups)) {
      this.groups[name] = [];
    }

    if (action) {
      this.groups[name].push(action);
      this.length += 1;
    }
  }

  groupName(origin) {
    if (this.isMutation(origin)) {
      return this.mutationGroupName(origin);
    }
    return origin.type.substr(0, 2);
  }

  mutationGroupName(origin) {
    switch (origin.type) {
      case 'attributes':
        return 'mua';

      case 'characterData':
        return 'mud';

      case 'childList':
        return 'mul';

      default:
        return undefined;
    }
  }

  getAction(origin, delta) {
    if (this.isMutation(origin)) {
      return this.getMutationAction(origin, delta);
    }
    return this.getEventAction(origin, delta);
  }

  getMutationAction(origin, delta) {
    switch (origin.type) {
      case 'attributes':
        return new AttributeMutation(origin, delta);

      case 'characterData':
        return new CharacterDataMutation(origin, delta);

      case 'childList':
        return new ChildListMutation(origin, delta);

      default:
        return undefined;
    }
  }

  getEventAction(origin, delta) {
    switch (origin.type) {
      case 'mousemove':
        return new MouseMoveAction(origin, delta);

      case 'click':
      case 'dblclick':
        return new MouseClickAction(origin, delta);

      case 'change':
        switch (origin.target.tagName.toLowerCase()) {
          case 'input':
            if (origin.target.type !== 'text' || origin.target.type !== 'password') {
              return new CheckboxChangeAction(origin, delta);
            }
            return undefined;

          case 'select':
            return new SelectChangeAction(origin, delta);

          default:
            return undefined;
        }

      case 'keypress':
        return new KeypressAction(origin, delta);

      case 'focus':
        return new FocusAction(origin, delta);

      case 'submit':
        return new SubmitAction(origin, delta);

      case 'reset':
        return new ResetAction(origin, delta);

      case 'scroll':
        return new ScrollAction(origin, delta);

      case 'resize':
        return new ResizeAction(origin, delta);

      default:
        return undefined;
    }
  }

  isMutation(origin) {
    return origin instanceof MutationRecord;
  }
}

class Action {
  constructor(origin, delta) {
    this.delta = delta;
    this.selector = getQuerySelector(origin.target);
  }

  serialise() {
    return undefined;
  }
}

class KeyboardAction extends Action {
  constructor(origin, delta) {
    super(origin, delta);

    this.opts = '';
    if (origin.altKey) this.opts += 'a';
    if (origin.shiftKey) this.opts += 's';
    if (origin.ctrlKey) this.opts += 'c';
    if (origin.metaKey) this.opts += 'm';
  }
}

class MouseAction extends KeyboardAction {
  constructor(origin, delta) {
    super(origin, delta);

    this.which = origin.which;
    this.pageX = origin.pageX;
    this.pageY = origin.pageY;
  }
}

class MouseMoveAction extends MouseAction {
  serialise() {
    if (this.opts.length === 0) return [this.delta, this.pageX, this.pageY];
    return [this.delta, this.pageX, this.pageY, this.opts];
  }
}

class MouseClickAction extends MouseAction {
  serialise() {
    if (this.opts.length === 0) return [this.delta, this.selector, this.pageX, this.pageY, this.which];
    return [this.delta, this.selector, this.pageX, this.pageY, this.which, this.opts];
  }
}

class CheckboxChangeAction extends Action {
  constructor(origin, delta) {
    super(origin, delta);

    this.type = origin.target.type;
    this.checked = origin.target.checked;
    this.value = origin.target.value;
  }

  serialise() {
    return [this.delta, this.selector, this.checked ? '1' : '0'];
  }
}

class SelectChangeAction extends Action {
  constructor(origin, delta) {
    super(origin, delta);

    this.value = [];
    if (origin.target.multiple) {
      for (let i = 0; i < origin.target.selectedOptions; i++) {
        this.value.push(origin.target.selectedOptions.item(i));
      }
    } else {
      this.value = [ origin.target.selectedIndex ];
    }
  }

  serialise() {
    return [this.delta, this.selector, this.value];
  }
}

class KeypressAction extends Action {
  constructor(origin, delta) {
    super(origin, delta);

    this.char = origin.char || origin.charCode;
  }

  serialise() {
    return [this.delta, this.selector, this.char, this.opts];
  }
}

class FocusAction extends Action {

  serialise() {
    return [this.delta, this.selector];
  }
}

class ResetAction extends Action {

  serialise() {
    return [this.delta, this.selector];
  }
}

class SubmitAction extends Action {

  serialise() {
    return [this.delta, this.selector];
  }
}

class ScrollAction extends Action {
  constructor(origin, delta) {
    super(origin, delta);

    if (origin.target === document) {
      this.x = window.scrollX;
      this.y = window.scrollY;
      this.selector = '';
    } else {
      this.x = origin.target.scrollLeft;
      this.y = origin.target.scrollTop;
    }
  }

  serialise() {
    return [this.delta, this.selector, this.x, this.y];
  }
}

class ResizeAction extends Action {
  constructor(origin, delta) {
    super(origin, delta);

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.top = window.scrollTop;
    this.left = window.scrollLeft;
  }

  serialise() {
    return [this.delta, this.selector, this.width, this.height, this.top, this.left];
  }
}

class AttributeMutation extends Action {
  constructor(origin, delta) {
    super(origin, delta);

    this.attrName = origin.attributeName;
    if (this.attrName.toLowerCase() === 'style') {
      this.attrValue = origin.target.style.cssText;
    } else {
      this.attrValue = origin.target.attributes.getNamedItem(this.attrName);
    }
  }

  serialise() {
    return [this.delta, this.selector, this.attrName, this.attrValue];
  }
}

class CharacterDataMutation extends Action {
  constructor(origin, delta) {
    super(origin, delta);

    this.selector = getQuerySelector(origin.target.parentNode);
    this.data = origin.target.data;
  }

  serialise() {
    return [this.delta, this.selector, this.data];
  }
}

class ChildListMutation extends Action {
  constructor(origin, delta) {
    super(origin, delta);

    this.added = [];
    this.removed = [];
    this.siblingSelector = origin.previousSibling !== null ? getQuerySelector(origin.previousSibling) : '';

    for (let i = 0; i < origin.addedNodes.length; i++) {
      const node = origin.addedNodes.item(i);

      this.added.push(node.outerHTML || node.data);
    }

    for (let i = 0; i < origin.removedNodes.length; i++) {
      this.removed.push(origin.removedNodes.item(i).tagName.toLowerCase());
    }
  }

  serialise() {
    return [this.delta, this.selector, this.siblingSelector, this.added, this.removed];
  }
}
