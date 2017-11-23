const StatusView = require('./status-view');
const SwitchView = require('./switch-view');

let commandDisposable = null;
let statusView = null;
let switchView = null;

module.exports = {
  activate() {
    commandDisposable = atom.commands.add('atom-text-editor', 'ionicenvironments:show', () => {
      if (!switchView) switchView = new SwitchView()
      switchView.toggle()
    })
  },

  deactivate() {
    if  (commandDisposable) commandDisposable.dispose();
    commandDisposable = null;

    if (switchView) switchView.destroy();
    switchView = null;

    if (statusView) statusView.destroy();
    statusView = null;
  },

  consumeStatusBar(statusBar) {
    statusView = new StatusView(statusBar);
    statusView.attach();
  }
};
