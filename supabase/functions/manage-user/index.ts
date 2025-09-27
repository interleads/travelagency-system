import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userData, userId } = await req.json();
    console.log('Manage user action:', action, userData);

    switch (action) {
      case 'create': {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name
          }
        });

        if (authError) {
          console.error('Auth error:', authError);
          throw authError;
        }

        if (!authData.user) {
          throw new Error('Usuário não foi criado');
        }

        // The profile is automatically created by the trigger
        return new Response(JSON.stringify({ 
          success: true, 
          user: {
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update': {
        const { password, ...profileUpdates } = userData;
        
        // Update profile in profiles table
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          console.error('Profile update error:', error);
          throw error;
        }

        // Update password in auth if provided
        if (password) {
          const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: password
          });
          if (authError) {
            console.error('Password update error:', authError);
            throw authError;
          }
        }

        return new Response(JSON.stringify({ success: true, data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete': {
        // Delete from auth (this will cascade to profiles via trigger)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) {
          console.error('Delete user error:', authError);
          throw authError;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Ação não suportada');
    }

  } catch (error: any) {
    console.error('Error in manage-user function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});