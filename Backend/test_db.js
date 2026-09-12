const https = require('https');

// Check if the health endpoint that doesn't use DB works
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  // Test health (no DB)
  console.log('=== Health (no DB) ===');
  const h = await fetch('https://agrisathi-3eew.onrender.com/api/health');
  console.log(`Status: ${h.status}, Body: ${h.body}`);

  // Test products (uses DB)
  console.log('\n=== Products (uses DB) ===');
  const p = await fetch('https://agrisathi-3eew.onrender.com/api/products');
  console.log(`Status: ${p.status}, Body: ${p.body.substring(0, 200)}`);

  // Test users (uses DB)
  console.log('\n=== Users (uses DB) ===');
  const u = await fetch('https://agrisathi-3eew.onrender.com/api/users');
  console.log(`Status: ${u.status}, Body: ${u.body.substring(0, 200)}`);
  
  console.log('\n=== CONCLUSION ===');
  if (p.status === 500 || u.status >= 400) {
    console.log('⚠️  The deployed server CANNOT connect to TiDB Cloud.');
    console.log('   Health endpoint works (no DB), but all DB queries fail.');
    console.log('   This is likely a missing/wrong DB env var on Render,');
    console.log('   or TiDB requires an SSL CA cert that Render does not have.');
    console.log('');
    console.log('   FIX: Check Render environment variables match your .env:');
    console.log('   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL');
  }
}

main().catch(console.error);
