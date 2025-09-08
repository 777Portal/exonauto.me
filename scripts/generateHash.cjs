let pass = process.argv[2];
const argon2 = require('argon2');

async function generate(passToHash){
    const hash = await argon2.hash(passToHash);
    console.log(hash);
}

generate(pass);