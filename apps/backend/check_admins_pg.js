const { Client } = require('pg');

async function checkAdmins() {
  const client = new Client({
    connectionString: "postgresql://postgres:1234@localhost:5432/bd_uoc"
  });
  try {
    await client.connect();
    const res = await client.query("SELECT COUNT(*) FROM \"User\" JOIN \"Role\" ON \"User\".role_id = \"Role\".role_id WHERE \"Role\".role_name = 'ADMIN'");
    console.log('Admin count:', res.rows[0].count);
    
    const users = await client.query("SELECT email, name FROM \"User\" JOIN \"Role\" ON \"User\".role_id = \"Role\".role_id WHERE \"Role\".role_name = 'ADMIN'");
    console.log('Admins:', users.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
checkAdmins();
