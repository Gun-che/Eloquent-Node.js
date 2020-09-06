import { elt } from './elt';
import { renderUesrField, renderTalkForm, renderTalk } from './renderFunctions';

export class SkillShareApp {
  dispatch: any;
  talkDOM: HTMLElement;
  dom: HTMLElement;
  talks: any;

  constructor(state, dispatch) {
    this.dispatch = dispatch;
    this.talkDOM = elt('div', { className: 'talks' });
    this.dom = elt('div', null,
      renderUesrField(state.user, dispatch),
      this.talkDOM,
      renderTalkForm(dispatch),
    )
    this.syncState(state);
  }

  syncState(state) {
    if (state.talks != this.talks) {
      this.talkDOM.textContent = '';

      for (const talk of state.talks) {
        this.talkDOM.appendChild(
          renderTalk(talk, this.dispatch)
        );
      }
      this.talks = state.talks;
    }
  }
}