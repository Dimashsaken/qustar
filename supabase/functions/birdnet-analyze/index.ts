import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { audioId, storagePath } = await req.json();
    
    if (!audioId || !storagePath) {
      return new Response(
        JSON.stringify({ error: 'Missing audioId or storagePath' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Starting BirdNET analysis for audio ${audioId} at ${storagePath}`);

    // Update status to processing
    await supabase
      .from('audio_uploads')
      .update({ status: 'processing' })
      .eq('id', audioId);

    // Verify the file exists in storage before creating signed URL
    const { data: fileData, error: fileError } = await supabase.storage
      .from('audio-clips')
      .download(storagePath);

    if (fileError) {
      console.error('Error verifying file exists:', fileError);
      await supabase
        .from('audio_uploads')
        .update({ 
          status: 'failed',
          error_message: `File not found: ${fileError.message}`
        })
        .eq('id', audioId);
      
      return new Response(
        JSON.stringify({ error: `File not found in storage: ${fileError.message}` }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`File verified in storage: ${fileData?.size} bytes`);

    // Create signed URL for the audio file (valid for 10 minutes)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('audio-clips')
      .createSignedUrl(storagePath, 600); // 10 minutes

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      await supabase
        .from('audio_uploads')
        .update({ 
          status: 'failed',
          error_message: `Signed URL creation failed: ${signedUrlError.message}`
        })
        .eq('id', audioId);
      
      return new Response(
        JSON.stringify({ error: 'Failed to create signed URL' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Created signed URL: ${signedUrlData.signedUrl}`);

    // Call BirdNET API
    const birdnetUrl = Deno.env.get('BIRDNET_URL');
    if (!birdnetUrl) {
      throw new Error('BIRDNET_URL environment variable not set');
    }

    console.log(`Calling BirdNET at ${birdnetUrl}/analyze with Russian language request`);
    
    const birdnetResponse = await fetch(`${birdnetUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: signedUrlData.signedUrl,
        min_conf: 0.1, // Minimum confidence threshold
        language: "ru", // Request Russian bird names
      }),
    });

    const responseText = await birdnetResponse.text();
    console.log(`BirdNET response status: ${birdnetResponse.status}`);
    console.log(`BirdNET response (first 500 chars): ${responseText.substring(0, 500)}`);

    if (!birdnetResponse.ok) {
      console.error(`BirdNET API error: ${birdnetResponse.status} - ${responseText}`);
      await supabase
        .from('audio_uploads')
        .update({ 
          status: 'failed',
          error_message: `BirdNET API error: ${birdnetResponse.status} - ${responseText.substring(0, 200)}`
        })
        .eq('id', audioId);
      
      return new Response(
        JSON.stringify({ 
          error: 'BirdNET analysis failed',
          details: responseText,
          status: birdnetResponse.status
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let predictions;
    try {
      predictions = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing BirdNET response:', parseError);
      await supabase
        .from('audio_uploads')
        .update({ 
          status: 'failed',
          error_message: `Invalid JSON response from BirdNET: ${parseError.message}`
        })
        .eq('id', audioId);
      
      return new Response(
        JSON.stringify({ error: 'Invalid response from BirdNET API' }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle both direct results array and wrapped response
    const results = predictions.results || predictions;
    console.log(`BirdNET returned ${results.length} detections`);
    
    // Enhanced logging to debug language field issues
    if (results.length > 0) {
      console.log(`First detection example:`, JSON.stringify(results[0], null, 2));
    }

    // Get user_id from the audio upload record
    const { data: audioUpload, error: audioError } = await supabase
      .from('audio_uploads')
      .select('user_id')
      .eq('id', audioId)
      .single();

    if (audioError || !audioUpload) {
      console.error('Error fetching audio upload user_id:', audioError);
      await supabase
        .from('audio_uploads')
        .update({ 
          status: 'failed',
          error_message: `User ID lookup failed: ${audioError?.message}`
        })
        .eq('id', audioId);
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch audio upload user_id' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Insert detection results into database
    if (results.length > 0) {
      const detections = results.map((prediction: any) => {
        // Enhanced field mapping with better fallbacks and debugging
        const commonName = prediction.common_name || null;
        const scientificName = prediction.scientific_name || prediction.species || null;
        const displayName = prediction.display_name || prediction.russian_name || commonName || null;
        
        // Extract species name from legacy format if needed
        let speciesField = prediction.species;
        if (!speciesField && commonName && scientificName) {
          speciesField = `${commonName}_${scientificName}`;
        } else if (!speciesField && scientificName) {
          speciesField = scientificName;
        } else if (!speciesField && commonName) {
          speciesField = commonName;
        }
        
        console.log(`Processing detection: species="${speciesField}", common_name="${commonName}", scientific_name="${scientificName}", display_name="${displayName}"`);
        
        return {
          audio_id: audioId,
          user_id: audioUpload.user_id,
          species: speciesField || 'Unknown',
          confidence: prediction.confidence || 0,
          start_sec: prediction.start || prediction.start_time || 0,
          end_sec: prediction.end || prediction.end_time || (prediction.start || prediction.start_time || 0) + 3,
          // Russian language fields - now with better fallback handling
          display_name: displayName,
          common_name: commonName,
          // Store original response for debugging
          debug_data: {
            original_response: prediction,
            language_requested: 'ru',
            timestamp: new Date().toISOString()
          }
        };
      });

      const { error: insertError } = await supabase
        .from('detections')
        .insert(detections);

      if (insertError) {
        console.error('Error inserting detections:', insertError);
        await supabase
          .from('audio_uploads')
          .update({ 
            status: 'failed',
            error_message: `Database insert failed: ${insertError.message}`
          })
          .eq('id', audioId);
        
        return new Response(
          JSON.stringify({ error: 'Failed to save detections' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.log(`Successfully inserted ${detections.length} detections with language fields`);
    }

    // Update status to completed
    await supabase
      .from('audio_uploads')
      .update({ status: 'completed' })
      .eq('id', audioId);

    console.log(`Analysis completed for audio ${audioId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        detections: results.length,
        audioId,
        language: 'ru',
        debug: {
          birdnet_response_sample: results.length > 0 ? results[0] : null
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Edge Function error:', error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 