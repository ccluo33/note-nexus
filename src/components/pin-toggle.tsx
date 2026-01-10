"use client"

import * as React from "react"
import { Pin, PinOff } from "lucide-react"
import { useTranslations } from 'next-intl'

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";

export function PinToggle() {
  const t = useTranslations();
  const [isPin, setIsPin] = useState(false)

  useEffect(() => {
    function loadPinState() {
      const pin = localStorage.getItem('pin')
      setIsPin(pin === 'true')
    }
    loadPinState()
  }, [])

  function togglePin() {
    const newPinState = !isPin
    setIsPin(newPinState)
    localStorage.setItem('pin', newPinState.toString())
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={togglePin}
      title={isPin ? t('common.unpin') : t('common.pin')}
    >
      {isPin ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
    </Button>
  )
}
