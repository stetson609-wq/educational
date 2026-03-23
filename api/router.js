export default async function handler(req, res) {
  const ua = req.headers['user-agent'] || '';
  const verified = req.cookies._v === process.env.SECRET;
  const pending = req.cookies._pending === '1';
  
  // Rotate response based on detection
  const isMonitored = /goguardian|securely|blocksi|lightspeed/i.test(ua);
  
  if (isMonitored && !verified) {
    // Serve decoy but store real content in localStorage key
    return res.send(`
      <script>
        localStorage.setItem('_payload', '${Buffer.from(process.env.REAL_CONTENT).toString('base64')}');
        window.location = '/decoy';
      </script>
    `);
  }
  
  if (pending && !verified) {
    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    res.setHeader('Set-Cookie', `_v=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    return res.send(atob(process.env.REAL_CONTENT));
  }
  
  if (verified) {
    return res.send(atob(process.env.REAL_CONTENT));
  }
  
  // Default: decoy
  return res.sendFile('public/decoy.html');
}
