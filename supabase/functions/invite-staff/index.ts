
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    console.log('Processing invite-staff request');
    
    // Validate request content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      throw new Error('Request must be application/json');
    }
    
    // Parse request body
    let email;
    try {
      const body = await req.json();
      email = body.email;
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Invalid JSON in request body');
    }
    
    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error('Invalid email:', email);
      throw new Error('Invalid email address');
    }

    console.log(`Processing invitation for email: ${email}`);

    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error: Missing credentials');
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );

    // Check if the email already exists in pending_staff
    const { data: existingPending, error: pendingError } = await supabaseAdmin
      .from('pending_staff')
      .select('*')
      .eq('email', email)
      .maybeSingle();
      
    if (pendingError) {
      console.error('Error checking pending staff:', pendingError);
      throw new Error(`Database error: ${pendingError.message}`);
    }

    if (existingPending) {
      console.log(`Email ${email} already in pending_staff, resending invitation`);
    } else {
      // First check if this email is already in the staff table
      const { data: existingStaff, error: staffError } = await supabaseAdmin
        .from('staff')
        .select('*')
        .eq('email', email)
        .maybeSingle();
        
      if (staffError) {
        console.error('Error checking existing staff:', staffError);
        throw new Error(`Database error: ${staffError.message}`);
      }
        
      if (existingStaff) {
        console.log(`Email ${email} already exists as staff member`);
        return new Response(
          JSON.stringify({ error: 'This email is already registered as a staff member' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Add to pending_staff table
      const { error: insertError } = await supabaseAdmin
        .from('pending_staff')
        .insert({ 
          email,
          status: 'invited',
          invited_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error inserting to pending staff:', insertError);
        throw new Error(`Failed to add to pending staff: ${insertError.message}`);
      }
      
      console.log(`Added ${email} to pending_staff table`);
    }

    // Send invitation email with signup link
    try {
      console.log('Generating signup link...');
      const origin = req.headers.get('origin') || Deno.env.get('SITE_URL') || 'http://localhost:5173';
      const redirectTo = `${origin}/staff-signup?email=${encodeURIComponent(email)}`;
      
      console.log(`Using redirect URL: ${redirectTo}`);
      
      const { data: signupData, error: signupError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email,
        options: {
          redirectTo
        }
      });

      if (signupError) {
        console.error('Error generating signup link:', signupError);
        throw new Error(`Failed to generate signup link: ${signupError.message}`);
      }

      console.log(`Invitation sent to ${email}, signup URL generated`);

      return new Response(
        JSON.stringify({ 
          message: 'Invitation sent successfully',
          signupUrl: signupData.properties.action_link
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      throw new Error(`Failed to send invitation: ${emailError.message}`);
    }
  } catch (error) {
    console.error('Error in invite-staff function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
