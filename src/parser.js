const parse = (data) => {
  try {
    const parserDOM = new DOMParser();
    const rss = parserDOM.parseFromString(data, 'application/xml');
    const channel = rss.querySelector('channel');
    const feed = {
      title: channel.querySelector('title').textContent,
      description: channel.querySelector('description').textContent,
      link: channel.querySelector('link').textContent,
      guid: channel.querySelector('guid').textContent,
    };
    const postsItems = Array.from(channel.querySelectorAll('item'));
    const posts = postsItems.map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
      guid: item.querySelector('guid').textContent,
      feedGuid: feed.guid,
      pubDate: new Date(item.querySelector('pubDate').textContent),
    }));
    return [feed, posts];
  } catch(e) {
    return [undefined, undefined];    
  }
};

export default parse;
