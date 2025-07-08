/**
 * Railway BirdNET API Diagnostic Script
 * Helps debug 5xx errors and deployment issues
 */

const RAILWAY_URL = process.argv[2];

if (!RAILWAY_URL) {
  console.error('❌ Please provide your Railway deployment URL');
  console.error('Usage: node debug-railway.js <RAILWAY_URL>');
  process.exit(1);
}

async function debugRailwayAPI() {
  console.log(`🔍 Debugging Railway BirdNET API at: ${RAILWAY_URL}\n`);
  
  // Test 1: Basic connectivity
  console.log('1️⃣ Testing basic connectivity...');
  try {
    const response = await fetch(RAILWAY_URL, { 
      method: 'GET',
      timeout: 10000 
    });
    console.log(`   Status: ${response.status}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    
    if (response.ok) {
      const text = await response.text();
      console.log(`   Response: ${text.substring(0, 200)}...`);
    }
  } catch (error) {
    console.error(`   ❌ Connectivity failed: ${error.message}`);
    return;
  }

  // Test 2: Check /analyze endpoint with longer timeout
  console.log('\n2️⃣ Testing /analyze endpoint (may take 60+ seconds for cold start)...');
  try {
    const startTime = Date.now();
    const response = await fetch(`${RAILWAY_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        url: 'https://httpbin.org/status/200', // Dummy URL
        min_conf: 0.1 
      }),
      timeout: 120000 // 2 minutes for cold start
    });
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`   Status: ${response.status} (took ${duration}s)`);
    
    const text = await response.text();
    console.log(`   Response: ${text.substring(0, 500)}...`);
    
    if (response.status >= 500) {
      console.log(`   🚨 5xx Error detected! Check Railway logs for details.`);
    }
    
  } catch (error) {
    console.error(`   ❌ Analyze test failed: ${error.message}`);
  }

  // Test 3: Memory and performance check
  console.log('\n3️⃣ Performance analysis...');
  console.log('   If you see timeouts or 5xx errors, common causes:');
  console.log('   • Railway memory limits exceeded');
  console.log('   • BirdNET model failed to load');
  console.log('   • Cold start timeout (first request can take 2+ minutes)');
  console.log('   • Missing dependencies in Railway deployment');
  
  console.log('\n🔧 Debugging recommendations:');
  console.log('   1. Check Railway deployment logs');
  console.log('   2. Verify model files are properly deployed');
  console.log('   3. Ensure sufficient memory allocation');
  console.log('   4. Test with smaller audio files first');
}

debugRailwayAPI().catch(console.error); 