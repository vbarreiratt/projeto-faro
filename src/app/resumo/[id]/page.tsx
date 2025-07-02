'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from 'lucide-react'

// Tipos para nossos dados
type Snap = {
  id: string;
  title: string;
  context: string;
  mood: string;
  tags: string[];
  origin: string;
  category: string;
  timeframe: string;
  territory: string;
  community: string;
  status: string;
  media_url: string;
};

export default function ResumoPage() {
    const params = useParams<{ id:string }>();
    const id = params.id;
    const [snap, setSnap] = useState<Snap | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSnap = async () => {
            const { data, error } = await supabase
                .from('snaps')
                .select('*')
                .eq('id', id)
                .single();
            
            if (data) {
                setSnap(data);
            }
            setLoading(false);
        }
        if (id) {
            fetchSnap();
        }
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen bg-black text-white">Carregando resumo...</div>
    if (!snap) return <div className="flex justify-center items-center h-screen bg-black text-white">Snap não encontrado.</div>

    // Estilos reutilizados da página de registro, mas com texto branco
    const labelStyle = "font-sans font-extrabold text-white text-lg lowercase text-right";
    const contentStyle = "font-sans text-white text-lg";
    const titleStyle = "font-sans font-extrabold text-white text-6xl leading-tight";
    const footerButtonStyle = "bg-transparent text-white font-bold lowercase text-xl p-0 h-auto hover:bg-transparent hover:opacity-70";

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {/* Container para a imagem de fundo */}
            <div className="fixed inset-0 w-full h-full">
                <Image
                    src={snap.media_url}
                    alt=""
                    fill
                    className="object-cover"
                    priority
                    unoptimized={true}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        height: '100%',
                    }}
                />
            </div>
            
            {/* Overlay Escuro */}
            <div className="fixed inset-0 bg-black/30 z-10"></div>

            {/* Conteúdo Sobreposto */}
            <div className="relative z-20 h-full p-12 flex flex-col text-white">
                <header className="flex-shrink-0 flex justify-between items-start">
                  <h1 className="text-5xl font-extrabold lowercase">snaps</h1>
                  <div className="text-right">
                    <p className={labelStyle}>.status</p>
                    <p className={contentStyle}>{snap.status}</p>
                  </div>
                </header>

                <main className="flex-grow grid grid-cols-12 gap-x-8 mt-12 overflow-hidden">
                    <div className="col-span-1"></div>
                    <div className="col-span-5 flex flex-col">
                        <div className="space-y-6">
                            <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4">
                                <p className={labelStyle}>.título</p>
                                <h2 className={titleStyle}>{snap.title}</h2>
                            </div>
                            <div className="grid grid-cols-[8rem_1fr] items-start gap-4">
                                <p className={labelStyle}>.contexto</p>
                                <p className={contentStyle}>{snap.context}</p>
                            </div>
                            <div className="grid grid-cols-[8rem_1fr] items-start gap-4">
                                <p className={labelStyle}>.mood</p>
                                <p className={contentStyle}>{snap.mood}</p>
                            </div>
                            <div className="grid grid-cols-[8rem_1fr] items-start gap-4">
                                <p className={labelStyle}>.tags</p>
                                <div className="flex flex-wrap gap-2">
                                  {snap.tags?.map((tag, index) => (
                                    <span key={index} className={contentStyle}>#{tag}</span>
                                  ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4">
                                <p className={labelStyle}>.origem</p>
                                <p className={contentStyle}>{snap.origin}</p>
                            </div>
                            <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4">
                                <p className={labelStyle}>.categoria</p>
                                <p className={contentStyle}>{snap.category}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-6 flex flex-col justify-end">
                        <div className="w-full">
                           <div className="grid grid-cols-3 gap-x-8 mb-10">
                                <div className="grid grid-cols-[max-content_1fr] items-baseline gap-4">
                                    <p className={labelStyle}>.tempo</p>
                                    <p className={contentStyle}>{snap.timeframe}</p>
                                </div>
                                <div className="grid grid-cols-[max-content_1fr] items-baseline gap-4">
                                    <p className={labelStyle}>.território</p>
                                    <p className={contentStyle}>{snap.territory}</p>
                                </div>
                                <div className="grid grid-cols-[max-content_1fr] items-baseline gap-4">
                                    <p className={labelStyle}>.comunidade</p>
                                    <p className={contentStyle}>{snap.community}</p>
                                </div>
                            </div>
                            <div>
                                <p className={labelStyle}>.snaps parecidos</p>
                                <p className={contentStyle}>9686 - estética queer rural<br/>9028 - drag gótica de belém</p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="flex-shrink-0 flex justify-between items-center">
                    <div className="flex gap-6">
                        <Button variant="ghost" className={footerButtonStyle}>baixar snap</Button>
                        <Button variant="ghost" className={footerButtonStyle}>compartilhar snap</Button>
                        <Button variant="ghost" className={footerButtonStyle}>buscar snaps parecidos</Button>
                    </div>
                    
                    {/* ===== AQUI ESTÁ A MUDANÇA ===== */}
                    {/* Logo que também funciona como botão 'Continuar' */}
                    <Link href="/galeria" passHref>
                        <div className="relative w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity">
                            <Image
                                src="/logo.svg" // Next.js encontra arquivos na pasta 'public' automaticamente
                                alt="Continuar para a galeria"
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                    </Link>

                </footer>
            </div>
        </div>
    )
}