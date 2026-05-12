import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReportClient from './ReportClient'

export default async function ReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <ReportClient
      userEmail={user.email || ''}
      displayName={profile?.display_name || (user.email || '').split('@')[0]}
    />
  )
}
