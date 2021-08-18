import _ from 'lodash';

const parse = (response) => {
  try {
    if (response === null) throw new Error('invalid_rss');
    if (_.has(response, 'data.status.http_code') && response.data.status.http_code !== 200) {
      throw new Error('invalid_rss');
    }
    if (_.has(response, 'request.response.statusCode') && response.request.response.statusCode !== 200) {
      throw new Error('invalid_rss');
    }
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
    const posts = postsItems.map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
      guid: item.querySelector('guid').textContent,
      feedGuid: feed.guid,
      pubDate: new Date(item.querySelector('pubDate').textContent),
    }));
    return [feed, posts];
  } catch (e) {
    throw new Error('invalid_rss');
  }
};

export default parse;
