import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { HeroSection } from '../hero-section'

describe('HeroSection', () => {
  it('renders the headline text', () => {
    render(<HeroSection />)
    
    expect(screen.getByText(/Finish Your Novel/i)).toBeInTheDocument()
    expect(screen.getByText(/3x Faster/i)).toBeInTheDocument()
    expect(screen.getByText(/with AI/i)).toBeInTheDocument()
  })

  it('renders the subheadline description', () => {
    render(<HeroSection />)
    
    expect(
      screen.getByText(/The only AI writing platform built for steamy romantasy/i)
    ).toBeInTheDocument()
  })

  it('renders both CTA buttons', () => {
    render(<HeroSection />)
    
    // Primary CTA
    expect(screen.getByRole('button', { name: /Start Writing Free/i })).toBeInTheDocument()
    
    // Secondary CTA
    expect(screen.getByRole('button', { name: /Watch Demo/i })).toBeInTheDocument()
  })

  it('renders the social proof section', () => {
    render(<HeroSection />)
    
    expect(screen.getByText(/Join 10,000\+ writers/i)).toBeInTheDocument()
  })

  it('renders the trust badges with rating', () => {
    render(<HeroSection />)
    
    expect(screen.getByText(/4\.9\/5 from 500\+ reviews/i)).toBeInTheDocument()
  })

  it('renders the hero visual section', () => {
    render(<HeroSection />)
    
    expect(screen.getByText(/AI-Powered Writing/i)).toBeInTheDocument()
    expect(screen.getByText(/Built for Romance Authors/i)).toBeInTheDocument()
  })
})
