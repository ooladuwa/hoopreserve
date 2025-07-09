import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Needs elevated privileges
  )

  const now = new Date()

  // 1. End any expired queues
  const { data: expiredQueues } = await supabase
    .from('got_next_queues')
    .update({ is_active: false })
    .eq('is_active', true)
    .lt('start_time', new Date(now.getTime() - 20 * 60 * 1000))
    .select()

  console.log(`Expired ${expiredQueues?.length ?? 0} queues.`)

  // 2. For each court, see if players are still waiting
  const { data: courtsWithWaitingPlayers } = await supabase.rpc('get_next_queues')

  for (const row of courtsWithWaitingPlayers || []) {
    const courtId = row.court_id
    const queuePlayers = row.players

    // Take up to 5 players
    const nextPlayers = queuePlayers.slice(0, 5)

    if (nextPlayers.length === 0) continue

    // Create new queue
    const { data: newQueue } = await supabase
      .from('got_next_queues')
      .insert({
        court_id: courtId,
        start_time: now,
        is_active: true
      })
      .select()
      .single()

    const newQueueId = newQueue.id

    // Reassign players to new queue
    for (const player of nextPlayers) {
      await supabase
        .from('got_next_players')
        .update({ queue_id: newQueueId, notified: false })
        .eq('id', player.id)
    }

    console.log(`Promoted ${nextPlayers.length} players to court ${courtId}`)
  }

  return new Response('Queue rotation complete')
})
