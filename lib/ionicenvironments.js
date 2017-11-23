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
  },

  config : {
    currentEnvironment: {
      title: "Currently Selected Environment",
      type: "string",
      default: "Debug",
      order: 1,
      enum: [
        "Debug",
        "Release"
      ]
    },
    serveOptions: {
      type: "object",
      properties: {
        Debug: {
          title: "Additional options to run with ionic serve when debugging",
          description: "Example: --lab, --platform android, --no-open, See: [ionic serve](https://ionicframework.com/docs/cli/serve/)",
          type: "string",
          default: "",
          order: 2
        },
        Release: {
          title: "Additional options to run with ionic serve when releasing",
          description: "Example: --env=prod, See: [ionic serve](https://ionicframework.com/docs/cli/serve/)",
          type: "string",
          default: "--env=prod",
          order: 3
        }
      }
    }
  }
};
