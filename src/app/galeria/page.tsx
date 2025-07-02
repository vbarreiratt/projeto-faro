'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox' // 1. Importamos o Checkbox
import { Trash2 } from 'lucide-react'

type Snap = {
  id: string; // Garantindo que o id seja sempre string
  created_at: string;
  title: string;
  mood: string;
  media_url: string;
  tags: string[];
};

export default function GaleriaPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<'creations' | 'saved'>('creations');
  const [snaps, setSnaps] = useState<Snap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 2. Novo estado para guardar os IDs dos snaps selecionados
  const [selectedSnaps, setSelectedSnaps] = useState<string[]>([]);

  useEffect(() => {
    // A lógica de fetch de dados permanece a mesma
    const fetchSnaps = async () => {
      setLoading(true);
      setError(null);
      setSelectedSnaps([]); // Limpa a seleção ao mudar de visão

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      let query;
      if (activeView === 'creations') {
        query = supabase.from('snaps').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      } else {
        query = supabase.from('saved_snaps').select('snaps(*)').eq('user_id', user.id).order('created_at', { ascending: false, referencedTable: 'snaps' });
      }

      const { data, error } = await query;
      if (error) {
        setError(error.message);
      } else if (data) {
        const formattedData = activeView === 'saved' ? data.map((item: any) => item.snaps).filter(Boolean) : data;
        setSnaps(formattedData);
      }
      setLoading(false);
    };
    fetchSnaps();
  }, [activeView, router]);

  // 3. Função para lidar com a seleção de um snap
  const handleSelectSnap = (snapId: string) => {
    setSelectedSnaps((prevSelected) => {
      if (prevSelected.includes(snapId)) {
        return prevSelected.filter((id) => id !== snapId); // Desmarca se já estiver selecionado
      } else {
        return [...prevSelected, snapId]; // Marca se não estiver selecionado
      }
    });
  };

  // 4. Função para apagar os snaps selecionados
  const handleBatchDelete = async () => {
    const confirmMessage = `Você tem certeza que deseja apagar ${selectedSnaps.length} snap(s)? Esta ação não pode ser desfeita.`;
    if (window.confirm(confirmMessage)) {
      const { error } = await supabase
        .from('snaps')
        .delete()
        .in('id', selectedSnaps); // Usa .in() para apagar múltiplos IDs

      if (error) {
        alert("Erro ao apagar os snaps: " + error.message);
      } else {
        // Remove os snaps apagados da tela instantaneamente
        setSnaps((prevSnaps) => prevSnaps.filter((snap) => !selectedSnaps.includes(snap.id)));
        setSelectedSnaps([]); // Limpa a seleção
        alert("Snaps apagados com sucesso.");
      }
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Galeria Bruta</h1>
        <Link href="/registrar-snap" passHref><Button>+ Criar Novo Snap</Button></Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        {/* Botões de Filtro */}
        <div className="flex gap-2 border-b">
          <Button variant={activeView === 'creations' ? 'default' : 'outline'} onClick={() => setActiveView('creations')}>Minhas Criações</Button>
          <Button variant={activeView === 'saved' ? 'default' : 'outline'} onClick={() => setActiveView('saved')}>Meus Salvos</Button>
        </div>
        
        {/* 5. Botão de Apagar em Lote (só aparece se houver seleção) */}
        {selectedSnaps.length > 0 && activeView === 'creations' && (
          <Button variant="destructive" onClick={handleBatchDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Apagar ({selectedSnaps.length})
          </Button>
        )}
      </div>

      {loading ? ( <div className="text-center py-10">Carregando...</div>
      ) : error ? ( <div className="text-center text-red-600 py-10">Erro: {error}</div>
      ) : snaps.length === 0 ? (
        <div className="text-center py-16 px-8 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold">{activeView === 'creations' ? 'Você ainda não criou nenhum snap.' : 'Você ainda não salvou nenhum snap.'}</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {snaps.map((snap) => (
            <div key={snap.id} className="relative">
              {/* 6. Adicionamos o Checkbox em cada card */}
              {activeView === 'creations' && (
                <Checkbox
                  checked={selectedSnaps.includes(snap.id)}
                  onCheckedChange={() => handleSelectSnap(snap.id)}
                  className="absolute top-4 right-4 z-10 bg-white"
                  aria-label={`Selecionar snap ${snap.title}`}
                />
              )}
              <Link href={`/snap/${snap.id}`} passHref>
                <Card className={`overflow-hidden h-full hover:shadow-xl transition-shadow duration-300 cursor-pointer ${selectedSnaps.includes(snap.id) ? 'border-2 border-primary' : ''}`}>
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
            </div>
          ))}
        </div>
      )}
    </main>
  )
}