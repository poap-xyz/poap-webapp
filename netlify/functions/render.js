'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const axios = require('axios');
const morgan = require('morgan');

function dectectBot(userAgent) {
  const bots = [
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'slurp',
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'embedly',
    'baiduspider',
    'pinterest',
    'slackbot',
    'vkShare',
    'facebot',
    'outbrain',
    'W3C_Validator',
    'whatsapp',
    'telegrambot',
    'discordbot',
  ];
  const agent = userAgent.toLowerCase();
  console.log(agent, 'agent');
  for (const bot of bots) {
    if (agent.indexOf(bot) > -1) {
      console.log('bot detected', bot, agent);
      return true;
    }
  }

  console.log('no bots found');
  return false;
}

const getToken = async (id) => {
  try {
    return await axios.get('https://api.poap.xyz/token/' + id);
  } catch (error) {
    console.error(error);
  }
};

const router = express.Router();
router.get('/', async (req, res) => {
  const isBot = dectectBot(req.headers['user-agent']);
  const token = req.baseUrl.split('/')[2];
  if (isBot) {
    const response = await getToken(token);
    const { data } = response;
    const { event, tokenId } = data;
    if (event) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`
      <!doctype html>
      <head>
            <title>POAP #${tokenId}</title>
            <meta name="title" content="${event.name}">
            <meta name="description" content="${event.description}">
            <meta property="og:type" content="article">
            <meta property="og:site_name" content="POAP #${tokenId}">
            <meta property="og:title" content="${event.name}">
            <meta property="og:description" content="${event.description}">
            <meta property="og:image" content="${event.image_url}">
            <meta property="og:image:height" content="200">
            <meta property="og:image:width" content="200">
            <meta property="twitter:card" content="summary">
            <meta property="twitter:site" content="@poapxyz">
            <meta property="twitter:title" content="${event.name}">
            <meta property="twitter:description" content="${event.description}">
            <meta property="twitter:image" content="${event.image_url}">
      </head>
      <body>
        <article>
          <div>
            <h1>${event.name}</h1>
          </div>
          <div>
            <p>${event.description}</p>
          </div>
        </article>
      </body>
      </html>`);
      res.end();
    } else {
      res.redirect('http://' + req.hostname);
    }
  } else {
    res.redirect('http://' + req.hostname + '/r/token/' + token);
  }
});
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ');
  }),
);
app.use(
  ['/.netlify/functions/render/*', '/.netlify/functions/render/', '/.netlify/functions/render/token/*', '/token/*'],
  router,
); // path must route to lambda

module.exports.handler = serverless(app);
