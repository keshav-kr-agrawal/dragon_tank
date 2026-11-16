'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface BezelDialProps {
  value: number
  min?: number
  max?: number
  label: string
  sublabel?: string
  unit?: string
  size?: number
}

export default function BezelDial({
  value,
  min = 0,
  max = 100,
  label,
  sublabel,
  unit = '%',
  size = 140
}: BezelDialProps) {
  const radius = 54
  const strokeWidth = 3.5
  const circumference = 2 * Math.PI * radius
  
  // Clamp value between min and max
  const clampedValue = Math.min(Math.max(value, min), max)
  const percent = max > min ? (clampedValue - min) / (max - min) : 0
  
  // 240 degree gauge arc
  const arcLength = circumference * 0.72
  const strokeDashoffset = arcLength - arcLength * percent

  const isPositive = value > 0
  const isHealthy = value >= 40
  const isWarning = value > 0 && value < 40
  const isCritical = value <= 0

  const strokeColor = isHealthy
    ? '#059669' // Emerald
    : isWarning
    ? '#D97706' // Amber
    : '#E11D48' // Rose

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 140 140"
          className="transform -rotate-[126deg]"
        >
          {/* Hairline Ticks Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(120, 113, 108, 0.18)"
            strokeWidth={strokeWidth}
            strokeDasharray="2.5 4"
            strokeLinecap="round"
          />

          {/* Sweeping Value Arc */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Display Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center">
            <span
              className={`font-display text-3xl md:text-4xl font-semibold tracking-tight ${
                isHealthy
                  ? 'text-emerald-950'
                  : isWarning
                  ? 'text-amber-950'
                  : 'text-rose-950'
              }`}
            >
              {value}
            </span>
            <span className="font-mono-num text-xs font-medium text-stone-500 ml-0.5">
              {unit}
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-wide uppercase text-stone-500 mt-0.5">
            {sublabel || (isHealthy ? 'Healthy' : isWarning ? 'Modest' : 'Deficit')}
          </span>
        </div>
      </div>

      <span className="text-xs font-semibold text-stone-700 tracking-tight mt-1 text-center">
        {label}
      </span>
    </div>
  )
}
