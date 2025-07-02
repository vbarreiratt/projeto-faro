'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ArrowBigUp, ArrowBigDown } from 'lucide-react'
import { Button } from './ui/button'

type VoteControlProps = {
  snapId: string | number;
  initialScore: number;
};

export default function VoteControl({ snapId, initialScore }: VoteControlProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: voteData } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('snap_id', snapId)
          .eq('user_id', user.id)
          .single();

        if (voteData) {
          setUserVote(voteData.vote_type);
        }
      }
    };
    getInitialData();
  }, [snapId]);

  const handleVote = async (voteType: 1 | -1) => {
    if (!userId) {
      alert('Você precisa estar logado para votar.');
      return;
    }

    let newScore = score;
    const previousVote = userVote;

    // Lógica de atualização otimista da UI
    if (voteType === previousVote) { // Desfazendo o voto
      setUserVote(null);
      newScore -= voteType;
    } else {
      setUserVote(voteType);
      newScore += voteType;
      if (previousVote) { // Se já havia um voto oposto, a mudança é dobrada
        newScore += voteType;
      }
    }
    setScore(newScore);

    // Lógica de banco de dados
    if (voteType === previousVote) {
        await supabase.from('votes').delete().match({ user_id: userId, snap_id: snapId });
    } else {
        await supabase.from('votes').upsert({
            user_id: userId,
            snap_id: snapId,
            vote_type: voteType,
        }, { onConflict: 'user_id,snap_id' });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={() => handleVote(1)}>
        <ArrowBigUp className={userVote === 1 ? 'fill-orange-500 text-orange-500' : ''} />
      </Button>
      <span className="font-bold text-lg">{score}</span>
      <Button variant="ghost" size="icon" onClick={() => handleVote(-1)}>
        <ArrowBigDown className={userVote === -1 ? 'fill-blue-500 text-blue-500' : ''} />
      </Button>
    </div>
  );
}