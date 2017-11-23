const SelectViewList = require('atom-select-list');

module.exports =
class SwitchView {
  constructor () {
    this.selectListView = new SelectViewList({
      itemsClassList: ['mark-active'],
      items: [],
      filterKeyForItem: (env) => env.name,
      elementForItem: (env) => {
        const name = env.name;
        const element = document.createElement('li');

        if (env === this.currentEnv) {
          element.classList.add('active');
        }

        element.textContent = name;
        element.dataset.env = name;
        return element;
      },
      didConfirmSelection: (env) => {
        this.cancel();
        atom.config.set('atom-ionicenvironments.currentEnvironment', env.name);
      },
      didCancelSelection: () => {
        this.cancel();
      }
    });

    this.selectListView.element.classList.add('environment-selector');
  }

  destroy() {
    this.cancel();
    return this.selectListView.destroy();
  }

  cancel() {
    if (this.panel != null) {
      this.panel.destroy();
    }

    this.panel = null;
    this.currentEnv = null;

    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }

  attach() {
    this.previouslyFocusedElement = document.activeElement;

    if (this.panel == null) {
      this.panel = atom.workspace.addModalPanel({item: this.selectListView})
    }

    this.selectListView.focus();
    this.selectListView.reset();
  }

  async toggle () {
    if (this.panel != null) {
      this.cancel()
    } else {
      let environments = [];

      // GET ENVIRONMENTS FROM FILE;
      environments.push({
        name: 'Debug'
      });

      environments.push({
        name: 'Release'
      });

      await this.selectListView.update({items: environments})
      this.attach()
    }
  }
}
