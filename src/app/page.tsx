'use client'

import { useState, useEffect } from 'react' // Importamos o useEffect
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome } from "lucide-react" 
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Escuta mudanças de autenticação e redireciona se o usuário já estiver logado
  useEffect(() => {
    // Verifica se já existe uma sessão ativa
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push('/dashboard')
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])


  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      // O redirecionamento para o login com senha já acontece aqui, mas o useEffect acima também garante
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleSocialLogin = async (provider: 'google') => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/dashboard`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // Não precisamos redirecionar aqui, o useEffect vai cuidar disso quando o evento SIGNED_IN for detectado
  }

  return (
    <div className="bg-white p-[15pt] h-screen">
      <div className="relative w-full h-full rounded-[15pt] overflow-hidden">
        <Image src="/bg.png" alt="Fundo" fill className="object-cover z-0" priority />
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <Card className="w-full max-w-sm rounded-2xl shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <Image src="/logoblack.svg" alt="Logo" width={64} height={64} className="mx-auto" />
              <CardTitle className="text-2xl font-bold">Login to your account</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm underline">Forgot your password?</a>
                  </div>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-black text-white" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </CardContent>
            </form>
            <CardFooter className="flex flex-col gap-4">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('google')} disabled={loading}>
                <Chrome className="mr-2 h-4 w-4" />
                Login with Google
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}