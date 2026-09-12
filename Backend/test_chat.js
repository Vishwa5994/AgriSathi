const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super_secret_sih_farmer_market_key_2026';

// Generate token for a test buyer (user_id: 2, name: 'Suresh Raina')
const buyerToken = jwt.sign({ user_id: 2, id: 2, name: 'Suresh Raina', email: 'suresh@buyer.com', role: 'BUYER' }, JWT_SECRET, { expiresIn: '1h' });

// Generate token for a test farmer (user_id: 1, name: 'Ramesh Patel')
const farmerToken = jwt.sign({ user_id: 1, id: 1, name: 'Ramesh Patel', email: 'ramesh@farmer.com', role: 'FARMER' }, JWT_SECRET, { expiresIn: '1h' });

function postChat(title, body, token = null) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: headers
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        console.log('================================================================');
        console.log(title);
        console.log('================================================================');
        try {
          const json = JSON.parse(raw);
          console.log('Intent Detected:', json.intent);
          console.log('\n--- GROUNDING CONTEXT INJECTED ---');
          console.log(JSON.stringify(json.grounding_context, null, 2));
          console.log('\n--- CHATBOT FINAL RESPONSE ---');
          console.log(json.reply);
        } catch(e) {
          console.log('Raw response:', raw);
        }
        console.log('\n');
        resolve();
      });
    });
    req.on('error', (e) => {
      console.log('ERROR:', e.message);
      resolve();
    });
    req.write(data);
    req.end();
  });
}

async function runAllTests() {
  console.log('Running 5 Verification Test Cases for RAG Grounded Chatbot...\n');

  // Test 1: Price Trend for Wheat (cross-checked with ML prediction model)
  await postChat('TEST 1: Price Trend for Wheat (ML Model Grounding)', {
    message: "What's the current price trend for Wheat?"
  });

  // Test 2: "Show me my recent orders" logged in as Buyer (user_id: 2)
  await postChat('TEST 2: Show me my recent orders (Logged in as Buyer: Suresh Raina, user_id: 2)', {
    message: "Show me my recent orders"
  }, buyerToken);

  // Test 3: "Show me my recent orders" logged in as Farmer (user_id: 1)
  await postChat('TEST 3: Show me my recent orders (Logged in as Farmer: Ramesh Patel, user_id: 1)', {
    message: "Show me my recent orders"
  }, farmerToken);

  // Test 4: General question with no specific data need
  await postChat('TEST 4: General question (How to list a product as a farmer)', {
    message: "How do I list a product as a farmer?"
  });

  // Test 5: Unknown commodity with NO data (DragonFruit)
  await postChat('TEST 5: Unknown Commodity (DragonFruit Price)', {
    message: "What is the price of DragonFruit?"
  });
}

runAllTests();
