const archive = require('internet-archive');
const map = require('async/map');
const find = require('lodash/find');

const {env} = require('../config/config');

const fields = ['identifier', 'title', 'description', 'date', 'source', 'subject'];

const params = {
  q: `collection:(${env.archiveCollection})`,
  rows: env.numberOfRows,
  sort: ['date desc'],
  fl: ['identifier']
};

const template = (metadata) => {
  // TODO: make method for regexing stuff
  let sanitizedTitle = metadata.title.replace(/<(?:.|\n)*?>/gm, ' ').replace(/&(?!amp;)/g, `&amp;`);
  let sanitizedSummary = metadata.description.replace(/<(?:.|\n)*?>/gm, ' ').replace(/&(?!amp;)/g, `&amp;`);
  
  return `<item>
    <title>${sanitizedTitle}</title>
    <itunes:summary>${sanitizedSummary}</itunes:summary>
    <itunes:image href="${metadata.image}"/>
    <enclosure url="https://archive.org/download/${metadata.identifier}/format=VBR+MP3&amp;ignore=x.mp3" type="audio/mpeg"/>
    <guid>https://archive.org/download/${metadata.identifier}/format=VBR+MP3&amp;ignore=x.mp3</guid>
    <pubDate>${new Date(metadata.date).toUTCString()}</pubDate>
    <itunes:duration>${metadata.length}</itunes:duration>
  </item>`
};

const podcast = module.exports = {}

podcast.fetchFeed = function fetchFeed(req, res, next) {
  console.log('Fetching Feed from Archive.org')
  
  archive.advancedSearch(params, function(err, results) {
    if (err) return next(err);

    map(results.response.docs, (doc, callback) => {
      const id = doc.identifier;

      archive.metadata(id, callback);
    }, function(err, results) {
      if (err) return next(err);

      console.log('Mapping feed onto xml');

      const items = results.map(result => {
        const mp3File = find(result.files, {format: 'VBR MP3'});

        const metadata = Object.assign({}, result.metadata, {
          length: mp3File.length,
          image: `(${env.image})`
        });

        return template(metadata);
      }).join('');

      req.feed =`<?xml version="1.0" encoding="UTF-8"?>
      <rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
      <channel>
        <title>${env.podcastTitle}</title>
        <link>${env.authorURL}</link>
        <language>${env.language}</language>
        <image>
          <title>${env.podcastTitle}</title>
          <url>${env.image}</url>
          <link>${env.authorURL}</link>
        </image>
        <itunes:author>${env.author}</itunes:author>
        <itunes:summary>${env.podcastDescription}</itunes:summary>
        <description>${env.podcastDescription}</description>
        <itunes:owner>
          <itunes:name>${env.author}</itunes:name>
          <itunes:email>${env.authorEmail}</itunes:email>
        </itunes:owner>
        <itunes:image href="${env.image}" />
        <itunes:category text="${env.parentCategory}">
          <itunes:category text="${env.category}" />
        </itunes:category>
        <itunes:explicit>${env.explicit}</itunes:explicit>`
      + items + '</channel></rss>';

      next();
    });
  });
}
