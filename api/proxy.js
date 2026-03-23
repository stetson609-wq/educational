// api/proxy.js
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  // Stream chunks instead of loading entire file
  const filePath = path.join(process.cwd(), 'public', 'index.html');
  const stat = fs.statSync(filePath);
  
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': stat.size
  });
  
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}
