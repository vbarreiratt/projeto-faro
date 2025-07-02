'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Bookmark } from 'lucide-react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


type SaveControlProps = {
  snapId: string | number;
};

export default function SaveControl({ snapId }: SaveControlProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Verifica se já existe um registro em 'saved_snaps'
        const { data: saveData, error } = await supabase
          .from('saved_snaps')
          .select('snap_id')
          .eq('user_id', user.id)
          .eq('snap_id', snapId)
          .single(); // .single() retorna um objeto ou null

        if (saveData) {
          setIsSaved(true);
        }
      }
      setIsLoading(false);
    };
    getInitialData();
  }, [snapId]);

  const handleSaveToggle = async () => {
    if (!userId) {
      alert('Você precisa estar logado para salvar.');
      return;
    }

    // Atualização otimista da UI
    const currentlySaved = isSaved;
    setIsSaved(!currentlySaved);

    if (currentlySaved) {
      // Se já está salvo, remove o registro
      await supabase.from('saved_snaps').delete().match({ user_id: userId, snap_id: snapId });
    } else {
      // Se não está salvo, insere um novo registro
      await supabase.from('saved_snaps').insert({ user_id: userId, snap_id: snapId });
    }
  };

  if (isLoading) {
    return <Button variant="ghost" size="icon" disabled><Bookmark className="h-5 w-5" /></Button>
  }

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSaveToggle} disabled={!userId}>
                    <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{isSaved ? 'Remover dos salvos' : 'Salvar snap'}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}