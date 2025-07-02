'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'

// Tipo para os dados do perfil
type Profile = {
  id: string;
  username: string;
  bio: string;
  avatar_url: string;
  website_url: string;
};

// Tipo para os snaps (pode ser o mesmo da galeria)
type Snap = {
  id: string;
  created_at: string;
  title: string;
  mood: string;
  media_url: string;
  tags: string[];
};

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id; // ID do usuário cujo perfil estamos vendo

  const [profile, setProfile] = useState<Profile | null>(null);
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) return;
      
      try {
        // Fetch de dados em paralelo para mais eficiência
        const [profileResponse, snapsResponse] = await Promise.all([
          // Busca 1: Detalhes do perfil
          supabase.from('profiles').select('*').eq('id', id).single(),
          // Busca 2: Snaps públicos deste usuário
          supabase.from('snaps').select('*').eq('user_id', id).eq('is_public', true).order('created_at', { ascending: false })
        ]);

        if (profileResponse.error) throw profileResponse.error;
        if (snapsResponse.error) throw snapsResponse.error;

        setProfile(profileResponse.data);
        setSnaps(snapsResponse.data);

      } catch (err: any) {
        setError(err.message || "Não foi possível carregar o perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen">Carregando perfil...</div>
  if (error) return <div className="flex justify-center items-center h-screen">Erro: {error}</div>
  if (!profile) return <div className="flex justify-center items-center h-screen">Perfil não encontrado.</div>

  return (
    <main className="container mx-auto p-4 md:p-8">
      {/* Seção do Header do Perfil */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
          <AvatarFallback>{profile.username?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold">{profile.username}</h1>
          {profile.website_url && (
            <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {profile.website_url}
            </a>
          )}
          <p className="max-w-xl mt-4 text-gray-600">{profile.bio}</p>
        </div>
      </div>

      {/* Seção da Galeria de Snaps do Perfil */}
      <h2 className="text-2xl font-bold border-b pb-2 mb-8">Snaps Públicos</h2>
      
      {snaps.length === 0 ? (
        <p className="text-gray-500">Este usuário ainda não publicou nenhum snap.</p>
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
                  <img src={snap.media_url} alt={snap.title} className="w-full h-48 object-cover rounded-md mb-4" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}