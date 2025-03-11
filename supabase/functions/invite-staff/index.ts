
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

// Define types for better code organization
interface RequestData {
  email: string;
}

interface ResponseData {
  message?: string;
  error?: string;
  signupUrl?: string;
  success: boolean;
}

// Constants and configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const defaultOrigin = "https://responsive-breeze-62.lovable.app";
const adminEmailAddress = "rlradiobiz@gmail.com";

// Helper functions
function createErrorResponse(message: string, status: number): Response {
  console.error(`Error: ${message}`);
  return new Response(
    JSON.stringify({ 
      error: message,
      success: false
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

function createSuccessResponse(data: ResponseData): Response {
  return new Response(
    JSON.stringify(data),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Parse and validate request data
async function parseRequestBody(req: Request): Promise<RequestData | null> {
  try {
    // Get the raw text first to log it and check if it's empty
    const text = await req.text();
    console.log('Request body text length:', text.length);
    console.log('Request body text (first 200 chars):', text.substring(0, 200));
    
    if (!text || text.trim() === '') {
      console.error('Empty request body');
      return null;
    }
    
    // Try to parse the JSON
    try {
      const requestBody = JSON.parse(text);
      console.log('Parsed request body:', requestBody);
      return requestBody;
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      return null;
    }
  } catch (parseError) {
    console.error('Error parsing request:', parseError);
    return null;
  }
}

// Check if email is valid
function validateEmail(email: string | undefined): string | null {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.error('Invalid email:', email);
    return null;
  }
  return email;
}

// Initialize Supabase client
function initializeSupabase() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }

  return createClient(
    supabaseUrl,
    supabaseServiceKey,
    { auth: { persistSession: false } }
  );
}

// Check if this email already exists in staff
async function checkExistingStaff(supabaseAdmin: any, email: string): Promise<boolean> {
  const { data: existingStaff, error: staffError } = await supabaseAdmin
    .from('staff')
    .select('*')
    .eq('email', email)
    .maybeSingle();
    
  if (staffError) {
    console.error('Error checking existing staff:', staffError);
    throw new Error(`Database error: ${staffError.message}`);
  }
    
  return !!existingStaff;
}

// Handle pending staff records
async function handlePendingStaff(supabaseAdmin: any, email: string): Promise<void> {
  // Check if already in pending_staff
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
    return;
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

// Generate signup link
async function generateSignupLink(supabaseAdmin: any, email: string, origin: string): Promise<string> {
  console.log('Generating signup link...');
  console.log('Using origin for redirect:', origin);
  
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

  const signupUrl = signupData.properties.action_link;
  console.log(`Signup URL generated: ${signupUrl}`);
  
  return signupUrl;
}

// Send invitation email
async function sendInvitationEmail(email: string, signupUrl: string): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.error('Missing Resend API key');
    throw new Error('Server configuration error: Missing email service credentials');
  }
  
  // Initialize Resend client
  const resend = new Resend(resendApiKey);
  
  try {
    console.log('Sending email invitation...');
    
    // First send notification to admin
    await resend.emails.send({
      from: 'Radio FM <onboarding@resend.dev>',
      to: [adminEmailAddress],
      subject: `New Staff Invitation Sent to ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Staff Invitation Notification</h1>
          <p>A staff invitation has been sent to: ${email}</p>
          <p>The invitation includes a signup link that will expire in 24 hours.</p>
          <p>The invited user will need to complete registration and await approval.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            This is an automated notification from the Radio FM staff management system.
          </p>
        </div>
      `,
    });
    
    console.log(`Admin notification sent to ${adminEmailAddress}`);
    
    // Then send invitation to the user
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
      throw emailError;
    } else {
      console.log('Email sent successfully:', emailData);
    }
  } catch (emailError) {
    console.error('Error with email service:', emailError);
    throw emailError; // Re-throw to be handled by caller
  }
}

// Main handler function
async function handleInviteStaffRequest(req: Request): Promise<Response> {
  console.log('Processing invite-staff request');
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  console.log('Request method:', req.method);
  
  // Validate request content type
  const contentType = req.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    console.error('Invalid content type:', contentType);
    return createErrorResponse('Request must be application/json', 400);
  }
  
  // Parse request body
  const requestBody = await parseRequestBody(req);
  if (!requestBody) {
    return createErrorResponse('Empty or invalid request body. Please provide a valid JSON with an email field.', 400);
  }
  
  // Validate email
  const email = validateEmail(requestBody.email);
  if (!email) {
    return createErrorResponse('Invalid email address', 400);
  }

  console.log(`Processing invitation for email: ${email}`);

  // Initialize Supabase
  const supabaseAdmin = initializeSupabase();
  if (!supabaseAdmin) {
    return createErrorResponse('Server configuration error: Missing credentials', 500);
  }

  try {
    // Check if already a staff member
    const isExistingStaff = await checkExistingStaff(supabaseAdmin, email);
    if (isExistingStaff) {
      console.log(`Email ${email} already exists as staff member`);
      return createErrorResponse('This email is already registered as a staff member', 400);
    }
    
    // Handle pending staff table
    await handlePendingStaff(supabaseAdmin, email);
    
    // Get origin for redirect
    const origin = req.headers.get('origin') || Deno.env.get('SITE_URL') || defaultOrigin;
    
    // Generate signup link
    const signupUrl = await generateSignupLink(supabaseAdmin, email, origin);
    
    // Send invitation email
    try {
      await sendInvitationEmail(email, signupUrl);
      console.log(`Invitation email sent to ${email} and notification to admin`);
    } catch (emailError: any) {
      console.error("Failed to send email but continuing:", emailError.message);
      // We still return success but include a warning message
      return createSuccessResponse({ 
        message: 'Invitation created but email delivery failed. Please try again or contact support.',
        signupUrl,
        success: true
      });
    }

    console.log(`Invitation process completed for ${email}`);

    return createSuccessResponse({ 
      message: 'Invitation sent successfully',
      signupUrl,
      success: true
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(errorMessage, 500);
  }
}

// Main server function
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
    return await handleInviteStaffRequest(req);
  } catch (error) {
    console.error('Error in invite-staff function:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500
    );
  }
});
