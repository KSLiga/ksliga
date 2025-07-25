"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  getChampionships,
  addChampionship,
  updateChampionship,
  deleteChampionship,
  getTeams,
  addTeam,
  updateTeam,
  deleteTeam,
  getMatches,
  addMatch,
  updateMatch,
  deleteMatch,
  getPlayers,
  addPlayer,
  updatePlayer,
  deletePlayer,
  getMatchGoals,
  addMatchGoal,
  deleteMatchGoal,
} from "@/lib/database"
import type { Championship, Team, Match, Player, MatchGoal } from "@/lib/supabase"

interface AdminPanelProps {
  onLogout: () => void
  currentChampionshipId: number
  onChampionshipChange: (id: number) => void
}

export function AdminPanel({ onLogout, currentChampionshipId, onChampionshipChange }: AdminPanelProps) {
  const [championships, setChampionships] = useState<Championship[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)

  // Championship form state
  const [championshipForm, setChampionshipForm] = useState({
    name: "",
    season: "",
    is_active: false,
    tournament_type: "league",
  })
  const [editingChampionship, setEditingChampionship] = useState<Championship | null>(null)

  // Team form state
  const [teamForm, setTeamForm] = useState({ name: "", logo: "" })
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  // Match form state
  const [matchForm, setMatchForm] = useState({
    round: 1,
    date: "",
    home_team: "",
    away_team: "",
    home_score: "",
    away_score: "",
    is_finished: false,
    match_time: "",
    cup_stage: "",
  })
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)

  // Player form state
  const [playerForm, setPlayerForm] = useState({ name: "", team: "", goals: 0 })
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const currentChampionship = championships.find((c) => c.id === currentChampionshipId)

  useEffect(() => {
    loadData()
  }, [currentChampionshipId])

  const loadData = async () => {
    try {
      const [championshipsData, teamsData, matchesData, playersData] = await Promise.all([
        getChampionships(),
        getTeams(currentChampionshipId),
        getMatches(currentChampionshipId),
        getPlayers(currentChampionshipId),
      ])
      setChampionships(championshipsData)
      setTeams(teamsData)
      setMatches(matchesData)
      setPlayers(playersData)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  // Championship handlers
  const handleChampionshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingChampionship) {
        await updateChampionship(editingChampionship.id, championshipForm)
        setEditingChampionship(null)
      } else {
        const newChampionship = await addChampionship(championshipForm)
        onChampionshipChange(newChampionship.id)
      }
      setChampionshipForm({ name: "", season: "", is_active: false, tournament_type: "league" })
      await loadData()
    } catch (error) {
      console.error("Error saving championship:", error)
    }
    setLoading(false)
  }

  const handleDeleteChampionship = async (id: number) => {
    if (confirm("Ви впевнені, що хочете видалити цей чемпіонат? Це також видалить всі команди, матчі та гравців.")) {
      try {
        await deleteChampionship(id)
        await loadData()
        if (id === currentChampionshipId && championships.length > 1) {
          const remainingChampionships = championships.filter((c) => c.id !== id)
          onChampionshipChange(remainingChampionships[0].id)
        }
      } catch (error) {
        console.error("Error deleting championship:", error)
      }
    }
  }

  // Team handlers
  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const teamData = {
        name: teamForm.name,
        logo: teamForm.logo,
        championship_id: currentChampionshipId,
      }

      if (editingTeam) {
        await updateTeam(editingTeam.id, teamData)
        setEditingTeam(null)
      } else {
        await addTeam(teamData)
      }
      setTeamForm({ name: "", logo: "" })
      await loadData()
    } catch (error) {
      console.error("Error saving team:", error)
      alert("Помилка при збереженні команди: " + error.message)
    }
    setLoading(false)
  }

  const handleDeleteTeam = async (id: number) => {
    if (confirm("Ви впевнені, що хочете видалити цю команду?")) {
      try {
        await deleteTeam(id)
        await loadData()
      } catch (error) {
        console.error("Error deleting team:", error)
      }
    }
  }

  // Match handlers
  const [selectedMatchForGoals, setSelectedMatchForGoals] = useState<Match | null>(null)
  const [matchGoals, setMatchGoals] = useState<MatchGoal[]>([])
  const [goalForm, setGoalForm] = useState({
    player_name: "",
    team_name: "",
    minute: "",
    goal_type: "regular" as "regular" | "penalty" | "own_goal",
  })

  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const matchData = {
        round: matchForm.round,
        date: matchForm.date,
        home_team: matchForm.home_team,
        away_team: matchForm.away_team,
        home_score: matchForm.home_score ? Number.parseInt(matchForm.home_score) : null,
        away_score: matchForm.away_score ? Number.parseInt(matchForm.away_score) : null,
        is_finished: matchForm.is_finished,
        championship_id: currentChampionshipId,
        match_time: matchForm.match_time,
        cup_stage: matchForm.cup_stage,
      }

      if (editingMatch) {
        await updateMatch(editingMatch.id, matchData)
        setEditingMatch(null)
      } else {
        await addMatch(matchData)
      }

      setMatchForm({
        round: 1,
        date: "",
        home_team: "",
        away_team: "",
        home_score: "",
        away_score: "",
        is_finished: false,
        match_time: "",
        cup_stage: "",
      })
      await loadData()
    } catch (error) {
      console.error("Error saving match:", error)
    }
    setLoading(false)
  }

  const handleDeleteMatch = async (id: number) => {
    if (confirm("Ви впевнені, що хочете видалити цей матч?")) {
      try {
        await deleteMatch(id)
        await loadData()
      } catch (error) {
        console.error("Error deleting match:", error)
      }
    }
  }

  // Match goals handlers
  const loadMatchGoals = async (matchId: number) => {
    try {
      const goals = await getMatchGoals(matchId)
      setMatchGoals(goals)
    } catch (error) {
      console.error("Error loading match goals:", error)
    }
  }
  // 🔎 Знаходить ID гравця за ім'ям
  // const getPlayerIdByName = (name: string) => {
  //   const player = players.find((p) => p.name === name)
  //   return player ? player.id : null
  // }

  // // 🔎 Знаходить ID команди за назвою
  // const getTeamIdByName = (name: string) => {
  //   const team = teams.find((t) => t.name === name)
  //   return team ? team.id : null
  // }

  const handleAddMatchGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMatchForGoals) return

    setLoading(true)
    try {
      await addMatchGoal({
        match_id: selectedMatchForGoals.id,
        player_name: goalForm.player_name,
        team_name: goalForm.team_name,
        minute: goalForm.minute ? Number.parseInt(goalForm.minute) : undefined,
        goal_type: goalForm.goal_type,
      })

      setGoalForm({
        player_name: "",
        team_name: selectedMatchForGoals.home_team,
        minute: "",
        goal_type: "regular",
      })
      await loadMatchGoals(selectedMatchForGoals.id)
    } catch (error) {
      console.error("Error adding match goal:", error)
    }
    setLoading(false)
  }

  const handleDeleteMatchGoal = async (goalId: number) => {
    if (confirm("Ви впевнені, що хочете видалити цей гол?")) {
      try {
        await deleteMatchGoal(goalId)
        if (selectedMatchForGoals) {
          await loadMatchGoals(selectedMatchForGoals.id)
        }
      } catch (error) {
        console.error("Error deleting match goal:", error)
      }
    }
  }

  // Player handlers
  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const playerData = { ...playerForm, championship_id: currentChampionshipId }
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, playerData)
        setEditingPlayer(null)
      } else {
        await addPlayer(playerData)
      }
      setPlayerForm({ name: "", team: "", goals: 0 })
      await loadData()
    } catch (error) {
      console.error("Error saving player:", error)
    }
    setLoading(false)
  }

  const handleDeletePlayer = async (id: number) => {
    if (confirm("Ви впевнені, що хочете видалити цього гравця?")) {
      try {
        await deletePlayer(id)
        await loadData()
      } catch (error) {
        console.error("Error deleting player:", error)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={currentChampionshipId.toString()}
            onValueChange={(value) => onChampionshipChange(Number.parseInt(value))}
          >
            <SelectTrigger className="w-48">
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
        <Button variant="outline" onClick={onLogout}>
          Вийти
        </Button>
      </div>

      <Tabs value="championships" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="championships">Чемпіонати</TabsTrigger>
          <TabsTrigger value="teams">Команди</TabsTrigger>
          <TabsTrigger value="matches">Матчі</TabsTrigger>
          <TabsTrigger value="players">Гравці</TabsTrigger>
        </TabsList>

        <TabsContent value="championships">
  <h2 className="text-xl font-bold mb-4">Чемпіонати</h2>

  {/* ✅ Форма додавання / редагування чемпіонату */}
  <form onSubmit={handleChampionshipSubmit} className="space-y-4 mb-6">
    <div>
      <Label>Назва</Label>
      <Input
        value={championshipForm.name}
        onChange={(e) => setChampionshipForm({ ...championshipForm, name: e.target.value })}
        required
      />
    </div>
    <div>
      <Label>Сезон</Label>
      <Input
        value={championshipForm.season}
        onChange={(e) => setChampionshipForm({ ...championshipForm, season: e.target.value })}
        required
      />
    </div>
    <div>
      <Label>Тип турніру</Label>
      <Select
        value={championshipForm.tournament_type}
        onValueChange={(value) => setChampionshipForm({ ...championshipForm, tournament_type: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Оберіть тип" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="league">Ліга</SelectItem>
          <SelectItem value="cup">Кубок</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={championshipForm.is_active}
          onChange={(e) => setChampionshipForm({ ...championshipForm, is_active: e.target.checked })}
        />
        Активний чемпіонат
      </Label>
    </div>
    <Button type="submit" disabled={loading}>
      {editingChampionship ? "Оновити" : "Додати"} чемпіонат
    </Button>
  </form>

  {/* ✅ Список чемпіонатів або повідомлення */}
  {championships.length > 0 ? (
    <ul className="space-y-2">
      {championships.map((champ) => (
        <li key={champ.id} className="border p-4 rounded">
          <div className="flex justify-between items-center">
            <div>
              <strong>{champ.name}</strong> ({champ.season})
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingChampionship(champ)}>
                Редагувати
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteChampionship(champ.id)}>
                Видалити
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-muted-foreground">Поки що немає чемпіонатів. Додайте перший за допомогою форми вище.</p>
  )}
</TabsContent>


        <TabsContent value="teams" className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
            <div className="text-sm text-blue-700">
              <strong>Поточний чемпіонат:</strong> {championships.find((c) => c.id === currentChampionshipId)?.name} (
              {championships.find((c) => c.id === currentChampionshipId)?.season})
            </div>
            <div className="text-xs text-blue-600 mt-1">
              ID чемпіонату: {currentChampionshipId} | Команди будуть додані до цього чемпіонату
            </div>
          </div>
          <form onSubmit={handleTeamSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team-name">Назва команди</Label>
                <Input
                  id="team-name"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="team-logo">URL логотипу</Label>
                <Input
                  id="team-logo"
                  value={teamForm.logo}
                  onChange={(e) => setTeamForm({ ...teamForm, logo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="team-championship">Чемпіонат</Label>
                <Select
                  value={currentChampionshipId.toString()}
                  onValueChange={(value) => {
                    // Championship is already set by the current selection
                  }}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Чемпіонат" />
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
            </div>
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              {editingTeam ? "Оновити" : "Додати"} команду
            </Button>
            {editingTeam && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingTeam(null)
                  setTeamForm({ name: "", logo: "" })
                }}
              >
                Скасувати
              </Button>
            )}
          </form>

          <div className="space-y-2">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <img src={team.logo || "/placeholder.svg?height=32&width=32"} alt={team.name} className="h-8 w-8" />
                  <span>{team.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingTeam(team)
                      setTeamForm({ name: team.name, logo: team.logo || "" })
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteTeam(team.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
            <div className="text-sm text-blue-700">
              <strong>Поточний чемпіонат:</strong> {championships.find((c) => c.id === currentChampionshipId)?.name} (
              {championships.find((c) => c.id === currentChampionshipId)?.season})
            </div>
            <div className="text-xs text-blue-600 mt-1">Матчі будуть додані до цього чемпіонату</div>
          </div>
          <form onSubmit={handleMatchSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="match-round">Тур</Label>
                <Input
                  id="match-round"
                  type="number"
                  value={matchForm.round || ""}
                  onChange={(e) => setMatchForm({ ...matchForm, round: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="match-date">Дата</Label>
                <Input
                  id="match-date"
                  type="date"
                  value={matchForm.date}
                  onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="match-time">Час матчу</Label>
                <Input
                  id="match-time"
                  type="time"
                  value={matchForm.match_time}
                  onChange={(e) => setMatchForm({ ...matchForm, match_time: e.target.value })}
                />
              </div>
              {currentChampionship?.tournament_type === "cup" && (
                <div>
                  <Label htmlFor="cup-stage">Стадія кубка</Label>
                  <Select
                    value={matchForm.cup_stage}
                    onValueChange={(value) => setMatchForm({ ...matchForm, cup_stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть стадію" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1/32 фіналу">1/32 фіналу</SelectItem>
                      <SelectItem value="1/16 фіналу">1/16 фіналу</SelectItem>
                      <SelectItem value="1/8 фіналу">1/8 фіналу</SelectItem>
                      <SelectItem value="1/4 фіналу">1/4 фіналу</SelectItem>
                      <SelectItem value="1/2 фіналу">1/2 фіналу</SelectItem>
                      <SelectItem value="Фінал">Фінал</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="home-team">Господарі</Label>
                <Select
                  value={matchForm.home_team}
                  onValueChange={(value) => setMatchForm({ ...matchForm, home_team: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть команду" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.name}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="away-team">Гості</Label>
                <Select
                  value={matchForm.away_team}
                  onValueChange={(value) => setMatchForm({ ...matchForm, away_team: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть команду" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.name}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="home-score">Голи господарів</Label>
                <Input
                  id="home-score"
                  type="number"
                  value={matchForm.home_score === "" ? "" : Number(matchForm.home_score)}
                  onChange={(e) => setMatchForm({ ...matchForm, home_score: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="away-score">Голи гостей</Label>
                <Input
                  id="away-score"
                  type="number"
                  value={matchForm.away_score === "" ? "" : Number(matchForm.away_score)}
                  onChange={(e) => setMatchForm({ ...matchForm, away_score: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is-finished"
                  checked={matchForm.is_finished}
                  onChange={(e) => setMatchForm({ ...matchForm, is_finished: e.target.checked })}
                />
                <Label htmlFor="is-finished">Завершено</Label>
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              {editingMatch ? "Оновити" : "Додати"} матч
            </Button>
            {editingMatch && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingMatch(null)
                  setMatchForm({
                    round: 1,
                    date: "",
                    home_team: "",
                    away_team: "",
                    home_score: "",
                    away_score: "",
                    is_finished: false,
                    match_time: "",
                    cup_stage: "",
                  })
                }}
              >
                Скасувати
              </Button>
            )}
          </form>

          <div className="space-y-2">
            {matches.map((match) => (
              <div key={match.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      Тур {match.round}: {match.home_team} - {match.away_team}
                    </div>
                    <div className="text-sm text-gray-600">
                      {match.date} |{match.is_finished ? ` ${match.home_score} - ${match.away_score}` : " Не зіграно"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {match.is_finished && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedMatchForGoals(match)
                          setGoalForm({
                            player_name: "",
                            team_name: match.home_team,
                            minute: "",
                            goal_type: "regular",
                          })
                          loadMatchGoals(match.id)
                        }}
                      >
                        Голи
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingMatch(match)
                        setMatchForm({
                          round: match.round,
                          date: match.date,
                          home_team: match.home_team,
                          away_team: match.away_team,
                          home_score: match.home_score?.toString() || "",
                          away_score: match.away_score?.toString() || "",
                          is_finished: match.is_finished,
                          match_time: match.match_time || "",
                          cup_stage: match.cup_stage || "",
                        })
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteMatch(match.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Match Goals Management */}
                {selectedMatchForGoals?.id === match.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t">
                    <h4 className="font-semibold mb-3">
                      Автори голів: {match.home_team} {match.home_score} - {match.away_score} {match.away_team}
                    </h4>

                    {/* Add Goal Form */}
                    <form onSubmit={handleAddMatchGoal} className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="goal-player-name">Ім'я гравця</Label>
                          <Input
                            id="goal-player-name"
                            value={goalForm.player_name}
                            onChange={(e) => setGoalForm({ ...goalForm, player_name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="goal-team-name">Команда</Label>
                          <Select
                            value={goalForm.team_name}
                            onValueChange={(value) => setGoalForm({ ...goalForm, team_name: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={match.home_team}>{match.home_team}</SelectItem>
                              <SelectItem value={match.away_team}>{match.away_team}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="goal-minute">Хвилина</Label>
                          <Input
                            id="goal-minute"
                            type="number"
                            min="1"
                            max="120"
                            value={goalForm.minute}
                            onChange={(e) => setGoalForm({ ...goalForm, minute: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="goal-type">Тип голу</Label>
                          <Select
                            value={goalForm.goal_type}
                            onValueChange={(value) =>
                              setGoalForm({ ...goalForm, goal_type: value as "regular" | "penalty" | "own_goal" })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">Звичайний</SelectItem>
                              <SelectItem value="penalty">Пенальті</SelectItem>
                              <SelectItem value="own_goal">Автогол</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={loading}>
                          <Plus className="h-4 w-4 mr-1" />
                          Додати гол
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedMatchForGoals(null)}
                        >
                          Закрити
                        </Button>
                      </div>
                    </form>

                    {/* Goals List */}
                    <div className="space-y-2">
                      {matchGoals.length === 0 ? (
                        <div className="text-center py-2 text-gray-500 text-sm">Немає доданих голів</div>
                      ) : (
                        matchGoals.map((goal) => (
                          <div key={goal.id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="text-sm">
                              <span className="font-medium">{goal.player_name}</span>
                              <span className="text-gray-600 ml-2">({goal.team_name})</span>
                              {goal.minute && <span className="text-blue-600 ml-2">{goal.minute}'</span>}
                              {goal.goal_type === "penalty" && <span className="text-orange-600 ml-1">(пен.)</span>}
                              {goal.goal_type === "own_goal" && <span className="text-red-600 ml-1">(автогол)</span>}
                            </div>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteMatchGoal(goal.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="players" className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
            <div className="text-sm text-blue-700">
              <strong>Поточний чемпіонат:</strong> {championships.find((c) => c.id === currentChampionshipId)?.name} (
              {championships.find((c) => c.id === currentChampionshipId)?.season})
            </div>
            <div className="text-xs text-blue-600 mt-1">Гравці будуть додані до цього чемпіонату</div>
          </div>
          <form onSubmit={handlePlayerSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="player-name">Ім'я гравця</Label>
                <Input
                  id="player-name"
                  value={playerForm.name}
                  onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="player-team">Команда</Label>
                <Select
                  value={playerForm.team}
                  onValueChange={(value) => setPlayerForm({ ...playerForm, team: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть команду" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.name}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="player-goals">Голи</Label>
                <Input
                  id="player-goals"
                  type="number"
                  value={playerForm.goals === 0 ? "" : playerForm.goals}
                  onChange={(e) => {
                    const val = e.target.value
                    setPlayerForm({ ...playerForm, goals: val === "" ? 0 : Number.parseInt(val) })
                  }}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              {editingPlayer ? "Оновити" : "Додати"} гравця
            </Button>
            {editingPlayer && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingPlayer(null)
                  setPlayerForm({ name: "", team: "", goals: 0 })
                }}
              >
                Скасувати
              </Button>
            )}
          </form>

          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{player.name}</div>
                  <div className="text-sm text-gray-600">
                    {player.team} | {player.goals} голів
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingPlayer(player)
                      setPlayerForm({ name: player.name, team: player.team, goals: player.goals })
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeletePlayer(player.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
