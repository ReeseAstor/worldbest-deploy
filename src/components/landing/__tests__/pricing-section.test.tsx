import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { PricingSection } from '../pricing-section'

describe('PricingSection', () => {
  it('renders the section title', () => {
    render(<PricingSection />)
    
    expect(screen.getByText(/Simple, Transparent Pricing/i)).toBeInTheDocument()
  })

  it('renders the section description', () => {
    render(<PricingSection />)
    
    expect(screen.getByText(/Start free\. Upgrade when you're ready\./i)).toBeInTheDocument()
  })

  it('renders all 3 pricing tiers', () => {
    render(<PricingSection />)
    
    // Check tier names
    expect(screen.getByText('Spark')).toBeInTheDocument()
    expect(screen.getByText('Flame')).toBeInTheDocument()
    expect(screen.getByText('Inferno')).toBeInTheDocument()
  })

  it('renders tier descriptions', () => {
    render(<PricingSection />)
    
    expect(screen.getByText('Perfect for trying Ember')).toBeInTheDocument()
    expect(screen.getByText('Solo Author')).toBeInTheDocument()
    expect(screen.getByText('Pro Creator')).toBeInTheDocument()
  })

  it('renders the monthly/annual toggle', () => {
    render(<PricingSection />)
    
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Annual')).toBeInTheDocument()
    expect(screen.getByLabelText(/Toggle billing period/i)).toBeInTheDocument()
  })

  it('renders the Save 20% badge', () => {
    render(<PricingSection />)
    
    expect(screen.getByText(/Save 20%/i)).toBeInTheDocument()
  })

  it('toggle switches between monthly and annual pricing', async () => {
    const user = userEvent.setup()
    render(<PricingSection />)
    
    // By default, annual is selected - should show $23 for Flame
    expect(screen.getByText('$23')).toBeInTheDocument()
    
    // Click toggle to switch to monthly
    const toggle = screen.getByLabelText(/Toggle billing period/i)
    await user.click(toggle)
    
    // Should now show $39 for Flame
    expect(screen.getByText('$39')).toBeInTheDocument()
  })

  it('displays "Most Popular" badge on Flame tier', () => {
    render(<PricingSection />)
    
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('renders CTA buttons for each tier', () => {
    render(<PricingSection />)
    
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start Free Trial/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Contact Sales/i })).toBeInTheDocument()
  })

  it('displays annual savings when annual is selected', () => {
    render(<PricingSection />)
    
    // Should show annual savings
    expect(screen.getByText(/Save \$72\/year/i)).toBeInTheDocument()
    expect(screen.getByText(/Save \$192\/year/i)).toBeInTheDocument()
  })

  it('hides annual savings when monthly is selected', async () => {
    const user = userEvent.setup()
    render(<PricingSection />)
    
    // Click toggle to switch to monthly
    const toggle = screen.getByLabelText(/Toggle billing period/i)
    await user.click(toggle)
    
    // Annual savings should not be visible
    expect(screen.queryByText(/Save \$72\/year/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Save \$192\/year/i)).not.toBeInTheDocument()
  })

  it('renders the feature comparison table', () => {
    render(<PricingSection />)
    
    expect(screen.getByText('Compare Plans')).toBeInTheDocument()
    
    // Check some comparison features
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('AI Prompts')).toBeInTheDocument()
    expect(screen.getByText('Steam Levels')).toBeInTheDocument()
    expect(screen.getByText('Voice Fingerprinting')).toBeInTheDocument()
  })
})
