const express = require('express');

const {env} = require('./config/config');
const podcast = require('./lib/podcast');

const app = express();

app.get('/',
  podcast.fetchFeed,
  (req, res) => {
    res.type('xml');
    res.status(200).send(req.feed);
  }
);

app.listen(env.port, () => {
  console.log(`Running on port ${env.port}`);
});