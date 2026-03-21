import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { FeaturesSection } from '../features-section'

describe('FeaturesSection', () => {
  it('renders the section title', () => {
    render(<FeaturesSection />)
    
    expect(
      screen.getByText(/Everything You Need to Write Your Bestseller/i)
    ).toBeInTheDocument()
  })

  it('renders the section description', () => {
    render(<FeaturesSection />)
    
    expect(
      screen.getByText(/Powerful tools designed specifically for romance and romantasy authors/i)
    ).toBeInTheDocument()
  })

  it('renders all 6 feature cards', () => {
    render(<FeaturesSection />)
    
    // Check all feature titles are rendered
    expect(screen.getByText('AI Writing Assistant')).toBeInTheDocument()
    expect(screen.getByText('Story Bible Management')).toBeInTheDocument()
    expect(screen.getByText('Character Development')).toBeInTheDocument()
    expect(screen.getByText('Real-time Collaboration')).toBeInTheDocument()
    expect(screen.getByText('Export to ePub/PDF')).toBeInTheDocument()
    expect(screen.getByText('Progress Analytics')).toBeInTheDocument()
  })

  it('renders feature descriptions', () => {
    render(<FeaturesSection />)
    
    expect(
      screen.getByText(/Three AI personas — Muse, Editor, Coach/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Track characters, locations, timelines/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Rich character profiles with relationship arcs/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Co-write with your team/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/One-click export formatted for Amazon KDP/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Track word counts, writing streaks/i)
    ).toBeInTheDocument()
  })

  it('each feature card has title and description', () => {
    render(<FeaturesSection />)
    
    // Get all card titles
    const cardTitles = screen.getAllByTestId('card-title')
    expect(cardTitles).toHaveLength(6)
    
    // Get all card contents (descriptions)
    const cardContents = screen.getAllByTestId('card-content')
    expect(cardContents).toHaveLength(6)
  })
})
