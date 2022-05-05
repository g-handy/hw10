import 'dotenv/config';
import pg from 'pg';

// Get the Pool class from the pg module.
const { Pool } = pg;

export class ScoresDatabase {
  constructor(dburl) {
    this.dburl = dburl;
  }

  async connect() {
    // Create a new Pool. The Pool manages a set of connections to the database.
    // It will keep track of unused connections, and reuse them when new queries
    // are needed. The constructor requires a database URL to make the
    // connection. You can find the URL of your database by looking in Heroku
    // or you can run the following command in your terminal:
    //
    //  heroku pg:credentials:url -a APP_NAME
    //
    // Replace APP_NAME with the name of your app in Heroku.
    this.pool = new Pool({
      connectionString: this.dburl,
      ssl: { rejectUnauthorized: false }, // Required for Heroku connections
    });

    // Create the pool.
    this.client = await this.pool.connect();

    // Init the database.
    //await this.init();
  }
/*
  async init() {
    const queryText = `
      create table if not exists people (
        id varchar(30) primary key,
        name varchar(30),
        age integer
      );
      
      insert into 
        people(id, name, age) 
      values 
        ('1', 'Artemis', 19),
        ('2', 'Parzival', 17),
        ('3', 'John', 30),
        ('4', 'Mia', 22);
    `;
    const res = await this.client.query(queryText);
  }
*/
  // Close the pool.
  async close() {
    this.client.release();
    await this.pool.end();
  }

  async createWordScore(name, word, score) {
    const queryText =
      'INSERT INTO wordScores (name, word, score) VALUES ($1, $2, $3) RETURNING *';
    const res = await this.client.query(queryText, [name, word, score]);
    return res.rows;
  }

  async createGameScore(name, score) {
    const queryText =
      'INSERT INTO gameScores (name, score) VALUES ($1, $2) RETURNING *';
    const res = await this.client.query(queryText, [name, score]);
    return res.rows;
  }

  async topTenGameScores() {
    const queryText = 'SELECT * FROM gameScores ORDER BY score DESC LIMIT 10';
    const res = await this.client.query(queryText);
    return res.rows;
  }

  async topTenWordScores() {
    const queryText = 'SELECT * FROM wordScores ORDER BY score DESC LIMIT 10';
    const res = await this.client.query(queryText);
    return res.rows;
  }
  async allWordScores() {
    const queryText = 'SELECT * FROM wordScores';
    const res = await this.client.query(queryText);
    return res.rows;
  }
}