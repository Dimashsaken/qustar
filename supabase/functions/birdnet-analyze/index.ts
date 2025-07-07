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

    // Create signed URL for the audio file (valid for 5 minutes)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('audio-clips')
      .createSignedUrl(storagePath, 300); // 5 minutes

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

    if (!birdnetResponse.ok) {
      console.error(`BirdNET API error: ${birdnetResponse.status}`);
      await supabase
        .from('audio_uploads')
        .update({ status: 'failed' })
        .eq('id', audioId);
      
      return new Response(
        JSON.stringify({ error: 'BirdNET analysis failed' }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const predictions = await birdnetResponse.json();
    console.log(`BirdNET returned ${predictions.length} detections`);

    // Insert detection results into database
    if (predictions.length > 0) {
      const detections = predictions.map((prediction: any) => ({
        audio_id: audioId,
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
        detections: predictions.length,
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