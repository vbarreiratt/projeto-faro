'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from 'next/navigation'

type Profile = {
  id: string;
  username: string;
  bio: string;
  avatar_url: string;
  website_url: string;
};

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      console.log('ID do usuário na aplicação:', user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);

    try {
      let avatarUrl = profile.avatar_url;

      // Se um novo arquivo de avatar foi selecionado, faz o upload
      if (avatarFile) {
        const filePath = `${profile.id}/avatar-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true }); // upsert: true sobrescreve se já existir

        if (uploadError) throw uploadError;

        // Pega a URL pública do novo avatar
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = publicUrl;
      }

      // Atualiza a tabela de profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          bio: profile.bio,
          website_url: profile.website_url,
          avatar_url: avatarUrl,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      alert('Perfil atualizado com sucesso!');
    } catch (error: any) {
      alert('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Carregando perfil...</div>
  if (!profile) return <div>Não foi possível carregar o perfil. Tente novamente mais tarde.</div>

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Editar Perfil</h1>
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
                <AvatarFallback>{profile.username?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <Label htmlFor="avatar">Alterar foto de perfil</Label>
                <Input id="avatar" type="file" onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])} accept="image/*" />
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Nome de usuário</Label>
          <Input id="username" value={profile.username || ''} onChange={(e) => setProfile({...profile, username: e.target.value})} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Site</Label>
          <Input id="website" type="url" value={profile.website_url || ''} onChange={(e) => setProfile({...profile, website_url: e.target.value})} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={profile.bio || ''} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    </main>
  )
}