'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  animation?: 'fade-in-up' | 'fade-in' | 'slide-in-left' | 'slide-in-right' | 'scale-in'
  delay?: number
  threshold?: number
}

export default function ScrollReveal({
  children,
  className = '',
  animation = 'fade-in-up',
  delay = 0,
  threshold = 0.15,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animationDelay = `${delay}ms`
          el.classList.remove('scroll-hidden')
          el.classList.add(`animate-${animation}`)
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [animation, delay, threshold])

  return (
    <div ref={ref} className={`scroll-hidden ${className}`}>
      {children}
    </div>
  )
}
