import { talkURL, reportError, fetchOk } from './fetchHelpers';
export const handleAction = (state, action) => {

  if (action.type === 'setUser') {
    localStorage.setItem('userName', action.user);
    return {
      ...state,
      user: action.user,
    }

  } else if (action.type === 'setTalks') {
    return {
      ...state,
      talks: action.talks,
    }

  } else if (action.type === 'newTalk') {
    fetchOk(talkURL(action.title), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        presenter: state.user,
        summary: action.summary,
      })

    }).catch(reportError);

  } else if (action.type === 'deletTalk') {
    fetchOk(talkURL(action.title), {
      method: "DELETE"
    }).catch(reportError);

  } else if (action.type === 'newComment') {
    fetchOk(talkURL(action.title) + '/comments', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        author: state.user,
        message: action.message,
      })

    }).catch(reportError);
  }

  return state;
}