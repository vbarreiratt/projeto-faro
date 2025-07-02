'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage('')

    // Usamos signUp em vez de signInWithPassword
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccessMessage('Registro realizado com sucesso! Por favor, verifique seu e-mail para confirmar a conta.')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white p-[15pt] h-screen">
      <div className="relative w-full h-full rounded-[15pt] overflow-hidden">
        <Image src="/bg.png" alt="Fundo" fill className="object-cover z-0" priority />
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <Card className="w-full max-w-sm rounded-2xl shadow-2xl">
            <CardHeader className="text-center">
              <Image src="/logoblack.svg" alt="Logo" width={64} height={64} className="mx-auto" />
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>Enter your details to get started</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@exemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
                <Button type="submit" className="w-full bg-black text-white" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </CardContent>
            </form>
            <CardFooter>
              <p className="w-full text-center text-sm text-gray-500">
                Already have an account? <Link href="/" className="underline">Login</Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}