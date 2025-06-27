'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'


export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || 'Não foi possível obter o email')
      } else {
        // Se não houver usuário, redireciona para a página de login
        router.push('/')
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!userEmail) {
    return <div>Carregando...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Bem-vindo!</h1>
        <p className="mt-2">Você está logado com o email: {userEmail}</p>
        <Button onClick={handleLogout} className="mt-4">
          Sair (Logout)
        </Button>
        <Link href="/registrar-snap" passHref>
        <Button variant="outline" className="mt-4">
          Registrar Novo Snap
        </Button>
      </Link>
      </div>
    </main>
  )
}