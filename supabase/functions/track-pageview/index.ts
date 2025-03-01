
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.1'
import { UAParser } from 'https://esm.sh/ua-parser-js@1.0.37'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request details
    const { path, referrer, sessionId } = await req.json()
    const userAgent = req.headers.get('user-agent') || ''
    
    // Parse user agent for device info
    const parser = new UAParser(userAgent)
    const device = parser.getDevice()
    const deviceType = device.type || 'desktop'
    
    // Get client IP and country (if available)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Generate a session ID if not provided
    const finalSessionId = sessionId || uuidv4()
    
    // Store the pageview in the analytics table
    const { data, error } = await supabase
      .from('analytics')
      .insert({
        page_path: path,
        user_agent: userAgent,
        referrer: referrer || null,
        device_type: deviceType,
        session_id: finalSessionId,
      })
      
    if (error) {
      console.error('Error storing analytics:', error)
      throw error
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionId: finalSessionId
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Error tracking pageview:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})
