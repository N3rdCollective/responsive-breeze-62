
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CareerApplicationRequest {
  name: string;
  email: string;
  position: string;
  coverLetter: string;
  resumeData?: string; // Base64 encoded file
  resumeFileName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, position, coverLetter, resumeData, resumeFileName } = await req.json() as CareerApplicationRequest;

    console.log(`Processing career application from ${name} for ${position}`);

    // Prepare email content
    const htmlContent = `
      <h1>New Career Application</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Position:</strong> ${position}</p>
      <h2>Cover Letter:</h2>
      <p>${coverLetter.replace(/\n/g, '<br>')}</p>
    `;

    // Prepare email data
    const emailData: any = {
      from: "Rappin' Lounge Radio <careers@resend.dev>",
      to: ["rlradiobiz@gmail.com"],
      subject: `New Career Application: ${position} from ${name}`,
      html: htmlContent,
      reply_to: email
    };

    // Add resume as attachment if provided
    if (resumeData && resumeFileName) {
      console.log(`Including resume: ${resumeFileName}`);
      emailData.attachments = [
        {
          filename: resumeFileName,
          content: resumeData
        }
      ];
    }

    // Send email
    const emailResponse = await resend.emails.send(emailData);
    console.log("Email sent successfully:", emailResponse);

    // Also send confirmation to the applicant
    await resend.emails.send({
      from: "Rappin' Lounge Radio <careers@resend.dev>",
      to: [email],
      subject: "Your application was received!",
      html: `
        <h1>Thank you for your application, ${name}!</h1>
        <p>We have received your application for the <strong>${position}</strong> position at Rappin' Lounge Radio.</p>
        <p>Our team will review your information and get back to you soon.</p>
        <p>Best regards,<br>The Rappin' Lounge Radio Team</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-career-application function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
