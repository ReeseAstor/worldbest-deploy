import { describe, it, expect } from 'vitest';
import { render } from '@/test/test-utils';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';

expect.extend(matchers);

// Import components to test
import { HeroSection } from '@/components/landing/hero-section';
import { FAQSection } from '@/components/landing/faq-section';
import { FeaturesSection } from '@/components/landing/features-section';

describe('Accessibility', () => {
  describe('Landing Page Sections', () => {
    it('HeroSection has no accessibility violations', async () => {
      const { container } = render(<HeroSection />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('FeaturesSection has no accessibility violations', async () => {
      const { container } = render(<FeaturesSection />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('FAQSection has no accessibility violations', async () => {
      const { container } = render(<FAQSection />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('General Accessibility Standards', () => {
    it('buttons have accessible names', () => {
      const { container } = render(<HeroSection />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        const hasText = button.textContent?.trim();
        const hasAriaLabel = button.getAttribute('aria-label');
        const hasAriaLabelledBy = button.getAttribute('aria-labelledby');
        const hasTitle = button.getAttribute('title');
        expect(
          hasText || hasAriaLabel || hasAriaLabelledBy || hasTitle,
          `Button should have accessible name: ${button.outerHTML.slice(0, 100)}`
        ).toBeTruthy();
      });
    });

    it('images have alt text', () => {
      const { container } = render(<HeroSection />);
      const images = container.querySelectorAll('img');
      images.forEach((img) => {
        expect(
          img.getAttribute('alt') !== null,
          `Image should have alt attribute: ${img.outerHTML.slice(0, 100)}`
        ).toBe(true);
      });
    });

    it('heading hierarchy is correct', () => {
      const { container } = render(<HeroSection />);
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length > 0) {
        // First heading should be h1 or h2
        const firstLevel = parseInt(headings[0].tagName.replace('H', ''));
        expect(firstLevel).toBeLessThanOrEqual(2);
      }
    });
  });
});
