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
        .update({ status: 'failed' })
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
        .update({ status: 'failed' })
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

    console.log(`Calling BirdNET at ${birdnetUrl}/analyze`);
    
    const birdnetResponse = await fetch(`${birdnetUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: signedUrlData.signedUrl,
        min_conf: 0.1, // Minimum confidence threshold
      }),
    });

    const responseText = await birdnetResponse.text();
    console.log(`BirdNET response status: ${birdnetResponse.status}`);
    console.log(`BirdNET response: ${responseText}`);

    if (!birdnetResponse.ok) {
      console.error(`BirdNET API error: ${birdnetResponse.status} - ${responseText}`);
      await supabase
        .from('audio_uploads')
        .update({ 
          status: 'failed',
          error_message: `BirdNET API error: ${birdnetResponse.status}`
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
        .update({ status: 'failed' })
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
        .update({ status: 'failed' })
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
      const detections = results.map((prediction: any) => ({
        audio_id: audioId,
        user_id: audioUpload.user_id, // Include user_id for privacy
        species: prediction.species || prediction.common_name,
        confidence: prediction.confidence,
        start_sec: prediction.start || prediction.start_time || 0,
        end_sec: prediction.end || prediction.end_time || prediction.start || 0,
      }));

      const { error: insertError } = await supabase
        .from('detections')
        .insert(detections);

      if (insertError) {
        console.error('Error inserting detections:', insertError);
        await supabase
          .from('audio_uploads')
          .update({ status: 'failed' })
          .eq('id', audioId);
        
        return new Response(
          JSON.stringify({ error: 'Failed to save detections' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
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
        audioId 
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