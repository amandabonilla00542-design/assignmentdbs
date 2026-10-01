const bcrypt = require('bcryptjs');

const hash = "$2a$12$N9bQMbDIS1oibdcSvJz4c.JCbbMON/m7F0xQWQnBZ07l1lkg6/6xa";
const password = "limchen03xaa1chen";

console.log("Hash:", hash);
console.log("Password:", password);
console.log("Match:", bcrypt.compareSync(password, hash));