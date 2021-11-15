const parse = (data) => {
  try {
    const parserDOM = new DOMParser();
    const rss = parserDOM.parseFromString(data, 'application/xml');
    const channel = rss.querySelector('channel');
    const postsItems = Array.from(channel.querySelectorAll('item'));
    const feed = {
      title: channel.querySelector('title').textContent,
      description: channel.querySelector('description').textContent,
      link: channel.querySelector('link').textContent,
      items: postsItems.map((item) => ({
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        link: item.querySelector('link').textContent,
        pubDate: new Date(item.querySelector('pubDate').textContent),
      })),
    };
    return feed;
  } catch (e) {
    throw new Error('invalid_rss');
  }
};

export default parse;
