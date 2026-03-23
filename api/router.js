export default async function handler(req, res) {
  const ua = req.headers['user-agent'] || '';
  const verified = req.cookies._v === process.env.SECRET;
  const pending = req.cookies._pending === '1';
  
  const isMonitored = /goguardian|securely|blocksi|lightspeed|umbrella/i.test(ua);
  
  // Verified users get real content
  if (verified) {
    return res.send(atob(process.env.REAL_CONTENT));
  }
  
  // Monitored users get decoy with payload
  if (isMonitored && !verified) {
    const decoyContent = `
      <!DOCTYPE html>
      <html>
      <head><title>Learning Platform</title></head>
      <body>
        <h1>Educational Resources</h1>
        <p>Loading...</p>
        <script>
          localStorage.setItem('_payload', '${process.env.REAL_CONTENT}');
          window.location = '/decoy.html';
        </script>
      </body>
      </html>
    `;
    return res.send(decoyContent);
  }
  
  // Pending users waiting verification
  if (pending && !verified) {
    res.setHeader('Set-Cookie', `_pending=; Max-Age=0; HttpOnly`);
    const token = crypto.randomBytes(32).toString('hex');
    res.setHeader('Set-Cookie', `_v=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    return res.send(atob(process.env.REAL_CONTENT));
  }
  
  // Default: serve decoy
  const fs = require('fs');
  const path = require('path');
  const decoyContent = fs.readFileSync(path.join(process.cwd(), 'public', 'decoy.html'), 'utf8');
  return res.send(decoyContent);
}
