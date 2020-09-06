import { fetchOk } from './fetchHelpers';

export const pollTalks = async (update) => {
  let tag = undefined;

  for (; ;) {
    let response;
    try {
      response = await fetchOk('/talks', {
        headers: tag && {
          'If-None-Match': tag,
          "Prefer": 'wait=90'
        }
      });
    } catch (err) {
      console.log('Request failed: ' + err);
      await new Promise(resolve => setTimeout(resolve, 500));
      continue;
    }

    if (response.status === 304) continue;

    tag = response.headers.get('Etag');
    update(await response.json());
  }
}

