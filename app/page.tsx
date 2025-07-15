"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, Target, Settings } from "lucide-react"
import {
  getTeams,
  getMatches,
  getPlayers,
  calculateLeagueTable,
  getChampionships,
  getActiveChampionship,
} from "@/lib/database"
import { AdminPanel } from "@/components/admin-panel"
import type { Team, Match, Player, Championship } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeamDisplay } from "@/components/team-display"

export default function KSLigaSite() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")

  const [teams, setTeams] = useState<Team[]>([])
  const [table, setTable] = useState<any[]>([])
  const [calendar, setCalendar] = useState<Match[]>([])
  const [results, setResults] = useState<Match[]>([])
  const [scorers, setScorers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const [currentChampionshipId, setCurrentChampionshipId] = useState<number | null>(null)
  const [championships, setChampionships] = useState<Championship[]>([])

  // Load initial data (championships list)
  useEffect(() => {
    loadInitialData()
  }, [])

  // Load championship-specific data when championship changes
  useEffect(() => {
    if (currentChampionshipId) {
      loadDataForChampionship(currentChampionshipId)
    }
  }, [currentChampionshipId])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      console.log("Loading initial data...")

      const [championshipsData, activeChampionship] = await Promise.all([getChampionships(), getActiveChampionship()])

      console.log("Championships loaded:", championshipsData)
      console.log("Active championship:", activeChampionship)

      setChampionships(championshipsData)

      // Set the current championship
      const championshipId = activeChampionship?.id || championshipsData[0]?.id
      if (championshipId) {
        console.log("Setting current championship to:", championshipId)
        setCurrentChampionshipId(championshipId)
      }
    } catch (error) {
      console.error("Error loading initial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadDataForChampionship = async (championshipId: number) => {
    try {
      setLoading(true)
      console.log("Loading data for championship:", championshipId)

      const [teamsData, matchesData, playersData, tableData] = await Promise.all([
        getTeams(championshipId),
        getMatches(championshipId),
        getPlayers(championshipId),
        calculateLeagueTable(championshipId),
      ])

      console.log("Loaded teams:", teamsData)
      console.log("Loaded matches:", matchesData)
      console.log("Loaded players:", playersData)

      setTeams(teamsData)
      setTable(tableData)
      setCalendar(matchesData.filter((m) => !m.is_finished))
      setResults(matchesData.filter((m) => m.is_finished))
      setScorers(playersData)
    } catch (error) {
      console.error("Error loading championship data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTeamLogo = (teamName: string): string => {
    const team = teams.find((t) => t.name === teamName)
    return team?.logo || "/placeholder.svg?height=32&width=32"
  }

  const handleLogin = () => {
    if (adminPassword === "ks2025") {
      setIsAdmin(true)
      setAdminPassword("")
    } else {
      alert("Невірний пароль")
    }
  }

  const getPositionColor = (position: number) => {
    if (position === 1) return "bg-yellow-100 border-yellow-300"
    if (position <= 3) return "bg-green-50 border-green-200"
    return "bg-white"
  }

  const handleChampionshipChange = (value: string) => {
    const newChampionshipId = Number.parseInt(value)
    console.log("Championship changed to:", newChampionshipId)
    setCurrentChampionshipId(newChampionshipId)
  }

  if (loading && !currentChampionshipId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-700 mb-2">KS Liga</div>
          <div className="text-lg">Завантаження...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img src="/images/ks-logo.png" alt="KS TV Logo" className="h-16 w-auto object-contain" />
            <h1 className="text-4xl font-bold">KS Liga</h1>
          </div>
          <p className="text-yellow-200 text-lg">KS TV – Спортивні події онлайн!</p>
          {championships.length > 1 && currentChampionshipId && (
            <div className="mt-4">
              <Select value={currentChampionshipId.toString()} onValueChange={handleChampionshipChange}>
                <SelectTrigger className="w-64 mx-auto bg-white text-black">
                  <SelectValue placeholder="Оберіть чемпіонат" />
                </SelectTrigger>
                <SelectContent>
                  {championships.map((championship) => (
                    <SelectItem key={championship.id} value={championship.id.toString()}>
                      {championship.name} ({championship.season})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Завантаження даних чемпіонату...</div>
          </div>
        ) : (
          <>
            {/* Debug info */}
            <div className="bg-gray-100 p-2 rounded text-xs text-gray-600">
              Поточний чемпіонат: {currentChampionshipId} | Команд: {teams.length} | Матчів:{" "}
              {calendar.length + results.length} | Гравців: {scorers.length}
            </div>

            {/* Tournament Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Trophy className="h-6 w-6" />
                  Турнірна таблиця
                </CardTitle>
              </CardHeader>
              <CardContent>
                {table.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Немає даних для відображення турнірної таблиці</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-yellow-100 border-b">
                          <th className="text-left p-3 font-semibold">#</th>
                          <th className="text-left p-3 font-semibold">Команда</th>
                          <th className="text-center p-3 font-semibold">І</th>
                          <th className="text-center p-3 font-semibold">В</th>
                          <th className="text-center p-3 font-semibold">Н</th>
                          <th className="text-center p-3 font-semibold">П</th>
                          <th className="text-center p-3 font-semibold">З</th>
                          <th className="text-center p-3 font-semibold">П</th>
                          <th className="text-center p-3 font-semibold">О</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.map((team, index) => (
                          <tr key={index} className={`border-b hover:bg-gray-50 ${getPositionColor(index + 1)}`}>
                            <td className="p-3 font-semibold">{index + 1}</td>
                            <td className="p-3">
                              <TeamDisplay teamName={team.name} teamLogo={getTeamLogo(team.name)} size="md" />
                            </td>
                            <td className="text-center p-3">{team.games}</td>
                            <td className="text-center p-3 text-green-600 font-semibold">{team.wins}</td>
                            <td className="text-center p-3 text-yellow-600 font-semibold">{team.draws}</td>
                            <td className="text-center p-3 text-red-600 font-semibold">{team.losses}</td>
                            <td className="text-center p-3">{team.gf}</td>
                            <td className="text-center p-3">{team.ga}</td>
                            <td className="text-center p-3 font-bold text-blue-700">{team.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Calendar className="h-6 w-6" />
                    Календар матчів
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {calendar.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Немає запланованих матчів</div>
                  ) : (
                    [...new Set(calendar.map((m) => m.round))].map((round) => (
                      <div key={round}>
                        <Badge variant="outline" className="mb-2">
                          Тур {round}
                        </Badge>
                        <div className="space-y-2">
                          {calendar
                            .filter((m) => m.round === round)
                            .map((match, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-600 mb-2">{match.date}</div>
                                <div className="flex items-center justify-between">
                                  <TeamDisplay
                                    teamName={match.home_team}
                                    teamLogo={getTeamLogo(match.home_team)}
                                    size="sm"
                                  />
                                  <span className="text-gray-500 mx-2 font-bold">VS</span>
                                  <TeamDisplay
                                    teamName={match.away_team}
                                    teamLogo={getTeamLogo(match.away_team)}
                                    size="sm"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Trophy className="h-6 w-6" />
                    Результати матчів
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Немає завершених матчів</div>
                  ) : (
                    [...new Set(results.map((r) => r.round))].map((round) => (
                      <div key={round}>
                        <Badge variant="outline" className="mb-2">
                          Тур {round}
                        </Badge>
                        <div className="space-y-2">
                          {results
                            .filter((r) => r.round === round)
                            .map((result, index) => (
                              <div key={index} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                                <div className="text-sm text-gray-600 mb-2">{result.date}</div>
                                <div className="flex items-center justify-center gap-3">
                                  <TeamDisplay
                                    teamName={result.home_team}
                                    teamLogo={getTeamLogo(result.home_team)}
                                    size="sm"
                                  />
                                  <div className="bg-white px-3 py-1 rounded font-bold text-green-900 min-w-[60px] text-center">
                                    {result.home_score} — {result.away_score}
                                  </div>
                                  <TeamDisplay
                                    teamName={result.away_team}
                                    teamLogo={getTeamLogo(result.away_team)}
                                    size="sm"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Top Scorers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Target className="h-6 w-6" />
                    Бомбардири
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {scorers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Немає даних про бомбардирів</div>
                  ) : (
                    <div className="space-y-3">
                      {scorers.map((scorer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{scorer.name}</div>
                              <TeamDisplay
                                teamName={scorer.team}
                                teamLogo={getTeamLogo(scorer.team)}
                                size="sm"
                                showName={true}
                                className="text-sm text-gray-600"
                              />
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {scorer.goals} гол{scorer.goals !== 1 ? "и" : ""}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Settings className="h-6 w-6" />
                    Адмін-панель
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isAdmin ? (
                    <div className="space-y-4">
                      <Input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Введіть пароль"
                        onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                      />
                      <Button onClick={handleLogin} className="w-full">
                        Увійти
                      </Button>
                    </div>
                  ) : (
                    currentChampionshipId && (
                      <AdminPanel
                        onLogout={() => setIsAdmin(false)}
                        currentChampionshipId={currentChampionshipId}
                        onChampionshipChange={(id) => {
                          setCurrentChampionshipId(id)
                        }}
                      />
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
