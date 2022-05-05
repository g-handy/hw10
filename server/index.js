import { ScoresDatabase } from './scores-db.js';

import express from 'express';
import logger from 'morgan';

// Create the Express app and set the port number.
const app = express();
const port = process.env.PORT || 8080;

class ScoresServer {
  constructor(dburl) {
    this.dburl = dburl;
    this.app = express();
    this.app.use('/', express.static('client'));
  }

  async initRoutes() {
    // Note: when using arrow functions, the "this" binding is lost.
    const self = this;

    this.app.post('/wordScore', async (req, res) => {
      try {
        const { name, word, score } = req.query;
        const wordScore = await self.db.createWordScore(name, word, score);
        res.send(JSON.stringify(wordScore));
      } catch (err) {
        res.status(500).send(err);
      }
    });

    this.app.post('/gameScore', async (req, res) => {
      try {
        const { name, score } = req.query;
        const gameScore = await self.db.createGameScore(name, score);
        res.send(JSON.stringify(gameScore));
      } catch (err) {
        res.status(500).send(err);
      }
    });

    this.app.get('/highestWordScores', async (req, res) => {
      try {
        const scores = await self.db.topTenWordScores();
        res.send(JSON.stringify(scores));
      } catch (err) {
        res.status(500).send(err);
      }
    });

    this.app.get('/highestGameScores', async (req, res) => {
      try {
        const scores = await self.db.topTenGameScores();
        res.send(JSON.stringify(scores));
      } catch (err) {
        res.status(500).send(err);
      }
    });
  }


  async initDb() {
    this.db = new ScoresDatabase(this.dburl);
    await this.db.connect();
  }

  async start() {
    await this.initRoutes();
    await this.initDb();
    const port = process.env.PORT || 8080;
    this.app.listen(port, () => {
      console.log(`ScoresServer listening on port ${port}!`);
    });
  }
}

const server = new ScoresServer(process.env.DATABASE_URL);
server.start();
