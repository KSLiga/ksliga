"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Edit } from "lucide-react"
import { getMatchGoals, addMatchGoal, deleteMatchGoal } from "@/lib/database"
import type { Match, MatchGoal, Team } from "@/lib/supabase"

interface MatchGoalsManagerProps {
  match: Match
  teams: Team[]
  onGoalsUpdated: () => void
}

export function MatchGoalsManager({ match, teams, onGoalsUpdated }: MatchGoalsManagerProps) {
  const [goals, setGoals] = useState<MatchGoal[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [goalForm, setGoalForm] = useState({
    player_name: "",
    team_name: match.home_team,
    minute: "",
    goal_type: "regular" as "regular" | "penalty" | "own_goal",
  })

  useEffect(() => {
    if (isOpen) {
      loadGoals()
    }
  }, [isOpen, match.id])

  const loadGoals = async () => {
    try {
      const goalsData = await getMatchGoals(match.id)
      setGoals(goalsData)
    } catch (error) {
      console.error("Error loading goals:", error)
    }
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addMatchGoal({
        match_id: match.id,
        player_name: goalForm.player_name,
        team_name: goalForm.team_name,
        minute: goalForm.minute ? Number.parseInt(goalForm.minute) : undefined,
        goal_type: goalForm.goal_type,
      })
      setGoalForm({
        player_name: "",
        team_name: match.home_team,
        minute: "",
        goal_type: "regular",
      })
      await loadGoals()
      onGoalsUpdated()
    } catch (error) {
      console.error("Error adding goal:", error)
    }
    setLoading(false)
  }

  const handleDeleteGoal = async (goalId: number) => {
    if (confirm("Ви впевнені, що хочете видалити цей гол?")) {
      try {
        await deleteMatchGoal(goalId)
        await loadGoals()
        onGoalsUpdated()
      } catch (error) {
        console.error("Error deleting goal:", error)
      }
    }
  }

  const getGoalTypeText = (type: string) => {
    switch (type) {
      case "penalty":
        return " (пен.)"
      case "own_goal":
        return " (автогол)"
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4 mr-1" />
          Автори голів
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Автори голів: {match.home_team} {match.home_score} - {match.away_score} {match.away_team}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Goal Form */}
          <form onSubmit={handleAddGoal} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="player-name">Ім'я гравця</Label>
                <Input
                  id="player-name"
                  value={goalForm.player_name}
                  onChange={(e) => setGoalForm({ ...goalForm, player_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="team-name">Команда</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minute">Хвилина</Label>
                <Input
                  id="minute"
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
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Додати гол
            </Button>
          </form>

          {/* Goals List */}
          <div className="space-y-2">
            <h4 className="font-semibold">Список голів:</h4>
            {goals.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Немає доданих голів</div>
            ) : (
              <div className="space-y-2">
                {goals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{goal.player_name}</span>
                      <span className="text-gray-600 ml-2">({goal.team_name})</span>
                      {goal.minute && <span className="text-blue-600 ml-2">{goal.minute}'</span>}
                      <span className="text-orange-600">{getGoalTypeText(goal.goal_type)}</span>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteGoal(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
