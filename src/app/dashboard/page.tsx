import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 1. Pega os dados do usuário DA SESSÃO DO SERVIDOR
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Se NÃO houver usuário, redireciona para o login ANTES de renderizar a página
  if (!user) {
    redirect('/')
  }

  // Função para fazer logout
  const handleLogout = async () => {
    'use server' // Indica que esta função roda no servidor
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    await supabase.auth.signOut()
    return redirect('/')
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Bem-vindo ao seu Dashboard!</h1>
        <p className="mb-2">Você está logado como:</p>
        <p className="font-mono bg-gray-200 p-2 rounded mb-6">{user.email}</p>
        
        <form action={handleLogout}>
          <Button type="submit" variant="destructive">Logout</Button>
        </form>
      </div>
    </div>
  )
}