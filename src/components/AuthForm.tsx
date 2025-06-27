'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient' // Importa nosso cliente

const AuthForm = () => {
  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['github']} // Você pode adicionar 'google', 'twitter', etc.
        theme="dark"
      />
    </div>
  )
}

export default AuthForm