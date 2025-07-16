"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import { getCupMatches, getTeams } from "@/lib/database"
import type { Match, Team } from "@/lib/supabase"
import { TeamDisplay } from "@/components/team-display"

interface CupTournamentProps {
  championshipId: number
}

const CUP_STAGES = ["1/32 фіналу", "1/16 фіналу", "1/8 фіналу", "1/4 фіналу", "1/2 фіналу", "Фінал"]

export function CupTournament({ championshipId }: CupTournamentProps) {
  const [matches, setMatches] = useState<{ [key: string]: Match[] }>({})
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCupData()
  }, [championshipId])

  const loadCupData = async () => {
    try {
      setLoading(true)
      const [teamsData, ...stageMatches] = await Promise.all([
        getTeams(championshipId),
        ...CUP_STAGES.map((stage) => getCupMatches(championshipId, stage)),
      ])

      setTeams(teamsData)

      const matchesByStage: { [key: string]: Match[] } = {}
      CUP_STAGES.forEach((stage, index) => {
        matchesByStage[stage] = stageMatches[index]
      })

      setMatches(matchesByStage)
    } catch (error) {
      console.error("Error loading cup data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTeamLogo = (teamName: string): string => {
    const team = teams.find((t) => t.name === teamName)
    return team?.logo || "/placeholder.svg?height=32&width=32"
  }

  if (loading) {
    return <div className="text-center py-8">Завантаження кубкового турніру...</div>
  }

  return (
    <div className="space-y-6">
      {CUP_STAGES.map((stage) => (
        <Card key={stage}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Trophy className="h-5 w-5" />
              {stage}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matches[stage]?.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Немає матчів на цій стадії</div>
            ) : (
              <div className="grid gap-3">
                {matches[stage]?.map((match, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-600">
                        {match.date} {match.match_time && `о ${match.match_time}`}
                      </div>
                      <Badge variant={match.is_finished ? "default" : "secondary"}>
                        {match.is_finished ? "Завершено" : "Заплановано"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <TeamDisplay teamName={match.home_team} teamLogo={getTeamLogo(match.home_team)} size="sm" />
                      <div className="text-center">
                        {match.is_finished ? (
                          <div className="bg-green-100 px-3 py-1 rounded font-bold text-green-900">
                            {match.home_score} — {match.away_score}
                          </div>
                        ) : (
                          <span className="text-gray-500 font-bold">VS</span>
                        )}
                      </div>
                      <TeamDisplay teamName={match.away_team} teamLogo={getTeamLogo(match.away_team)} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
