import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

/**
 * Supabase Edge Function to delete the authenticated user's account and all related data
 * - Validates JWT from Authorization header
 * - Cleans up all user-related data from database tables
 * - Deletes user from auth.users using service role key
 * - Returns 200 on success, 401/500 on error
 */
serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const jwt = authHeader.replace("Bearer ", "");

  const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = user.id;
  try {
    // 1. Delete detections
    const { error: detectionsError } = await supabase
      .from("detections")
      .delete()
      .eq("user_id", userId);
    if (detectionsError) throw detectionsError;

    // 2. Delete audio uploads
    const { error: audioError } = await supabase
      .from("audio_uploads")
      .delete()
      .eq("user_id", userId);
    if (audioError) throw audioError;

    // 3. Delete bird comments
    const { error: commentsError } = await supabase
      .from("bird_comments")
      .delete()
      .eq("user_id", userId);
    if (commentsError) throw commentsError;

    // 4. Delete favorites
    const { error: favoritesError } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId);
    if (favoritesError) throw favoritesError;

    // 5. Delete feedback
    const { error: feedbackError } = await supabase
      .from("feedback")
      .delete()
      .eq("user_id", userId);
    if (feedbackError) throw feedbackError;

    // 6. Delete user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ message: "Account deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete user and all data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}); 