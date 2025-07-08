/**
 * Supabase Edge Function Integration Test
 * Tests the complete flow from Supabase Edge Function to BirdNET API
 * 
 * Prerequisites:
 * 1. BIRDNET_URL environment variable set in Supabase
 * 2. Edge function deployed
 * 3. Service role key available
 * 
 * Usage: node test-supabase-integration.js
 */

// Configuration - Update these with your actual values
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://odmfmyrdaisfboswcidq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node test-supabase-integration.js');
  process.exit(1);
}

// Test 1: Check if edge function exists
async function testEdgeFunctionExists() {
  console.log('🔍 Testing if birdnet-analyze edge function exists...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/birdnet-analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Test with missing required fields to check if function exists
      }),
    });
    
    const text = await response.text();
    console.log(`📊 Edge function status: ${response.status}`);
    console.log(`📄 Response: ${text.substring(0, 300)}${text.length > 300 ? '...' : ''}`);
    
    // Function exists if we get 400 (bad request) rather than 404 (not found)
    if (response.status === 404) {
      console.log('❌ Edge function not found. Make sure it\'s deployed.');
      return false;
    }
    
    console.log('✅ Edge function is accessible');
    return true;
  } catch (error) {
    console.error('❌ Edge function test failed:', error.message);
    return false;
  }
}

// Test 2: Check BIRDNET_URL environment variable
async function testBirdnetUrlEnvVar() {
  console.log('🔍 Testing BIRDNET_URL environment variable...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/birdnet-analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioId: 'test-id',
        storagePath: 'test/path.m4a',
      }),
    });
    
    const text = await response.text();
    console.log(`📊 Environment test status: ${response.status}`);
    console.log(`📄 Response: ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`);
    
    // Check if the error mentions BIRDNET_URL
    if (text.includes('BIRDNET_URL environment variable not set')) {
      console.log('❌ BIRDNET_URL environment variable is not set in Supabase');
      return false;
    }
    
    console.log('✅ BIRDNET_URL environment variable appears to be set');
    return true;
  } catch (error) {
    console.error('❌ Environment variable test failed:', error.message);
    return false;
  }
}

// Test 3: Test database connectivity (check if required tables exist)
async function testDatabaseTables() {
  console.log('🔍 Testing database table availability...');
  
  try {
    // Test audio_uploads table
    const audioResponse = await fetch(`${SUPABASE_URL}/rest/v1/audio_uploads?select=count&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'count=exact',
      },
    });
    
    if (!audioResponse.ok) {
      console.log('❌ audio_uploads table not accessible');
      return false;
    }
    
    // Test detections table
    const detectionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/detections?select=count&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'count=exact',
      },
    });
    
    if (!detectionsResponse.ok) {
      console.log('❌ detections table not accessible');
      return false;
    }
    
    console.log('✅ Required database tables are accessible');
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
}

// Test 4: Check storage bucket
async function testStorageBucket() {
  console.log('🔍 Testing audio-clips storage bucket...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket/audio-clips`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    
    if (response.ok) {
      console.log('✅ audio-clips storage bucket is accessible');
      return true;
    } else {
      console.log('❌ audio-clips storage bucket not found or not accessible');
      return false;
    }
  } catch (error) {
    console.error('❌ Storage bucket test failed:', error.message);
    return false;
  }
}

// Main test function
async function runIntegrationTests() {
  console.log(`🚀 Testing Supabase Integration with BirdNET API\n`);
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);
  
  const results = {
    edgeFunction: await testEdgeFunctionExists(),
    birdnetUrl: await testBirdnetUrlEnvVar(),
    database: await testDatabaseTables(),
    storage: await testStorageBucket(),
  };
  
  console.log('\n📊 Integration Test Results:');
  console.log(`   Edge Function: ${results.edgeFunction ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   BIRDNET_URL Env Var: ${results.birdnetUrl ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Database Tables: ${results.database ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Storage Bucket: ${results.storage ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All integration tests passed! Your setup is ready for testing.');
    console.log('\n📋 Next steps:');
    console.log('   1. Test with a real audio file upload');
    console.log('   2. Monitor Supabase function logs');
    console.log('   3. Check BirdNET analysis results');
  } else {
    console.log('\n❌ Some tests failed. Please address the issues above.');
    
    if (!results.edgeFunction) {
      console.log('\n🔧 To deploy the edge function:');
      console.log('   supabase functions deploy birdnet-analyze');
    }
    
    if (!results.birdnetUrl) {
      console.log('\n🔧 To set BIRDNET_URL environment variable:');
      console.log('   1. Go to Supabase Dashboard > Project Settings > Edge Functions');
      console.log('   2. Add environment variable: BIRDNET_URL = https://your-railway-app.railway.app');
    }
    
    if (!results.database) {
      console.log('\n🔧 To create required tables, run your database migrations');
    }
    
    if (!results.storage) {
      console.log('\n🔧 To create storage bucket:');
      console.log('   1. Go to Supabase Dashboard > Storage');
      console.log('   2. Create bucket named "audio-clips"');
      console.log('   3. Set appropriate permissions for authenticated users');
    }
  }
}

// Run the tests
runIntegrationTests().catch(console.error); 