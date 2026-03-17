import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import PlanClient from './PlanClient'

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <PlanClient />
    </Suspense>
  )
}
