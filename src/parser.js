const parse = (data) => {
  try {
    const parserDOM = new DOMParser();
    const rss = parserDOM.parseFromString(data, 'application/xml');
    const parsererror = rss.querySelector('parsererror');
    if (parsererror !== null) {
      throw new Error(parsererror.textContent);
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
  } catch (e) {
    e.isParseError = true;
    throw e;
  }
};

export default parse;
