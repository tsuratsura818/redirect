import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { redirect } from 'next/navigation'
import XPostsClient from './XPostsClient'

export default async function XPostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const admin = await isAdmin(user.id)
  if (!admin) redirect('/dashboard')

  return <XPostsClient />
}
