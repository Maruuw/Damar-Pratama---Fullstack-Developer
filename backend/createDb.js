const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    connectionString: 'postgresql://postgres:maru1209@localhost:5000/postgres?schema=public'
  });
  
  try {
    await client.connect();
    await client.query('CREATE DATABASE job_app_management;');
    console.log("Berhasil membuat database job_app_management!");
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log("Database sudah ada.");
    } else {
      console.error("Gagal membuat database:", err.message);
    }
  } finally {
    await client.end();
  }
}

createDb();
