interface TeamDisplayProps {
  teamName: string
  teamLogo?: string
  size?: "sm" | "md" | "lg"
  showName?: boolean
  className?: string
}

export function TeamDisplay({ teamName, teamLogo, size = "md", showName = true, className = "" }: TeamDisplayProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={teamLogo || "/placeholder.svg?height=32&width=32"}
        alt={`${teamName} logo`}
        className={`object-contain ${sizeClasses[size]}`}
      />
      {showName && <span className={`font-medium ${textSizeClasses[size]}`}>{teamName}</span>}
    </div>
  )
}
