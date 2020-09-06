import { elt } from './elt';

export const renderUesrField = (name: string, dispatch: any) => {
  return elt('label', {}, 'Your name', elt('input', {
    type: 'text',
    value: name,
    onchange(e: InputEvent) {
      dispatch({
        type: 'setUser',
        user: e.target.value
      })
    }
  }));
}

export const renderTalk = (talk, dispatch) => {

  return elt('section', { className: 'talk' },

    elt('h2', null, talk.title, " ",

      elt('button', {
        onclick() {
          dispatch({ type: 'deleteTalk', talk: talk.title });
        }
      }, 'Delete')),

    elt('div', null, 'by ',

      elt('strong', null, talk.presenter)),

    elt('p', null, talk.summary),
    ...talk.comments.map(renderComment),

    elt('form', {
      onsubmit(e: InputEvent) {
        e.preventDefault();
        let form = e.target as HTMLFormElement & { elements: { comment: { value: string } } };
        dispatch({
          type: 'newComment',
          talk: talk.title,
          message: form.elements.comment.value
        })

        form.reset();
      }

    }, elt('input', {
      type: 'text',
      name: 'comment'
    }), ' ',

      elt('button', {
        type: 'submit',
      }, 'Add comment')
    )
  );
}

function renderComment(comment: any) {
  return elt('p', { className: 'comment' },
    elt('strong', null, comment.autor),
    ': ', comment.message);
}

function renderTalkForm(dispatch) {
  let title = elt('input', { type: 'text' });
  let summary = elt('input', { type: 'text' });

  return elt('form', {
    onsubmit(event: Event) {
      event.preventDefault();
      dispatch({
        type: 'newTalk',
        title: title.value,
        summary: summary.value,
      });
      (event.target as HTMLFormElement).reset()
    }
  }, elt('h3', null, 'Submit a Talk'),
    elt('label', null, 'Title: ', title),
    elt('label', null, 'Summary: ', summary),
    elt('button', { type: 'submit' }, 'Submit')
  );
}