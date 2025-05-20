
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0"; // Using Resend for emails

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      console.error("Missing environment variables");
      return new Response(JSON.stringify({ error: "Server configuration error." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey);
    const resend = new Resend(resendApiKey);

    // Get the invoking user's ID from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: invokingUser }, error: userError } = await supabaseAdminClient.auth.getUser(token);

    if (userError || !invokingUser) {
      console.error("Error getting invoking user:", userError);
      return new Response(JSON.stringify({ error: "Invalid token or user not found." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if the invoking user is an admin or super_admin
    const { data: invokingStaffMember, error: staffError } = await supabaseAdminClient
      .from("staff")
      .select("role")
      .eq("id", invokingUser.id)
      .single();

    if (staffError || !invokingStaffMember) {
      console.error("Error fetching invoking staff member's role:", staffError);
      return new Response(JSON.stringify({ error: "Could not verify admin privileges." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const invokingUserRole = invokingStaffMember.role;
    if (invokingUserRole !== "admin" && invokingUserRole !== "super_admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Insufficient privileges." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { staffUserId } = await req.json();
    if (!staffUserId) {
      return new Response(JSON.stringify({ error: "staffUserId is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch target staff member's details
    const { data: targetStaff, error: targetStaffError } = await supabaseAdminClient
      .from("staff")
      .select("email, role")
      .eq("id", staffUserId)
      .single();

    if (targetStaffError || !targetStaff) {
      console.error("Error fetching target staff member:", targetStaffError);
      return new Response(JSON.stringify({ error: "Target staff member not found." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Security check: Prevent resetting super_admin passwords via this UI flow
    // Also, admins cannot reset other admins' passwords, only super_admins can reset admins.
    if (targetStaff.role === "super_admin") {
      return new Response(JSON.stringify({ error: "Cannot reset password for a Super Admin." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (targetStaff.role === "admin" && invokingUserRole !== "super_admin") {
       return new Response(JSON.stringify({ error: "Only Super Admins can reset passwords for other Admins." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    // Generate password reset link
    const { data: linkData, error: linkError } = await supabaseAdminClient.auth.admin.generateLink({
      type: "recovery",
      email: targetStaff.email,
      // redirectTo: `${Deno.env.get("SITE_URL")}/update-password` // Optional: if you have a custom redirect
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Error generating password reset link:", linkError);
      return new Response(JSON.stringify({ error: "Failed to generate password reset link." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resetLink = linkData.properties.action_link;

    // Send email using Resend
    const emailHtml = `
      <p>Hello,</p>
      <p>A password reset has been requested for your staff account on Rappin' Lounge Radio.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, please ignore this email or contact an administrator.</p>
      <p>Thanks,<br>Rappin' Lounge Radio Team</p>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Rappin' Lounge Radio <noreply@yourdomain.com>", // Replace with your verified Resend domain/email
      to: [targetStaff.email],
      subject: "Password Reset Request",
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(JSON.stringify({ error: "Failed to send password reset email." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Password reset email sent successfully:", emailData);
    return new Response(JSON.stringify({ message: "Password reset email sent successfully." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Unexpected error in edge function:", e);
    return new Response(JSON.stringify({ error: e.message || "An unexpected error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
