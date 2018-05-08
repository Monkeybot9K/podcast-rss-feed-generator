const express = require('express');
const git = require('nodegit');

const config = require('./config');
const podcast = require('./lib/podcast');

const app = express();

app.get('/',
  podcast.fetchFeed,
  (req, res) => {
    res.type('xml');
    res.status(200).send(req.feed);
  }
);

app.listen(process.env.PORT || config.port, () => {
  console.log(`Running on port ${process.env.PORT || config.port}`);
});