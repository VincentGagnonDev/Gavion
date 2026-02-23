const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'gavion_crm'
});

client.connect()
  .then(() => {
    console.log('Connected!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Result:', res.rows);
    client.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    client.end();
  });
