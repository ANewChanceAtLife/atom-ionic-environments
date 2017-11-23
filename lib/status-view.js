const { Disposable } = require('atom');
const cmd = require('node-cmd');
const ps = require('ps-node');

module.exports =
class StatusView {
  constructor(statusBar) {
    this.statusBar = statusBar;
    this.ionicIsRunning = ps.lookup({
      command: 'ionic',
    }, function(err, resultList ) {
      if (err) {
        atom.notifications.addError('There was an error retrieving the ionic processes: ' + err);
        return false;
      }

      return resultList.length > 0;
    });
    this.activeItemSubscription = atom.workspace.observeActiveTextEditor(this.subscribeToActiveTextEditor.bind(this));
    this.configSubscription = atom.config.observe('ionicenvironments.currentEnvironment', this.attach.bind(this));
  }

  getEnvironment() {
    let element,
    switchLink,
    selectedEnvironment;

    element = document.createElement('ionic-environment-switch');
    element.classList.add('ionic-environment-switch', 'inline-block');
    switchLink = document.createElement('a');
    switchLink.classList.add('inline-block');
    switchLink.setAttribute('id', 'ionicenvironments-status-link');
    selectedEnvironment = atom.config.get('ionicenvironments.currentEnvironment');
    switchLink.textContent = `${selectedEnvironment} Environment`;
    element.appendChild(switchLink);

    const clickHandler = (event) => {
      event.preventDefault();
      atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), 'ionicenvironments:show')
    }

    element.addEventListener('click', clickHandler);
    this.clickEnvSubscription = new Disposable(() => { element.removeEventListener('click', clickHandler) });

    return element;
  }

  stopIonic() {
    ps.lookup({
      command: 'ionic',
    }, function(err, resultList ) {
      if (err) {
        atom.notifications.addError('There was an error retrieving the ionic processes: ' + err);
        return false;
      }

      resultList.forEach(function( process ){
        if(process && process.pid){
          ps.kill( process.pid, {
            signal: 'SIGKILL',
            timeout: 10,
          }, function( err ) {
            if (err) {
              atom.notifications.addError('Stopping the Ionic process returned an error: ' + err);
            }
            else {
              atom.notifications.addSuccess('Ionic has been successfuly stopped');
            }
          });
        }
      });

      this.ionicIsRunning = false;
    });
  }

  getStartStop() {
    let element, startStopLink;
    element = document.createElement('ionic-environment-startstop');
    element.classList.add('ionic-environment-startstop', 'inline-block');
    startStopLink = document.createElement('a');

    if (this.isIonicRunning) {
      startStopLink.classList.add('inline-block', 'stop', 'icon', 'icon-primitive-square');
    } else {
      startStopLink.classList.add('inline-block', 'start', 'icon', 'icon-triangle-right');
    }

    startStopLink.setAttribute('id', 'ionicenvironments-startstop-link');
    element.appendChild(startStopLink);

    const clickHandler = (event) => {
      event.preventDefault();
      let project = atom.project.getPaths()[0],
          runOptions;

      if (this.ionicIsRunning) {
        return this.stopIonic();
      } else {
        runOptions = atom.config.get('ionicenvironments:serveOptions');
        let env = atom.config.get('ionicenvironments.currentEnvironment');
        debugger;
        cmd.run(
          `
            cd ${project}
            ionic serve
          `
        );
      }

      atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), 'ionicenvironments:startstop')
    }

    element.addEventListener('click', clickHandler);
    this.clickStartStopSubscription = new Disposable(() => { element.removeEventListener('click', clickHandler) });

    return element;
  }

  attach() {
    if (this.envTile) {
      this.envTile.destroy();
    }

    if (this.startStop) {
      this.startStop.destroy();
    }

    this.envTile = this.statusBar.addRightTile({ item: this.getEnvironment(), priority: 16 })
    this.startStop = this.statusBar.addRightTile({ item: this.getStartStop(), priority: 15 })
  }

  subscribeToActiveTextEditor () {
    atom.views.updateDocument(() => {
      const editor = atom.workspace.getActiveTextEditor();

      if (editor) {
        this.attach();
      } else {
        if (this.envTile) {
          this.envTile.destroy();
        }
        if (this.startStop) {
          this.startStop.destroy();
        }
      }
    });
  }
  // Tear down any state and detach
  destroy() {
    if (this.clickEnvSubscription) {
      this.clickEnvSubscription.dispose();
    }
    if (this.clickStartStopSubscription) {
      this.clickStartStopSubscription.dispose();
    }

    if (this.configSubscription) {
      this.configSubscription.dispose()
    }

    if (this.envTile) {
      this.envTile.destroy();
    }

    if (this.startStop) {
      this.startStop.destroy();
    }
  }
}
