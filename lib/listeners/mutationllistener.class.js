'use strict';

export class MutationListener {

  constructor(target, callback) {
    this.target = target;
    this.callback = callback;
    this.init();
  }

  init() {
    const
      MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
      self = this;

    this._observer = new MutationObserver((mutations) => this.onMutation.apply(self, [mutations]));

    this._observer.observe(this.target, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  onMutation(mutations) {
    mutations.forEach(
      (mutation) => {
        this.callback(mutation);
      }
    );
  }
}
