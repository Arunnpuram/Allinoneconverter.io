"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const [isDark, setIsDark] = useState(false)

  // Initialize theme based on localStorage or system preference
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      // Check localStorage first
      const savedTheme = localStorage.getItem("theme")

      if (savedTheme) {
        setIsDark(savedTheme === "dark")
        document.documentElement.classList.toggle("dark", savedTheme === "dark")
      } else {
        // Fall back to system preference
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        setIsDark(systemPrefersDark)
        document.documentElement.classList.toggle("dark", systemPrefersDark)
      }
    }
  }, [])

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)

    // Update DOM
    document.documentElement.classList.toggle("dark", newTheme)

    // Save to localStorage
    localStorage.setItem("theme", newTheme ? "dark" : "light")
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
    </Button>
  )
}
