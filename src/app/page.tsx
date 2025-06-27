'use client'

import AuthForm from '@/components/AuthForm'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event,) => {
      // Se o evento for SIGNED_IN, o usuário acabou de logar.
      if (event === 'SIGNED_IN') {
        router.push('/dashboard')
      }
    });

    // Limpa o listener quando o componente é desmontado
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Projeto FARO</h1>
        <AuthForm />
      </div>
    </main>
  )
}