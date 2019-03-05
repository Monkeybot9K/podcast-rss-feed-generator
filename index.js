const express = require('express');

const {env} = require('./config/config');
const podcast = require('./lib/podcast');

const app = express();

app.use((err, req, res, next) => {
  console.log(`Error caught: ${err}`)
  res.sendStatus(err.httpStatusCode).json(err)
})

app.get('/',
  podcast.fetchFeed, (req, res) => {
    res.setTimeout(120000)
    res.type('xml');
    res.status(200).send(req.feed);
    console.log('Feed successfully generated and retrieved');
  }
);

app.listen(env.port, () => {
  console.log(`Running on port ${env.port}`);
});