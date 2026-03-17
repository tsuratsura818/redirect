import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const admin = await isAdmin(user.id)
  if (!admin) redirect('/dashboard')

  return <AdminClient currentUserId={user.id} />
}
