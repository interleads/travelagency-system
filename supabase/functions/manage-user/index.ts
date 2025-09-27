import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: 'administrador' | 'vendedor';
}

interface UpdateUserData {
  email: string;
  password?: string;
  full_name: string;
  role: 'administrador' | 'vendedor';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Extract and decode JWT token from Authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Authorization header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header')
      return new Response(JSON.stringify({ 
        error: 'Unauthorized', 
        details: 'Authorization header missing or invalid' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Extract JWT token and decode payload
    const token = authHeader.replace('Bearer ', '')
    let callerUserId: string
    
    try {
      // Decode JWT payload (Supabase already verified the JWT signature due to verify_jwt = true)
      const payloadBase64Url = token.split('.')[1]
      const base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
      const payload = JSON.parse(atob(padded))
      callerUserId = payload.sub
      
      if (!callerUserId) {
        throw new Error('User ID not found in token')
      }
      
      console.log('Caller authenticated:', callerUserId)
    } catch (decodeError) {
      console.error('JWT decode error:', decodeError)
      return new Response(JSON.stringify({ 
        error: 'Unauthorized', 
        details: 'Invalid token format' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if caller is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', callerUserId)
      .single()

    if (profileError || !profile || profile.role !== 'administrador') {
      console.error('User is not admin:', callerUserId, profileError)
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { action, data, userId } = await req.json()
    console.log('Action:', action, 'Data:', data, 'UserId:', userId)

    switch (action) {
      case 'create': {
        const userData = data as CreateUserData
        
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name
          }
        })

        if (authError) {
          const message = authError.message || 'Erro ao criar usuário'
          console.error('Auth creation error:', authError)
          // Email already exists -> return 409 instead of 500
          if (message.toLowerCase().includes('already been registered') || message.toLowerCase().includes('already exists')) {
            return new Response(JSON.stringify({ error: 'Email já cadastrado' }), {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          throw authError
        }

        if (!authData?.user) {
          throw new Error('Usuário não foi criado')
        }

        // Ensure profile exists and is updated (handle potential DB trigger duplication via upsert)
        const profilePayload = {
          id: authData.user.id,
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role,
          is_active: true
        }

        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' })
          .select()
          .single()

        if (profileError) {
          console.error('Profile upsert error:', profileError)
          throw profileError
        }

        console.log('User created successfully:', profileData)
        return new Response(JSON.stringify(profileData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update': {
        const updates = data as UpdateUserData
        
        // Update profile in profiles table
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            full_name: updates.full_name,
            email: updates.email,
            role: updates.role
          })
          .eq('id', userId)
          .select()
          .single()

        if (profileError) {
          console.error('Profile update error:', profileError)
          throw profileError
        }

        // Update password in auth if provided
        if (updates.password) {
          const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: updates.password
          })
          if (authError) {
            console.error('Password update error:', authError)
            throw authError
          }
        }

        // Update email in auth
        const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          email: updates.email
        })
        if (emailError) {
          console.error('Email update error:', emailError)
          throw emailError
        }

        console.log('User updated successfully:', profileData)
        return new Response(JSON.stringify(profileData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'delete': {
        // Delete from auth (this will cascade to profiles via trigger)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (authError) {
          console.error('Auth deletion error:', authError)
          throw authError
        }

        console.log('User deleted successfully:', userId)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'toggle-status': {
        const { isActive } = data
        
        const { data: profileData, error } = await supabaseAdmin
          .from('profiles')
          .update({ is_active: isActive })
          .eq('id', userId)
          .select()
          .single()

        if (error) {
          console.error('Status toggle error:', error)
          throw error
        }

        console.log('User status toggled successfully:', profileData)
        return new Response(JSON.stringify(profileData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})