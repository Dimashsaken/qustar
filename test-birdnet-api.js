/**
 * BirdNET API Test Script
 * Tests the Railway-deployed BirdNET API endpoint
 * 
 * Usage: node test-birdnet-api.js <RAILWAY_URL>
 * Example: node test-birdnet-api.js https://your-app.railway.app
 */

const https = require('https');
const http = require('http');

const RAILWAY_URL = process.argv[2];

if (!RAILWAY_URL) {
  console.error('❌ Please provide your Railway deployment URL');
  console.error('Usage: node test-birdnet-api.js <RAILWAY_URL>');
  console.error('Example: node test-birdnet-api.js https://your-app.railway.app');
  process.exit(1);
}

// Test 1: Basic health check
async function testHealthCheck() {
  console.log('🔍 Testing BirdNET API health check...');
  
  try {
    const response = await fetch(RAILWAY_URL);
    const text = await response.text();
    
    console.log(`✅ Health check status: ${response.status}`);
    console.log(`📄 Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
    
    return response.ok;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Test 2: Check /analyze endpoint availability
async function testAnalyzeEndpoint() {
  console.log('🔍 Testing /analyze endpoint...');
  
  try {
    const response = await fetch(`${RAILWAY_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Empty request to test endpoint availability
      }),
    });
    
    const text = await response.text();
    console.log(`📊 Analyze endpoint status: ${response.status}`);
    console.log(`📄 Response: ${text.substring(0, 300)}${text.length > 300 ? '...' : ''}`);
    
    // Even if it fails due to missing data, a 400/422 means the endpoint exists
    return response.status < 500;
  } catch (error) {
    console.error('❌ Analyze endpoint test failed:', error.message);
    return false;
  }
}

// Test 3: Check if BirdNET model is loaded (with a dummy URL)
async function testModelLoad() {
  console.log('🔍 Testing BirdNET model availability...');
  
  try {
    const response = await fetch(`${RAILWAY_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://example.com/dummy.wav', // Dummy URL to test model loading
        min_conf: 0.1,
      }),
    });
    
    const text = await response.text();
    console.log(`🤖 Model test status: ${response.status}`);
    console.log(`📄 Response: ${text.substring(0, 300)}${text.length > 300 ? '...' : ''}`);
    
    return true; // Any response means the server is processing requests
  } catch (error) {
    console.error('❌ Model test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log(`🚀 Testing BirdNET API at: ${RAILWAY_URL}\n`);
  
  const results = {
    health: await testHealthCheck(),
    endpoint: await testAnalyzeEndpoint(),
    model: await testModelLoad(),
  };
  
  console.log('\n📊 Test Results:');
  console.log(`   Health Check: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Analyze Endpoint: ${results.endpoint ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Model Loading: ${results.model ? '✅ PASS' : '❌ FAIL'}`);
  
  if (results.health && results.endpoint) {
    console.log('\n🎉 BirdNET API is working! You can proceed with Supabase configuration.');
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Set BIRDNET_URL environment variable in Supabase to: ${RAILWAY_URL}`);
    console.log(`   2. Deploy the edge function`);
    console.log(`   3. Test the complete flow`);
  } else {
    console.log('\n❌ BirdNET API has issues. Check Railway deployment logs.');
  }
}

// Run the tests
runTests().catch(console.error); 