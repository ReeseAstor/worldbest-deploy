import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { FAQSection } from '../faq-section'

describe('FAQSection', () => {
  it('renders the section title', () => {
    render(<FAQSection />)
    
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument()
  })

  it('renders the section description', () => {
    render(<FAQSection />)
    
    expect(
      screen.getByText(/Everything you need to know about Ember/i)
    ).toBeInTheDocument()
  })

  it('renders all FAQ questions', () => {
    render(<FAQSection />)
    
    expect(screen.getByText(/How does the AI writing assistant work\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Can I export my work\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Is my writing data secure\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Can I cancel my subscription anytime\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Do you offer refunds\?/i)).toBeInTheDocument()
    expect(screen.getByText(/What payment methods do you accept\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Can I collaborate with other writers\?/i)).toBeInTheDocument()
    expect(screen.getByText(/How does billing work\?/i)).toBeInTheDocument()
  })

  it('renders all 8 FAQ items', () => {
    render(<FAQSection />)
    
    // Find all accordion triggers (questions)
    const accordionTriggers = screen.getAllByRole('button')
    // Filter to only FAQ accordion triggers (exclude contact link)
    const faqTriggers = accordionTriggers.filter(trigger => 
      trigger.getAttribute('data-state') === 'closed' || 
      trigger.getAttribute('data-state') === 'open'
    )
    
    expect(faqTriggers.length).toBeGreaterThanOrEqual(8)
  })

  it('accordion expand/collapse works - click to expand shows answer', async () => {
    const user = userEvent.setup()
    render(<FAQSection />)
    
    // Find the first FAQ question
    const firstQuestion = screen.getByText(/How does the AI writing assistant work\?/i)
    const accordionTrigger = firstQuestion.closest('button')
    
    expect(accordionTrigger).toBeInTheDocument()
    
    // Click to expand
    await user.click(accordionTrigger!)
    
    // The answer should be visible
    expect(
      screen.getByText(/Ember uses three specialized AI personas/i)
    ).toBeInTheDocument()
  })

  it('clicking different FAQ item expands that item', async () => {
    const user = userEvent.setup()
    render(<FAQSection />)
    
    // Click on the export question
    const exportQuestion = screen.getByText(/Can I export my work\?/i)
    const accordionTrigger = exportQuestion.closest('button')
    
    await user.click(accordionTrigger!)
    
    // The export answer should be visible
    expect(
      screen.getByText(/you can export your manuscripts in ePub, PDF, and JSON formats/i)
    ).toBeInTheDocument()
  })

  it('renders the contact CTA', () => {
    render(<FAQSection />)
    
    expect(screen.getByText(/Still have questions\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Contact us/i)).toBeInTheDocument()
  })

  it('contact link has correct email href', () => {
    render(<FAQSection />)
    
    const contactLink = screen.getByRole('link', { name: /Contact us/i })
    expect(contactLink).toHaveAttribute('href', 'mailto:support@ember.app')
  })

  it('security FAQ mentions encryption and SOC 2', async () => {
    const user = userEvent.setup()
    render(<FAQSection />)
    
    const securityQuestion = screen.getByText(/Is my writing data secure\?/i)
    const accordionTrigger = securityQuestion.closest('button')
    
    await user.click(accordionTrigger!)
    
    expect(screen.getByText(/end-to-end encryption/i)).toBeInTheDocument()
    expect(screen.getByText(/SOC 2 compliant/i)).toBeInTheDocument()
  })
})
