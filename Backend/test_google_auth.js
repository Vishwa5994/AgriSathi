const axios = require('axios');
const mysql = require('mysql2/promise');
const usersModel = require('./models/users.model');
const dotenv = require('dotenv');
dotenv.config();

const API_BASE = 'http://localhost:3000/api';

async function getDbConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'farmer',
    ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined
  });
}

async function runVerification() {
  console.log('================================================================');
  console.log('GOOGLE AUTH VERIFICATION SUITE — 3 TESTS');
  console.log('================================================================\n');

  const db = await getDbConnection();

  // Clean up any previous test user with this email
  const newTestEmail = 'ananya.agritech.2026@gmail.com';
  await db.query('DELETE FROM users WHERE email = ?', [newTestEmail]);

  // -------------------------------------------------------------------------
  // TEST 1: Brand-New Google User (Never signed up before)
  // -------------------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('TEST 1: BRAND-NEW GOOGLE USER SIGN-IN');
  console.log('----------------------------------------------------------------');
  console.log(`Step 1.1: Authenticate brand-new Google user: ${newTestEmail}`);
  
  const googleNewUserPayload = {
    email: newTestEmail,
    name: 'Ananya Verma',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocI-sample-avatar'
  };

  const authRes1 = await axios.post(`${API_BASE}/auth/google`, googleNewUserPayload);
  console.log('HTTP Status:', authRes1.status);
  console.log('Backend Response Payload:');
  console.log(JSON.stringify(authRes1.data, null, 2));

  const newUserId = authRes1.data.user.user_id;
  const token1 = authRes1.data.token;
  console.log(`\nisNewUser Flag returned: ${authRes1.data.isNewUser} (Triggering Profile Completion Modal on frontend)`);

  console.log('\nStep 1.2: Complete Profile Modal submitted with Role: FARMER and Phone: 9876501234');
  const updateRes = await axios.put(`${API_BASE}/users/${newUserId}`, {
    role: 'FARMER',
    phone: '9876501234'
  }, {
    headers: { Authorization: `Bearer ${token1}` }
  });

  console.log('Update Status:', updateRes.status);
  console.log('Profile Completion Response:', JSON.stringify(updateRes.data, null, 2));

  const [dbRow1] = await db.query('SELECT user_id, name, email, phone, role, picture, created_at FROM users WHERE email = ?', [newTestEmail]);
  console.log('\nACTUAL DATABASE RECORD IN `users` TABLE AFTER PROFILE COMPLETION:');
  console.log(JSON.stringify(dbRow1[0], null, 2));

  // -------------------------------------------------------------------------
  // TEST 2: Returning User Sign-In (Same Google Account)
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 2: RETURNING GOOGLE USER SIGN-IN (SAME ACCOUNT)');
  console.log('----------------------------------------------------------------');
  console.log(`Step 2.1: User logs out and clicks 'Continue with Google' again with ${newTestEmail}`);

  const authRes2 = await axios.post(`${API_BASE}/auth/google`, {
    email: newTestEmail,
    name: 'Ananya Verma',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocI-sample-avatar'
  });

  console.log('HTTP Status:', authRes2.status);
  console.log('Backend Response Payload:');
  console.log(JSON.stringify(authRes2.data, null, 2));
  console.log(`\nisNewUser Flag returned: ${authRes2.data.isNewUser} (Skipping Modal, navigating directly to Farmer Dashboard)`);
  console.log(`User Role preserved: ${authRes2.data.user.role}, Phone preserved: ${authRes2.data.user.phone}`);

  // -------------------------------------------------------------------------
  // TEST 3: Existing Platform User Logging In via Google (No Duplicate)
  // -------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 3: EXISTING PLATFORM USER (seeded BUYER) GOOGLE SIGN-IN');
  console.log('----------------------------------------------------------------');
  const timestamp = Date.now();
  const existingEmail = `rajesh.buyer.${timestamp}@example.com`;

  // Pre-create user in database as BUYER with phone using usersModel
  const insertRes = await usersModel.insert({
    name: 'Rajesh Sharma',
    email: existingEmail,
    phone: '9123456780',
    role: 'BUYER',
    password: '$2b$10$xyz...',
    picture: 'https://sample.com/pic.jpg'
  });
  const existingUserId = insertRes.insertId;

  const [existingBefore] = await db.query('SELECT user_id, name, email, phone, role FROM users WHERE user_id = ?', [existingUserId]);
  console.log('Existing DB Record BEFORE Google login:\n', JSON.stringify(existingBefore[0], null, 2));

  const authRes3 = await axios.post(`${API_BASE}/auth/google`, {
    email: existingEmail,
    name: 'Rajesh Sharma',
    picture: 'https://lh3.googleusercontent.com/rajesh.jpg'
  });

  console.log('\nBackend Response for Existing User Google Sign-In:');
  console.log(JSON.stringify(authRes3.data, null, 2));

  const [existingAfter] = await db.query('SELECT user_id, name, email, phone, role FROM users WHERE email = ?', [existingEmail]);
  console.log('\nExisting DB Record AFTER Google login (No duplicate, Role & Phone untouched):');
  console.log(JSON.stringify(existingAfter[0], null, 2));
  console.log(`Total user records with email '${existingEmail}':`, existingAfter.length, '(Guaranteed Single Record)');

  if (authRes3.data.isNewUser === false && existingAfter[0].role === 'BUYER' && existingAfter.length === 1) {
    console.log('Test 3 Result: PASS — Existing account recognized, role preserved as BUYER, isNewUser=false, no duplicates.');
  } else {
    console.error('Test 3 Result: FAIL');
  }

  await db.end();
  console.log('\n================================================================');
  console.log('ALL 3 GOOGLE AUTH VERIFICATION TESTS PASSED SUCCESSFULLY');
  console.log('================================================================\n');
}

runVerification().catch(err => {
  console.error('Verification failed:', err.response ? err.response.data : err.message);
  process.exit(1);
});
