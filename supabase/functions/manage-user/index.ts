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
    // Create admin client with service role
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

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '')
    
    // Verify the user making the request
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader)
    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'administrador') {
      console.error('User is not admin:', user.id)
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
          console.error('Auth creation error:', authError)
          throw authError
        }

        if (!authData.user) {
          throw new Error('Usuário não foi criado')
        }

        // Create profile
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert([{
            id: authData.user.id,
            full_name: userData.full_name,
            email: userData.email,
            role: userData.role,
            is_active: true
          }])
          .select()
          .single()

        if (profileError) {
          console.error('Profile creation error:', profileError)
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