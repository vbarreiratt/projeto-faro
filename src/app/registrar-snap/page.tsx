'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function RegistrarSnapPage() {
  const router = useRouter()

  // Estados atualizados para cada campo do formulário
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [mood, setMood] = useState('')
  const [territory, setTerritory] = useState('')
  const [community, setCommunity] = useState('')
  const [timeframe, setTimeframe] = useState('')
  const [tags, setTags] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  // Novos campos
  const [origin, setOrigin] = useState('')
  const [category, setCategory] = useState('')
  const [source_url, setSourceUrl] = useState('')
  const [status, setStatus] = useState('aguardando') // Começa com um valor padrão

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setMediaFile(event.target.files[0])
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!mediaFile) {
      setError('Por favor, selecione um arquivo de mídia.')
      return
    }

    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado.')

      const filePath = `${user.id}/${Date.now()}-${mediaFile.name}`
      const { error: uploadError } = await supabase.storage.from('snaps-media').upload(filePath, mediaFile)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('snaps-media').getPublicUrl(filePath)

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)

      // Objeto de inserção atualizado
      const { error: insertError } = await supabase.from('snaps').insert({
        title,
        context,
        mood,
        territory,
        community,
        timeframe,
        tags: tagsArray,
        media_url: publicUrl,
        origin,
        category,
        source_url,
        status,
        // Note que não estamos inserindo 'description' e nem 'vibe_id' pelo formulário
      })

      if (insertError) throw insertError

      alert('Snap registrado com sucesso!')
      router.push('/dashboard')

    } catch (error: any) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Registrar um Novo Snap</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Coluna 1 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="media">Mídia (Imagem/Vídeo)</Label>
                <Input id="media" type="file" onChange={handleFileChange} accept="image/*,video/*" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Contexto (Onde, quando, como)</Label>
                <Textarea id="context" value={context} onChange={(e) => setContext(e.target.value)} />
              </div>
            </div>

            {/* Coluna 2 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mood">Mood (Leitura emocional/sensorial)</Label>
                <Input id="mood" value={mood} onChange={(e) => setMood(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origem (Print de TikTok, revista...)</Label>
                <Input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria (Estética visual, prática...)</Label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="source_url">URL da Fonte (Link opcional)</Label>
                <Input id="source_url" type="url" value={source_url} onChange={(e) => setSourceUrl(e.target.value)} />
              </div>
            </div>

            {/* Coluna 3 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="territory">Território (Cidade, bairro...)</Label>
                <Input id="territory" value={territory} onChange={(e) => setTerritory(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="community">Comunidade (Subcultura, grupo)</Label>
                <Input id="community" value={community} onChange={(e) => setCommunity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeframe">Período (Ano ou década)</Label>
                <Input id="timeframe" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            </div>

            {/* Botão e Erro */}
            {error && <p className="lg:col-span-3 text-sm text-red-500">{error}</p>}
            <div className="lg:col-span-3">
                <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? 'Enviando...' : 'Registrar Snap'}
                </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </main>
  )
}