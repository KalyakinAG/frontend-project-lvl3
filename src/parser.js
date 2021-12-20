const parse = (data) => {
  const parserDOM = new DOMParser();
  const rss = parserDOM.parseFromString(data, 'application/xml');
  const parsererror = rss.querySelector('parsererror');
  if (parsererror !== null) {
    const e = new Error(parsererror.textContent);
    e.isParseError = true;
    throw e;
  }
  const channel = rss.querySelector('channel');
  const items = Array.from(channel.querySelectorAll('item'));
  return {
    title: channel.querySelector('title').textContent,
    description: channel.querySelector('description').textContent,
    items: items.map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    })),
  };
};

export default parse;
