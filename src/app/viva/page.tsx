'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

type Snap = {
  id: string;
  created_at: string;
  title: string;
  context: string;
  mood: string;
  media_url: string;
  tags: string[];
};

export default function VivaPage() {
  const router = useRouter()
  const [snaps, setSnaps] = useState<Snap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const performSearch = async (term: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase
        .rpc('search_snaps', { search_term: term })

      if (rpcError) throw rpcError;
      setSnaps(data || [])
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na busca.')
    } finally {
      setLoading(false)
    }
  }

  // Busca inicial quando a página carrega
  useEffect(() => {
    // A CORREÇÃO ESTÁ AQUI: Criamos uma função async interna
    const checkUserAndFetch = async () => {
      // Agora o 'await' é válido dentro desta função
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
      } else {
        performSearch(''); // Busca inicial sem termo para mostrar tudo
      }
    };

    checkUserAndFetch(); // Chamamos a função interna
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchTerm)
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">Erro: {error}</div>
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Camada Viva</h1>
        <p className="text-gray-600 mt-2">Explore os snaps compartilhados pela comunidade.</p>
      </div>
      
      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto mb-12">
        <Input 
          type="text"
          placeholder="Buscar por título, tag, mood..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit">Buscar</Button>
      </form>

      {loading ? (
         <div className="text-center">Carregando...</div>
      ) : snaps.length === 0 ? (
        <div className="text-center py-16 px-8 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold">Nenhum resultado encontrado.</h2>
            <p className="text-gray-600 mt-2">Tente um termo de busca diferente ou explore a galeria sem filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {snaps.map((snap) => (
            <Link key={snap.id} href={`/snap/${snap.id}`} passHref>
              <Card className="overflow-hidden h-full hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle>{snap.title}</CardTitle>
                  <CardDescription>{snap.mood}</CardDescription>
                </CardHeader>
                <CardContent>
                  {snap.media_url && (
                    <img src={snap.media_url} alt={snap.title} className="w-full h-48 object-cover rounded-md mb-4" />
                  )}
                  <div className="flex flex-wrap gap-2">
                    {snap.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}