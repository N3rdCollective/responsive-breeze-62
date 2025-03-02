
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

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
    
    // Parse request body with better error handling
    let email;
    let requestBody;
    
    try {
      const text = await req.text();
      console.log('Request body text:', text);
      
      if (!text || text.trim() === '') {
        console.error('Empty request body');
        throw new Error('Empty request body');
      }
      
      try {
        requestBody = JSON.parse(text);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError, 'for text:', text);
        throw new Error(`Invalid JSON in request body: ${jsonError.message}`);
      }
      
      email = requestBody.email;
    } catch (parseError) {
      console.error('Error parsing request:', parseError);
      return new Response(
        JSON.stringify({ 
          error: parseError instanceof Error ? parseError.message : 'Invalid request format',
          success: false
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error('Invalid email:', email);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email address',
          success: false
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing invitation for email: ${email}`);

    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing credentials',
          success: false
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!resendApiKey) {
      console.error('Missing Resend API key');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing email service credentials',
          success: false
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );

    // Initialize Resend client
    const resend = new Resend(resendApiKey);

    // Check if the email already exists in pending_staff
    const { data: existingPending, error: pendingError } = await supabaseAdmin
      .from('pending_staff')
      .select('*')
      .eq('email', email)
      .maybeSingle();
      
    if (pendingError) {
      console.error('Error checking pending staff:', pendingError);
      return new Response(
        JSON.stringify({ 
          error: `Database error: ${pendingError.message}`,
          success: false
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
        return new Response(
          JSON.stringify({ 
            error: `Database error: ${staffError.message}`,
            success: false
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
        
      if (existingStaff) {
        console.log(`Email ${email} already exists as staff member`);
        return new Response(
          JSON.stringify({ 
            error: 'This email is already registered as a staff member',
            success: false
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
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
        return new Response(
          JSON.stringify({ 
            error: `Failed to add to pending staff: ${insertError.message}`,
            success: false
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log(`Added ${email} to pending_staff table`);
    }

    // Generate signup link
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
      return new Response(
        JSON.stringify({ 
          error: `Failed to generate signup link: ${signupError.message}`,
          success: false
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const signupUrl = signupData.properties.action_link;
    console.log(`Signup URL generated: ${signupUrl}`);

    // Send invitation email
    try {
      console.log('Sending email invitation...');
      
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Radio FM <onboarding@resend.dev>',
        to: [email],
        subject: 'Invitation to join Radio FM Staff',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h1 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Radio FM Staff Invitation</h1>
            <p>You have been invited to join the Radio FM staff team!</p>
            <p>Click the button below to complete your registration and set up your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${signupUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Complete Registration</a>
            </div>
            <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px;">
              ${signupUrl}
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
              This invitation will expire in 24 hours. If you didn't request this invitation, please ignore this email.
            </p>
          </div>
        `,
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Continue even if email fails - we'll return the signup URL to the client
        console.log('Continuing despite email error, will return signup URL to client');
      } else {
        console.log('Email sent successfully:', emailData);
      }
    } catch (emailError) {
      console.error('Error with email service:', emailError);
      // Continue even if email fails - we'll return the signup URL to the client
      console.log('Continuing despite email error, will return signup URL to client');
    }

    console.log(`Invitation process completed for ${email}`);

    return new Response(
      JSON.stringify({ 
        message: 'Invitation sent successfully',
        signupUrl: signupUrl
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
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
