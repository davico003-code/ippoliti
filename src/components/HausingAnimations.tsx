'use client'

import { useEffect } from 'react'

export default function HausingAnimations() {
  useEffect(() => {
    // ── 1. Fade-in + slide-up on scroll (sections with data-anim="fade-up") ──
    const fadeEls = document.querySelectorAll<HTMLElement>('[data-anim="fade-up"]')
    fadeEls.forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(48px)'
      el.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)'
    })

    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          const delay = el.dataset.delay || '0'
          el.style.transitionDelay = `${delay}ms`
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          fadeObserver.unobserve(el)
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' })

    fadeEls.forEach(el => fadeObserver.observe(el))

    // ── 2. Stagger cards (data-anim="stagger-card") ──
    const staggerEls = document.querySelectorAll<HTMLElement>('[data-anim="stagger-card"]')
    staggerEls.forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(60px)'
      el.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)'
    })

    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          const idx = parseInt(el.dataset.index || '0', 10)
          el.style.transitionDelay = `${idx * 100}ms`
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          staggerObserver.unobserve(el)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })

    staggerEls.forEach(el => staggerObserver.observe(el))

    // ── 3. Count-up animation (data-anim="count-up") ──
    const countEls = document.querySelectorAll<HTMLElement>('[data-anim="count-up"]')
    countEls.forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'scale(0.5)'
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)'
    })

    const animateCount = (el: HTMLElement) => {
      const target = el.dataset.target || ''
      // Extract leading number
      const numMatch = target.match(/^(\d+)/)
      if (!numMatch) {
        el.textContent = target
        el.style.opacity = '1'
        el.style.transform = 'scale(1)'
        return
      }

      const endNum = parseInt(numMatch[1], 10)
      const suffix = target.slice(numMatch[1].length) // e.g. "+", "–4"
      const duration = 1200
      const startTime = performance.now()

      el.style.opacity = '1'
      el.style.transform = 'scale(1)'

      const tick = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = Math.round(eased * endNum)
        el.textContent = `${current}${suffix}`
        if (progress < 1) requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
    }

    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target as HTMLElement)
          countObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.5 })

    countEls.forEach(el => countObserver.observe(el))

    // ── 4. Hero parallax (data-anim="parallax") ──
    const heroSection = document.querySelector<HTMLElement>('[data-anim="parallax"]')
    let rafId = 0

    const handleScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!heroSection) return
        const scrollY = window.scrollY
        const heroH = heroSection.offsetHeight
        if (scrollY > heroH) return // past hero, skip

        const content = heroSection.querySelector<HTMLElement>('[data-parallax-content]')
        const glow = heroSection.querySelector<HTMLElement>('[data-parallax-glow]')

        if (content) {
          const y = scrollY * 0.35
          const opacity = 1 - (scrollY / heroH) * 1.2
          content.style.transform = `translateY(${y}px)`
          content.style.opacity = `${Math.max(0, opacity)}`
        }
        if (glow) {
          glow.style.transform = `translateX(-50%) translateY(${scrollY * 0.15}px)`
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // ── 5. Attr cards hover (data-anim="attr-card") ──
    const attrCards = document.querySelectorAll<HTMLElement>('[data-anim="attr-card"]')
    attrCards.forEach(el => {
      el.style.transition = 'transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease, background 0.3s ease'
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.02)'
        el.style.boxShadow = '0 8px 32px rgba(34,197,94,0.15)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.boxShadow = 'none'
      })
    })

    // Fade-in attr cards on scroll
    const attrFadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          const idx = parseInt(el.dataset.index || '0', 10)
          el.style.transitionDelay = `${idx * 80}ms`
          el.style.opacity = '1'
          el.style.transform = 'translateY(0) scale(1)'
          attrFadeObserver.unobserve(el)
        }
      })
    }, { threshold: 0.15 })

    attrCards.forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(30px) scale(0.98)'
      attrFadeObserver.observe(el)
    })

    return () => {
      fadeObserver.disconnect()
      staggerObserver.disconnect()
      countObserver.disconnect()
      attrFadeObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}
