const bcrypt = require('bcryptjs');

const password = 'password123';
const saltRounds = 10;

async function generateHashes() {
  console.log('Generating bcrypt hashes for password: "password123"\n');
  
  for (let i = 0; i < 9; i++) {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`Hash ${i + 1}: '${hash}'`);
  }
}

generateHashes();
