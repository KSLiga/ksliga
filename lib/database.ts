import { supabase } from "./supabase"
import type { Championship, Team, Match, Player } from "./supabase"

// Championships
export async function getChampionships(): Promise<Championship[]> {
  const { data, error } = await supabase.from("championships").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getActiveChampionship(): Promise<Championship | null> {
  const { data, error } = await supabase.from("championships").select("*").eq("is_active", true).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function addChampionship(championship: Omit<Championship, "id" | "created_at">): Promise<Championship> {
  const { data, error } = await supabase.from("championships").insert([championship]).select().single()

  if (error) throw error
  return data
}

export async function updateChampionship(id: number, updates: Partial<Championship>): Promise<Championship> {
  const { data, error } = await supabase.from("championships").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteChampionship(id: number): Promise<void> {
  const { error } = await supabase.from("championships").delete().eq("id", id)

  if (error) throw error
}

// Teams
export async function addTeam(team: Omit<Team, "id" | "created_at">): Promise<Team> {
  console.log("Adding team:", team)

  const { data, error } = await supabase.from("teams").insert([team]).select().single()

  if (error) {
    console.error("Error adding team:", error)
    throw error
  }

  console.log("Team added successfully:", data)
  return data
}

export async function getTeams(championshipId?: number): Promise<Team[]> {
  console.log("Getting teams for championship:", championshipId)

  let query = supabase.from("teams").select("*").order("name")

  if (championshipId) {
    query = query.eq("championship_id", championshipId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error getting teams:", error)
    throw error
  }

  console.log("Teams retrieved:", data)
  return data || []
}

export async function updateTeam(id: number, updates: Partial<Team>): Promise<Team> {
  const { data, error } = await supabase.from("teams").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteTeam(id: number): Promise<void> {
  const { error } = await supabase.from("teams").delete().eq("id", id)

  if (error) throw error
}

// Matches
export async function getMatches(championshipId?: number): Promise<Match[]> {
  let query = supabase
    .from("matches")
    .select("*")
    .order("round", { ascending: true })
    .order("date", { ascending: true })

  if (championshipId) {
    query = query.eq("championship_id", championshipId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function addMatch(match: Omit<Match, "id" | "created_at">): Promise<Match> {
  const { data, error } = await supabase.from("matches").insert([match]).select().single()

  if (error) throw error
  return data
}

export async function updateMatch(id: number, updates: Partial<Match>): Promise<Match> {
  const { data, error } = await supabase.from("matches").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteMatch(id: number): Promise<void> {
  const { error } = await supabase.from("matches").delete().eq("id", id)

  if (error) throw error
}

// Players
export async function getPlayers(championshipId?: number): Promise<Player[]> {
  let query = supabase.from("players").select("*").order("goals", { ascending: false })

  if (championshipId) {
    query = query.eq("championship_id", championshipId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function addPlayer(player: Omit<Player, "id" | "created_at">): Promise<Player> {
  const { data, error } = await supabase.from("players").insert([player]).select().single()

  if (error) throw error
  return data
}

export async function updatePlayer(id: number, updates: Partial<Player>): Promise<Player> {
  const { data, error } = await supabase.from("players").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deletePlayer(id: number): Promise<void> {
  const { error } = await supabase.from("players").delete().eq("id", id)

  if (error) throw error
}

// Calculate league table from matches
export async function calculateLeagueTable(championshipId?: number) {
  const matches = await getMatches(championshipId)
  const teams = await getTeams(championshipId)

  const table = teams.map((team) => ({
    name: team.name,
    games: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0,
    pts: 0,
  }))

  matches
    .filter((match) => match.is_finished)
    .forEach((match) => {
      const homeTeam = table.find((t) => t.name === match.home_team)
      const awayTeam = table.find((t) => t.name === match.away_team)

      if (homeTeam && awayTeam && match.home_score !== null && match.away_score !== null) {
        homeTeam.games++
        awayTeam.games++
        homeTeam.gf += match.home_score
        homeTeam.ga += match.away_score
        awayTeam.gf += match.away_score
        awayTeam.ga += match.home_score

        if (match.home_score > match.away_score) {
          homeTeam.wins++
          homeTeam.pts += 3
          awayTeam.losses++
        } else if (match.home_score < match.away_score) {
          awayTeam.wins++
          awayTeam.pts += 3
          homeTeam.losses++
        } else {
          homeTeam.draws++
          awayTeam.draws++
          homeTeam.pts += 1
          awayTeam.pts += 1
        }
      }
    })

  return table.sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga))
}
