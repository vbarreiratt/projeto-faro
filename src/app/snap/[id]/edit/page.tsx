'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'

export default function EditSnapPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  // Estados para cada campo do formulário
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [mood, setMood] = useState('')
  const [territory, setTerritory] = useState('')
  const [community, setCommunity] = useState('')
  const [timeframe, setTimeframe] = useState('')
  const [tags, setTags] = useState('')
  const [origin, setOrigin] = useState('')
  const [category, setCategory] = useState('')
  const [source_url, setSourceUrl] = useState('')
  const [status, setStatus] = useState('')
  const [isPublic, setIsPublic] = useState(false) // Estado para o switch de publicação

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Busca os dados do snap para preencher o formulário
    const fetchSnapData = async () => {
      const { data, error } = await supabase
        .from('snaps')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError("Não foi possível carregar os dados do snap para edição.")
        setLoading(false)
        return
      }

      // Preenche os estados com os dados do banco
      setTitle(data.title)
      setContext(data.context || '')
      setMood(data.mood || '')
      setTerritory(data.territory || '')
      setCommunity(data.community || '')
      setTimeframe(data.timeframe || '')
      setTags(data.tags?.join(', ') || '')
      setOrigin(data.origin || '')
      setCategory(data.category || '')
      setSourceUrl(data.source_url || '')
      setStatus(data.status || '')
      setIsPublic(data.is_public)
      
      setLoading(false)
    }

    if (id) {
      fetchSnapData()
    }
  }, [id])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)

    // A MÁGICA ESTÁ AQUI: Usamos .update() em vez de .insert()
    const { error: updateError } = await supabase
      .from('snaps')
      .update({
        title,
        context,
        mood,
        territory,
        community,
        timeframe,
        tags: tagsArray,
        origin,
        category,
        source_url,
        status,
        is_public: isPublic // Atualiza o status de publicação
      })
      .eq('id', id) // Específica qual snap deve ser atualizado

    if (updateError) {
      setError(updateError.message)
    } else {
      alert('Snap atualizado com sucesso!')
      router.push(`/snap/${id}`) // Redireciona de volta para a página de detalhe
    }
    setSaving(false)
  }

  if (loading) return <div>Carregando editor...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Editando Snap</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* O formulário é igual ao de registro, mas os campos já vêm preenchidos */}
            {/* Coluna 1 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Contexto</Label>
                <Textarea id="context" value={context} onChange={(e) => setContext(e.target.value)} />
              </div>
            </div>
            {/* Coluna 2 */}
            <div className="space-y-4">
                <div className="space-y-2"><Label htmlFor="mood">Mood</Label><Input id="mood" value={mood} onChange={(e) => setMood(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="origin">Origem</Label><Input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="category">Categoria</Label><Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} /></div>
            </div>
            {/* Coluna 3 */}
            <div className="space-y-4">
                <div className="space-y-2"><Label htmlFor="territory">Território</Label><Input id="territory" value={territory} onChange={(e) => setTerritory(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="community">Comunidade</Label><Input id="community" value={community} onChange={(e) => setCommunity(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="timeframe">Período</Label><Input id="timeframe" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} /></div>
            </div>

            {/* Campos de rodapé */}
            <div className="md:col-span-2 space-y-2"><Label htmlFor="tags">Tags (separadas por vírgula)</Label><Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} /></div>
            <div className="flex items-center space-x-2 pt-8">
                <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="isPublic">Tornar Público (visível na Camada Viva)</Label>
            </div>

            {/* Botão e Erro */}
            <div className="lg:col-span-3">
                <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}