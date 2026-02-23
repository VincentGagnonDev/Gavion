const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/gavion_crm',
});

pool.query('SELECT NOW()')
  .then(res => {
    console.log('Connected:', res.rows);
    pool.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    pool.end();
  });
