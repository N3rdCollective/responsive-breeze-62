
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
    const { pendingId, approved, currentUserRole } = await req.json();
    
    if (!pendingId) {
      throw new Error('Missing pending staff ID');
    }

    // Validate the current user has admin rights
    if (currentUserRole !== 'admin' && currentUserRole !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Only admins can approve staff members' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get the pending staff record
    const { data: pendingStaff, error: fetchError } = await supabaseAdmin
      .from('pending_staff')
      .select('*')
      .eq('id', pendingId)
      .single();

    if (fetchError || !pendingStaff) {
      throw new Error('Pending staff record not found');
    }

    console.log('Found pending staff record:', pendingStaff);

    // Update the status based on approval decision
    const { error: updateError } = await supabaseAdmin
      .from('pending_staff')
      .update({ 
        status: approved ? 'approved' : 'rejected',
        approved_at: approved ? new Date().toISOString() : null,
        rejected_at: approved ? null : new Date().toISOString()
      })
      .eq('id', pendingId);

    if (updateError) {
      throw new Error(`Failed to update status: ${updateError.message}`);
    }

    console.log(`Successfully updated pending staff status to ${approved ? 'approved' : 'rejected'}`);

    // If approved, check for existing user and create staff record
    let staffCreated = false;
    if (approved) {
      // First check if the user already exists in auth.users
      const { data: authUsers, error: authError } = await supabaseAdmin
        .auth.admin.listUsers();
      
      if (authError) {
        console.error('Error listing users:', authError);
        throw new Error(`Failed to list users: ${authError.message}`);
      }

      // Find the user with matching email
      const user = authUsers.users.find(u => u.email?.toLowerCase() === pendingStaff.email.toLowerCase());

      if (user) {
        console.log('Found matching user in auth.users:', user.id);
        
        // Check if staff record already exists to avoid duplicate error
        const { data: existingStaff, error: checkError } = await supabaseAdmin
          .from('staff')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking existing staff record:', checkError);
        }
        
        // Only create staff record if it doesn't exist
        if (!existingStaff) {
          // Get user metadata to populate staff record
          const firstName = user.user_metadata?.first_name || '';
          const lastName = user.user_metadata?.last_name || '';
          const displayName = user.user_metadata?.display_name || '';
          
          // Create staff record
          const { error: staffError } = await supabaseAdmin
            .from('staff')
            .insert({
              id: user.id,
              email: user.email,
              first_name: firstName,
              last_name: lastName,
              display_name: displayName,
              role: 'staff'  // Default role
            });

          if (staffError) {
            console.error('Error creating staff record:', staffError);
            throw new Error(`Failed to create staff record: ${staffError.message}`);
          }
          
          console.log('Successfully created staff record for user:', user.id);
          staffCreated = true;
        } else {
          console.log('Staff record already exists for user:', user.id);
          staffCreated = true;
        }
      } else {
        // User hasn't completed signup yet, that's ok
        console.log(`User with email ${pendingStaff.email} not found in auth.users yet`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: approved 
          ? (staffCreated 
              ? 'Staff member approved and account created' 
              : 'Staff member approved, awaiting account creation')
          : 'Staff member rejected'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in approve-staff function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
