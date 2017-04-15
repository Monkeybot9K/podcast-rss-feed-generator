const request = require('superagent');
const archive = require('internet-archive');
const map = require('async/map');
const find = require('lodash/find');

const config = require('../config');

const fields = ['identifier', 'title', 'description', 'date', 'source', 'subject'];

const params = {
  q: `collection:(${process.env.PODCAST || config.archiveCollection})`,
  sort: 'date asc',
  fl: ['identifier']
};

const template = (metadata) => {
  return `
  <item>
    <title>${metadata.title}</title>
    <itunes:summary>${metadata.description}</itunes:summary>
    <itunes:image href="${metadata.image}"/>
    <enclosure url="https://archive.org/download/${metadata.identifier}/format=VBR+MP3&amp;ignore=x.mp3" type="audio/mpeg"/>
    <guid>https://archive.org/download/${metadata.identifier}/format=VBR+MP3&amp;ignore=x.mp3</guid>
    <pubDate>${new Date(metadata.date).toUTCString()}</pubDate>
    <itunes:duration>${metadata.length}</itunes:duration>
  </item>
  `
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
        console.log(result);
        const mp3File = find(result.files, {format: 'VBR MP3'});

        const metadata = Object.assign({}, result.metadata, {
          length: mp3File.length,
          image: 'http://spreadshotnews.com/wp-content/uploads/2015/07/SSN_Logo360.png' // TODO
        });

        return template(metadata);
      }).join('');

      req.feed = '<rss xmlns:creativeCommons="http://backend.userland.com/creativeCommonsRssModule" xmlns:media="http://search.yahoo.com/mrss/" version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">'+ items +'</rss>';

      next();
    });
  });
}
