import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();

    // Expire old queues
    await supabase
        .from("got_next_queues")
        .update({ is_active: false })
        .lt("start_time", new Date(now.getTime() - 20 * 60 * 1000))
        .eq("is_active", true);

    // Get waiting players grouped by court
    const { data: waitingPlayersData } = await supabase.rpc("get_next_queues");

    if (!waitingPlayersData) {
        return new Response("No waiting players found", { status: 200 });
    }

    // Promote next batches
    for (const queueGroup of waitingPlayersData) {
        const courtId = queueGroup.court_id;
        const players = queueGroup.players;

        if (!players || players.length === 0) continue;

        const batchPlayers = players.slice(0, 5);

        // Create new active queue
        const { data: newQueue } = await supabase
            .from("got_next_queues")
            .insert([{ court_id: courtId, start_time: now, is_active: true }])
            .select()
            .single();

        // Reassign promoted players to the new queue
        for (const player of batchPlayers) {
            await supabase
                .from("got_next_players")
                .update({ queue_id: newQueue.id, notified: false })
                .eq("id", player.id);
        }
    }

    return new Response("Rotation complete");
});
