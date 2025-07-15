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
} from "@/lib/database"
import type { Championship, Team, Match, Player } from "@/lib/supabase"

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
  const [championshipForm, setChampionshipForm] = useState({ name: "", season: "", is_active: false })
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
  })
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)

  // Player form state
  const [playerForm, setPlayerForm] = useState({ name: "", team: "", goals: 0 })
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

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
      setChampionshipForm({ name: "", season: "", is_active: false })
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

      <Tabs defaultValue="championships" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="championships">Чемпіонати</TabsTrigger>
          <TabsTrigger value="teams">Команди</TabsTrigger>
          <TabsTrigger value="matches">Матчі</TabsTrigger>
          <TabsTrigger value="players">Гравці</TabsTrigger>
        </TabsList>

        <TabsContent value="championships" className="space-y-4">
          <form onSubmit={handleChampionshipSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="championship-name">Назва чемпіонату</Label>
                <Input
                  id="championship-name"
                  value={championshipForm.name}
                  onChange={(e) => setChampionshipForm({ ...championshipForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="championship-season">Сезон</Label>
                <Input
                  id="championship-season"
                  value={championshipForm.season}
                  onChange={(e) => setChampionshipForm({ ...championshipForm, season: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={championshipForm.is_active}
                  onChange={(e) => setChampionshipForm({ ...championshipForm, is_active: e.target.checked })}
                />
                <Label htmlFor="is-active">Активний</Label>
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              {editingChampionship ? "Оновити" : "Додати"} чемпіонат
            </Button>
            {editingChampionship && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingChampionship(null)
                  setChampionshipForm({ name: "", season: "", is_active: false })
                }}
              >
                Скасувати
              </Button>
            )}
          </form>

          <div className="space-y-2">
            {championships.map((championship) => (
              <div key={championship.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{championship.name}</div>
                  <div className="text-sm text-gray-600">
                    Сезон: {championship.season} | {championship.is_active ? "Активний" : "Неактивний"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingChampionship(championship)
                      setChampionshipForm({
                        name: championship.name,
                        season: championship.season,
                        is_active: championship.is_active,
                      })
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteChampionship(championship.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
  onChange={(e) =>
    setMatchForm({ ...matchForm, round: Number(e.target.value) || 0 })
  }
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
                  })
                }}
              >
                Скасувати
              </Button>
            )}
          </form>

          <div className="space-y-2">
            {matches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">
                    Тур {match.round}: {match.home_team} - {match.away_team}
                  </div>
                  <div className="text-sm text-gray-600">
                    {match.date} |{match.is_finished ? ` ${match.home_score} - ${match.away_score}` : " Не зіграно"}
                  </div>
                </div>
                <div className="flex gap-2">
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
    setPlayerForm({ ...playerForm, goals: val === "" ? 0 : parseInt(val) })
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
