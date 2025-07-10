#!/usr/bin/env node
/**
 * Test script for BirdNET API Russian translation functionality
 * 
 * This script demonstrates how to use the enhanced BirdNET API
 * with Russian bird name translation support.
 */

const BIRDNET_URL = process.env.BIRDNET_URL || 'http://localhost:8080';

/**
 * Test the BirdNET API with Russian translation
 */
async function testRussianTranslation() {
    console.log('🧪 Testing BirdNET API Russian Translation');
    console.log('=' .repeat(50));
    
    // Test data - you can replace with real audio URLs
    const testCases = [
        {
            name: 'English Request',
            payload: {
                url: 'https://example.com/bird-audio.wav',
                min_conf: 0.1,
                language: 'en'
            }
        },
        {
            name: 'Russian Request',
            payload: {
                url: 'https://example.com/bird-audio.wav',
                min_conf: 0.1,
                language: 'ru'
            }
        },
        {
            name: 'Default Language (English)',
            payload: {
                url: 'https://example.com/bird-audio.wav',
                min_conf: 0.2
                // No language specified - should default to English
            }
        }
    ];
    
    // Test health check first
    console.log('🔍 Testing health check...');
    try {
        const healthResponse = await fetch(`${BIRDNET_URL}/`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.status);
        console.log('');
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        console.log('Make sure the BirdNET API server is running!');
        return;
    }
    
    // Test each case
    for (const testCase of testCases) {
        console.log(`🎯 Testing: ${testCase.name}`);
        console.log(`📝 Request:`, JSON.stringify(testCase.payload, null, 2));
        
        try {
            const response = await fetch(`${BIRDNET_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testCase.payload)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ Response Status:', response.status);
                console.log('📊 Results Summary:');
                console.log(`   - Language: ${data.language || 'en'}`);
                console.log(`   - Detections: ${data.results ? data.results.length : 0}`);
                
                if (data.results && data.results.length > 0) {
                    console.log('🐦 Sample Detection:');
                    const sample = data.results[0];
                    console.log(`   - Common Name: ${sample.common_name}`);
                    console.log(`   - Scientific Name: ${sample.scientific_name}`);
                    console.log(`   - Display Name: ${sample.display_name}`);
                    if (sample.russian_name) {
                        console.log(`   - Russian Name: ${sample.russian_name}`);
                    }
                    console.log(`   - Confidence: ${(sample.confidence * 100).toFixed(1)}%`);
                }
            } else {
                console.log('❌ Response Status:', response.status);
                console.log('💬 Error:', data.error);
                if (data.details) {
                    console.log('📋 Details:', data.details);
                }
            }
            
        } catch (error) {
            console.error('❌ Request failed:', error.message);
        }
        
        console.log('');
        console.log('-'.repeat(40));
        console.log('');
    }
    
    // Test invalid language
    console.log('🧪 Testing Invalid Language');
    try {
        const response = await fetch(`${BIRDNET_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: 'https://example.com/bird-audio.wav',
                language: 'kz'  // Invalid - not supported
            })
        });
        
        const data = await response.json();
        console.log('📝 Invalid Language Test:', response.status === 400 ? '✅ Correctly rejected' : '❌ Should have failed');
        console.log('💬 Error Message:', data.error);
        
    } catch (error) {
        console.error('❌ Invalid language test failed:', error.message);
    }
    
    console.log('');
    console.log('🎉 Testing Complete!');
    console.log('');
    console.log('💡 Usage Tips:');
    console.log('   - Use language: "ru" for Russian bird names');
    console.log('   - Use language: "en" for English bird names (default)');
    console.log('   - display_name shows the localized name for users');
    console.log('   - Falls back to English when Russian not available');
    console.log('   - Russian coverage: ~50% of global species');
}

/**
 * Mock example showing expected Russian response format
 */
function showExpectedFormat() {
    console.log('📋 Expected Russian Response Format:');
    console.log('=' .repeat(50));
    
    const exampleResponse = {
        "status": "success",
        "language": "ru",
        "results": [
            {
                "species": "Common Raven_Corvus corax",
                "common_name": "Common Raven",
                "scientific_name": "Corvus corax", 
                "display_name": "Ворон",
                "russian_name": "Ворон",
                "confidence": 0.95,
                "start_time": 0.0,
                "end_time": 3.0
            },
            {
                "species": "Hooded Crow_Corvus cornix",
                "common_name": "Hooded Crow",
                "scientific_name": "Corvus cornix",
                "display_name": "Серая ворона", 
                "russian_name": "Серая ворона",
                "confidence": 0.87,
                "start_time": 3.0,
                "end_time": 6.0
            }
        ],
        "timestamp": "2024-01-01T12:00:00",
        "min_confidence": 0.1,
        "audio_info": {
            "duration": 10.5,
            "format_name": "wav"
        }
    };
    
    console.log(JSON.stringify(exampleResponse, null, 2));
    console.log('');
}

// Main execution
async function main() {
    console.log('🌍 BirdNET API Russian Translation Test');
    console.log('Built for QuStar Kazakhstan Bird Identification App');
    console.log('');
    
    // Show expected format first
    showExpectedFormat();
    
    // Run tests
    await testRussianTranslation();
}

// Check if we have fetch available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ with fetch support');
    console.log('💡 Try: node --version');
    console.log('💡 Upgrade to Node.js 18+ or install node-fetch');
    process.exit(1);
}

// Run the tests
main().catch(console.error); 