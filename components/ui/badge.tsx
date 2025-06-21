import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        cyberpunk:
          "border-matrix-500/50 bg-matrix-500/20 text-matrix-400 hover:bg-matrix-500/30 hover:border-matrix-500",
        "cyber-success":
          "border-green-500/50 bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:border-green-500",
        "cyber-warning":
          "border-orange-500/50 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 hover:border-orange-500",
        "cyber-error":
          "border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:border-red-500",
        "cyber-info":
          "border-blue-500/50 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500",
        "cyber-online":
          "border-matrix-500/50 bg-matrix-500/20 text-matrix-400 animate-pulse",
        "cyber-offline":
          "border-gray-500/50 bg-gray-500/20 text-gray-400",
        "cyber-solid":
          "border-matrix-500 bg-matrix-500 text-black hover:bg-matrix-400",
      },
    },
    defaultVariants: {
      variant: "cyberpunk",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 