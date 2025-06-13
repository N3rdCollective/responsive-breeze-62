import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: [
          // Light mode: strong blue with white text for better contrast
          "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
          // Dark mode: keep existing primary colors
          "dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
        ],
        destructive: [
          // Light mode: strong red with white text
          "bg-red-600 text-white hover:bg-red-700 shadow-sm",
          // Dark mode
          "dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90"
        ],
        outline: [
          // Light mode: gray border with dark text for better readability
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm",
          // Dark mode
          "dark:border-input dark:bg-background dark:hover:bg-accent dark:hover:text-accent-foreground"
        ],
        secondary: [
          // Light mode: light gray background with dark text
          "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm",
          // Dark mode
          "dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80"
        ],
        ghost: [
          // Light mode: transparent with gray text, better hover state
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          // Dark mode
          "dark:hover:bg-accent dark:hover:text-accent-foreground"
        ],
        link: [
          // Light mode: blue text for better visibility
          "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
          // Dark mode
          "dark:text-primary dark:hover:underline"
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
