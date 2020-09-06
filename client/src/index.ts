import { reportError } from './fetchHelpers';
import { pollTalks } from './pollTalks';
import { SkillShareApp } from './SkillShareApp';
import { handleAction } from './handleAction';

function runApp() {
  let user = localStorage.getItem('newUser') || 'Anon';
  let state, app: SkillShareApp;

  function dispatch(action) {
    state = handleAction(state, action);
    app.syncState(state)
  }

  pollTalks(talks => {

    if (!app) {
      state = { user, talks };
      app = new SkillShareApp(state, dispatch);
      document.body.appendChild(app.dom);

    } else {
      dispatch({ type: 'setTalks', talks });
    }
  }).catch(reportError)
}

runApp();