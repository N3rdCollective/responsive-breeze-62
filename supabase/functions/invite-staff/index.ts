
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Check if the email already exists in pending_staff
    const { data: existingPending } = await supabaseAdmin
      .from('pending_staff')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingPending) {
      // If already pending, just resend the invitation
      console.log(`Email ${email} already in pending_staff, resending invitation`);
    } else {
      // First check if this email is already in the staff table
      const { data: existingStaff } = await supabaseAdmin
        .from('staff')
        .select('*')
        .eq('email', email)
        .maybeSingle();
        
      if (existingStaff) {
        return new Response(
          JSON.stringify({ error: 'This email is already registered as a staff member' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Add to pending_staff table
      const { error: pendingError } = await supabaseAdmin
        .from('pending_staff')
        .insert({ 
          email,
          status: 'invited',
          invited_at: new Date().toISOString(),
        });

      if (pendingError) {
        throw new Error(`Failed to add to pending staff: ${pendingError.message}`);
      }
    }

    // Send invitation email with signup link
    const { data: signupData, error: signupError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${req.headers.get('origin') || Deno.env.get('SITE_URL')}/staff-signup?email=${encodeURIComponent(email)}`,
      }
    });

    if (signupError) {
      throw new Error(`Failed to generate signup link: ${signupError.message}`);
    }

    console.log(`Invitation sent to ${email}`);

    return new Response(
      JSON.stringify({ 
        message: 'Invitation sent successfully',
        signupUrl: signupData.properties.action_link
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in invite-staff function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
