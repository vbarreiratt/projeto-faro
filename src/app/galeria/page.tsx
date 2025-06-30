'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

// Definindo um tipo para o nosso objeto 'snap' para usar com TypeScript
type Snap = {
  id: string;
  created_at: string;
  title: string;
  context: string;
  mood: string;
  media_url: string;
  tags: string[];
  // Adicione outros campos que você queira exibir
};

export default function GaleriaPage() {
  const router = useRouter()
  const [snaps, setSnaps] = useState<Snap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSnaps = async () => {
      // 1. Pega o usuário logado
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // 2. Busca os snaps da tabela que pertencem a esse usuário
        const { data, error } = await supabase
          .from('snaps')
          .select('*') // Seleciona todas as colunas
          .eq('user_id', user.id) // Onde o user_id é igual ao ID do usuário logado
          .order('created_at', { ascending: false }) // Ordena pelos mais recentes

        if (error) {
          setError(error.message)
        } else {
          setSnaps(data)
        }
      } else {
          // Se não houver usuário, redireciona para a página de login
          router.push('/')
      }

      setLoading(false)
    }

    fetchSnaps()
  }, [router])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando seus snaps...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">Erro: {error}</div>
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sua Galeria Pessoal</h1>
        <Link href="/registrar-snap" passHref>
          <Button>Registrar Novo Snap</Button>
        </Link>
      </div>

      {snaps.length === 0 ? (
        <div className="text-center py-16 px-8 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold">Nenhum snap encontrado.</h2>
            <p className="text-gray-600 mt-2">Parece que você ainda não registrou nenhum snap. Que tal criar o primeiro?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {snaps.map((snap) => (
            <Card key={snap.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{snap.title}</CardTitle>
                <CardDescription>{snap.mood}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Exibindo a imagem ou vídeo */}
                {snap.media_url && (
                  <img src={snap.media_url} alt={snap.title} className="w-full h-48 object-cover rounded-md mb-4" />
                )}
                <p className="text-sm text-gray-700 mb-4">{snap.context}</p>
                <div className="flex flex-wrap gap-2">
                  {snap.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}