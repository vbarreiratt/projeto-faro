'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Badge } from "@/components/ui/badge"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import VoteControl from '@/components/VoteControl'
import SaveControl from '@/components/SaveControl'
import { GitFork, MessageCircle, Bookmark, Trash2 } from 'lucide-react' // 1. Ícone de lixeira importado
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

// Tipos para nossos dados
type Snap = {
  id: string | number;
  user_id: string; 
  created_at: string;
  title: string;
  context: string;
  mood: string;
  media_url: string;
  territory: string;
  community: string;
  timeframe: string;
  origin: string;
  category: string;
  source_url: string;
  status: string;
  tags: string[];
  score: number;
  comment_count: number;
  save_count: number;
  fork_count: number;
};

type Comment = {
    id: string;
    created_at: string;
    content: string;
    user_id: string;
};

// Usamos props pois o hook useParams apresentou instabilidade no seu ambiente de build
export default function SnapPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const id = params.id;

  // Estados do componente
  const [snap, setSnap] = useState<Snap | null>(null)
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isForking, setIsForking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // 2. Novo estado para controlar a deleção

  useEffect(() => {
    const fetchAllData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) { setCurrentUserId(user.id); }
            
            const { data: snapData, error: snapError } = await supabase.from('snaps').select('*').eq('id', id).single();
            if (snapError) throw snapError;
            setSnap(snapData);
            
            const { data: commentsData, error: commentsError } = await supabase.from('comments').select('*').eq('snap_id', id).order('created_at', { ascending: true });
            if (commentsError) throw commentsError;
            setComments(commentsData || []);

        } catch (err: any) {
            setError(err.message || 'Não foi possível carregar os dados.');
        } finally {
            setLoading(false);
        }
    };
    if (id) { fetchAllData(); }
  }, [id]);

  const handleRemix = async () => {
    if (!currentUserId || !snap) return;
    setIsForking(true);
    try {
      const { data: newSnapId, error } = await supabase.rpc('fork_snap', { original_snap_id: snap.id, forking_user_id: currentUserId });
      if (error) throw error;
      alert('Snap remixado com sucesso! Você será redirecionado para a tela de edição do seu novo snap.');
      router.push(`/snap/${newSnapId}/edit`);
    } catch (error: any) {
      alert(`Erro ao remixar: ${error.message}`);
    } finally {
      setIsForking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId || !snap) return;
    setIsSubmittingComment(true);
    const { data, error } = await supabase.from('comments').insert({ content: newComment, snap_id: snap.id, user_id: currentUserId }).select().single();
    if (error) {
      alert("Erro ao enviar comentário: " + error.message);
    } else if (data) {
      setComments([...comments, data]);
      setNewComment('');
    }
    setIsSubmittingComment(false);
  };

  // 3. Nova função para apagar o snap
  const handleDelete = async () => {
    if (!snap) return;
    const isConfirmed = window.confirm("Você tem certeza que deseja apagar este snap? Esta ação não pode ser desfeita.");
    if (isConfirmed) {
      setIsDeleting(true);
      try {
        const { error: deleteError } = await supabase.from('snaps').delete().eq('id', snap.id);
        if (deleteError) throw deleteError;
        alert('Snap apagado com sucesso.');
        router.push('/galeria');
      } catch (error: any) {
        alert("Erro ao apagar o snap: " + error.message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Carregando snap...</div>
  if (error || !snap) return <div className="flex justify-center items-center h-screen">{error || 'Snap não encontrado.'}</div>

  const isOwner = currentUserId === snap.user_id;

  return (
    <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-black">&larr; Voltar</button>
                <div className="flex items-center gap-2">
                    <SaveControl snapId={snap.id} />
                    {/* 4. JSX ATUALIZADO para incluir o botão de apagar */}
                    {isOwner ? (
                        <>
                          <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting} title="Apagar Snap">
                            {isDeleting ? "..." : <Trash2 className="h-4 w-4" />}
                          </Button>
                          <Link href={`/snap/${snap.id}/edit`} passHref>
                              <Button variant="outline">Editar Snap</Button>
                          </Link>
                        </>
                    ) : (
                        <Button variant="outline" onClick={handleRemix} disabled={isForking || !currentUserId}><GitFork className="mr-2 h-4 w-4" />{isForking ? 'Remixando...' : 'Remixar Snap'}</Button>
                    )}
                </div>
            </div>
            
            <div className="flex items-start gap-4 mb-2">
                <VoteControl snapId={snap.id} initialScore={snap.score} />
                <h1 className="text-4xl font-bold">{snap.title}</h1>
            </div>
            
             <div className="flex items-center gap-6 pl-12 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /><span>{snap.comment_count}</span></div>
                <div className="flex items-center gap-1"><Bookmark className="h-4 w-4" /><span>{snap.save_count}</span></div>
                <div className="flex items-center gap-1"><GitFork className="h-4 w-4" /><span>{snap.fork_count}</span></div>
            </div>

            <p className="text-lg text-gray-500 mb-6 pl-12">{snap.mood}</p>
            <img src={snap.media_url} alt={snap.title} className="w-full rounded-lg shadow-lg my-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-2"><h3 className="font-semibold text-xl mb-2">Contexto</h3><p>{snap.context}</p></div>
              <div><h3 className="font-semibold text-xl mb-2">Detalhes</h3><ul className="space-y-2 text-sm"><li><strong>Origem:</strong> {snap.origin}</li><li><strong>Categoria:</strong> {snap.category}</li><li><strong>Território:</strong> {snap.territory}</li><li><strong>Comunidade:</strong> {snap.community}</li><li><strong>Período:</strong> {snap.timeframe}</li>{snap.source_url && <li><strong>Fonte:</strong> <a href={snap.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></li>}</ul></div>
            </div>

            <div><h3 className="font-semibold text-xl mb-2">Tags</h3><div className="flex flex-wrap gap-2">{snap.tags?.map((tag, index) => (<Badge key={index} variant="secondary">{tag}</Badge>))}</div></div>
            
            <hr className="my-12" />
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center"><MessageCircle className="mr-3 h-6 w-6" /> Comentários</h2>
              <Card className="mb-8"><CardContent className="p-6"><form onSubmit={handleCommentSubmit}><Label htmlFor="comment" className="font-semibold">Deixe seu comentário</Label><Textarea id="comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escreva algo construtivo..." className="mt-2" disabled={!currentUserId} /><Button type="submit" className="mt-4" disabled={isSubmittingComment || !currentUserId}>{isSubmittingComment ? "Enviando..." : "Enviar Comentário"}</Button></form></CardContent></Card>
              <div className="space-y-6">
                {comments.map(comment => (<div key={comment.id} className="flex gap-4"><Avatar><AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${comment.user_id}`} /><AvatarFallback>U</AvatarFallback></Avatar><div className="flex-1"><div className="flex items-center gap-2"><Link href={`/perfil/${comment.user_id}`} className="font-semibold text-sm hover:underline">
    {comment.user_id.substring(0, 8)}...
</Link><span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span></div><p className="mt-1 text-gray-800">{comment.content}</p></div></div>))}
                {comments.length === 0 && <p className="text-sm text-gray-500 text-center">Nenhum comentário ainda. Seja o primeiro!</p>}
              </div>
            </div>
        </div>
    </main>
  )
}