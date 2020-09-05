export const fetchOk = (url: RequestInfo, options: RequestInit) => {
  return fetch(url, options).then(response => {
    if (response.status < 400) {
      return response

    } else throw new Error(response.statusText);
  });
}

export const talkURL = (title: string) => {
  return 'talks/' + encodeURIComponent(title);
}

export const reportError = (err: Error) => {
  alert(String(err));
}