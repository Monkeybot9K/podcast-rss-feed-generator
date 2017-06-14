const request = require('superagent');
const archive = require('internet-archive');
const map = require('async/map');
const find = require('lodash/find');

const config = require('../config');

const fields = ['identifier', 'title', 'description', 'date', 'source', 'subject'];

const params = {
  q: `collection:(${process.env.COLLECTION || config.archiveCollection})`,
  rows: process.env.NUMBER_OF_ROWS || config.numberOfRows,
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
  archive.advancedSearch(params, function(err, results) {
    if (err) return next(err);

    map(results.response.docs, (doc, callback) => {
      const id = doc.identifier;
      console.log(id);

      archive.metadata(id, callback);
    }, function(err, results) {
      if (err) return next(err);

      const items = results.map(result => {
        const mp3File = find(result.files, {format: 'VBR MP3'});

        const metadata = Object.assign({}, result.metadata, {
          length: mp3File.length,
          image: `(${process.env.AUTHOR_LOGO_1400_URL || config.image})`
        });

        return template(metadata);
      }).join('');

      req.feed =`<?xml version="1.0" encoding="UTF-8"?>
      <rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
      <channel>
        <title>${process.env.PODCAST_NAME}</title>
        <link>${process.env.AUTHOR_URL}</link>
        <language>${process.env.LANGUAGE}</language>
        <image>
          <title>SpreadShotNews</title>
          <url>${process.env.AUTHOR_LOGO_1400_URL}</url>
          <link>${process.env.AUTHOR_URL}</link>
        </image>
        <itunes:author>${process.env.AUTHOR}</itunes:author>
        <itunes:summary>${process.env.PODCAST_DESCRIPTION}</itunes:summary>
        <description>${process.env.PODCAST_DESCRIPTION}</description>
        <itunes:owner>
          <itunes:name>${process.env.AUTHOR}</itunes:name>
          <itunes:email>${process.env.AUTHOR_EMAIL}</itunes:email>
        </itunes:owner>
        <itunes:image href="(${process.env.AUTHOR_LOGO_1400_URL})" />
        <itunes:category text="${process.env.PARENT_CATEGORY}">
          <itunes:category text="${process.env.CATEGORY}" />
        </itunes:category>
        <itunes:explicit>yes</itunes:explicit>`
      + items + '</channel></rss>';

      next();
    });
  });
}
