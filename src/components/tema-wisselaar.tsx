'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function TemaWisselaar() {
  const { resolvedTheme, setTheme } = useTheme()
  const [gemonteer, setGemonteer] = useState(false)

  // The server cannot know the stored theme, so render a stable placeholder
  // until after hydration to avoid a mismatch. This is the standard
  // mount-detection idiom; there is no external system to synchronise with,
  // so a narrowly-scoped disable is correct here rather than a project-wide one.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setGemonteer(true), [])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Wissel tussen lig en donker"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {gemonteer && resolvedTheme === 'dark' ? (
        <Moon className="size-4" />
      ) : (
        <Sun className="size-4" />
      )}
    </Button>
  )
}
