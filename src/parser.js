const parse = (response) => {
  try {
    const data = response.data.contents;
    const parserDOM = new DOMParser();
    const rss = parserDOM.parseFromString(data, 'application/xml');
    if (rss.documentElement.tagName === 'parsererror') {
      throw new Error('parsererror');
    }
    const channel = rss.querySelector('channel');
    const feed = {
      title: channel.querySelector('title').textContent,
      description: channel.querySelector('description').textContent,
      link: channel.querySelector('link').textContent,
      guid: channel.querySelector('guid').textContent,
    };
    const postsItems = Array.from(channel.querySelectorAll('item'));
    feed.posts = postsItems.map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
      guid: item.querySelector('guid').textContent,
      pubDate: new Date(item.querySelector('pubDate').textContent),
    }));
    return feed;
  } catch (e) {
    const error = new Error('invalid_rss');
    error.name = 'parse_error';
    throw error;
  }
};

export default parse;
