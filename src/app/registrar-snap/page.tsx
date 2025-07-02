'use client'

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import { supabase } from '@/lib/supabaseClient'

export default function RegistrarSnapPage() {
  const router = useRouter()
  
  // A lógica de estado e funções permanece a mesma
  const [title, setTitle] = useState("")
  const [context, setContext] = useState("")
  const [mood, setMood] = useState("")
  const [tags, setTags] = useState("")
  const [origin, setOrigin] = useState("")
  const [category, setCategory] = useState("")
  const [timeframe, setTimeframe] = useState("")
  const [territory, setTerritory] = useState("")
  const [community, setCommunity] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setMediaFile(file)
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview)
      }
      setMediaPreview(URL.createObjectURL(file))
    }
  }
  
  useEffect(() => {
    return () => {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview)
      }
    }
  }, [mediaPreview])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mediaFile) {
      setError("Por favor, selecione um arquivo de mídia.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const filePath = `${user.id}/${Date.now()}-${mediaFile.name}`;
      const { error: uploadError } = await supabase.storage.from('snaps-media').upload(filePath, mediaFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('snaps-media').getPublicUrl(filePath);
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      // ===== MUDANÇA IMPORTANTE AQUI =====
      // 1. Adicionamos .select('id').single() para pegar o ID do snap recém-criado
      const { data: newSnap, error: insertError } = await supabase.from('snaps').insert({
        title, context, mood, territory, community, timeframe, tags: tagsArray,
        media_url: publicUrl, origin, category, status: 'aguardando', user_id: user.id
      }).select('id').single();

      if (insertError) throw insertError;
      if (!newSnap) throw new Error("Não foi possível obter o ID do novo snap.");

      alert('Snap registrado com sucesso!');
      
      // 2. Redirecionamos para a nova página de resumo com o ID
      router.push(`/resumo/${newSnap.id}`);

    } catch (err: any)      {
      setError(err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ===== A CORREÇÃO ESTÁ AQUI =====
  // 1. Estilo base SEM tamanho de fonte
  const baseInputStyle = "bg-transparent border-0 border-b-2 border-black rounded-none focus-visible:ring-0 p-0 font-sans placeholder:text-gray-400 w-full";
  
  // 2. Estilo para os inputs normais, AGORA com o tamanho da fonte
  const regularInputStyle = `${baseInputStyle} text-lg`;
  
  // 3. Estilo para o título, que também usa a base e adiciona seus próprios estilos de fonte
  const titleInputStyle = `${baseInputStyle} text-6xl font-black leading-tight`;

  const labelStyle = "font-sans font-extrabold text-black text-lg lowercase text-right";
  const footerButtonStyle = "bg-transparent text-black font-extrabold lowercase text-5xl p-0 h-auto hover:bg-transparent hover:opacity-70";

  return (
    <div className="font-sans h-screen bg-white p-12 text-black flex flex-col">
      <form id="snap-form" onSubmit={handleSubmit} className="w-full flex flex-col flex-grow">
        
        <header className="flex-shrink-0">
          <h1 className="text-5xl font-extrabold lowercase">snaps</h1>
        </header>

        <div className="flex-grow grid grid-cols-12 gap-x-8 mt-12 overflow-hidden">
          <div className="col-span-1"></div>

          <div className="col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4">
                <label htmlFor="title" className={labelStyle}>.título</label>
                <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} rows={5} required className={titleInputStyle} />
              </div>
              <div className="grid grid-cols-[8rem_1fr] items-start gap-4">
                <label htmlFor="context" className={labelStyle}>.contexto</label>
                <Textarea id="context" value={context} onChange={(e) => setContext(e.target.value)} rows={5} className={regularInputStyle} />
              </div>
              <div className="grid grid-cols-[8rem_1fr] items-start gap-4">
                <label htmlFor="mood" className={labelStyle}>.mood</label>
                <Textarea id="mood" value={mood} onChange={(e) => setMood(e.target.value)} rows={3} className={regularInputStyle} />
              </div>
              <div className="grid grid-cols-[8rem_1fr] items-start gap-4">
                <label htmlFor="tags" className={labelStyle}>.tags</label>
                <Textarea id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag um, tag dois" rows={2} className={regularInputStyle} />
              </div>
              <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4">
                <label htmlFor="origin" className={labelStyle}>.origem</label>
                <Input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} className={regularInputStyle} />
              </div>
              <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4">
                <label htmlFor="category" className={labelStyle}>.categoria</label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={regularInputStyle} />
              </div>
            </div>
          </div>
          
          <div className="col-span-6 flex flex-col">
            <div className="flex-grow grid grid-cols-[max-content_1fr] gap-6 items-start">
                <label htmlFor="media" className={labelStyle}>.registro</label>
                <div className="relative w-full h-full min-h-[300px] bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                  <input type="file" onChange={handleFileChange} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*,video/*" />
                  {!mediaPreview && <div className="text-center"><Upload className="mx-auto mb-2 h-8 w-8" /><p>Selecione um arquivo</p></div>}
                  {mediaPreview && (
                    <Image src={mediaPreview} alt="Preview" layout="fill" objectFit="cover" className="z-0" />
                  )}
                </div>
            </div>
            <div className="grid grid-cols-3 gap-x-8 mt-6">
               <div className="grid grid-cols-[max-content_1fr] items-baseline gap-4">
                  <label htmlFor="timeframe" className={labelStyle}>.tempo</label>
                  <Input id="timeframe" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className={regularInputStyle} />
                </div>
                 <div className="grid grid-cols-[max-content_1fr] items-baseline gap-4">
                  <label htmlFor="territory" className={labelStyle}>.território</label>
                  <Input id="territory" value={territory} onChange={(e) => setTerritory(e.target.value)} className={regularInputStyle} />
                </div>
                 <div className="grid grid-cols-[max-content_1fr] items-baseline gap-4">
                  <label htmlFor="community" className={labelStyle}>.comunidade</label>
                  <Input id="community" value={community} onChange={(e) => setCommunity(e.target.value)} className={regularInputStyle} />
                </div>
            </div>
          </div>
        </div>
        
        <footer className="flex justify-between items-center mt-8 flex-shrink-0">
              <Button type="button" onClick={() => router.back()} className={footerButtonStyle}>
                  voltar
              </Button>
              <Button type="submit" disabled={saving} className={footerButtonStyle}>
                  {saving ? 'salvando...' : 'continuar'}
              </Button>
        </footer>
        {error && <p className="text-right text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  )
}