const fs = require('fs');

const [fullname, email, ownership, agreement, session_id] = process.argv.slice(2);

const log = {
  session_id,
  timestamp: new Date().toISOString(),
  company: "GhostTech",
  owner: "Ghostdevol",
  user: {
    fullname,
    email,
    ownership,
    agreement
  }
};

fs.writeFileSync(`./logs/${session_id}.json`, JSON.stringify(log, null, 2));
console.log(`📁 Consent log saved: ./logs/${session_id}.json`);
