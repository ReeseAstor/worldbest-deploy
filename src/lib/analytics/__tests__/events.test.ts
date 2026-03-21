import { describe, it, expect } from 'vitest'
import { ANALYTICS_EVENTS, AnalyticsEventName } from '../events'

describe('Analytics Events', () => {
  describe('Event Constants', () => {
    it('all event constants are defined', () => {
      // Landing Page events
      expect(ANALYTICS_EVENTS.LANDING_PAGE_VIEW).toBeDefined()
      expect(ANALYTICS_EVENTS.HERO_CTA_CLICK).toBeDefined()
      expect(ANALYTICS_EVENTS.DEMO_VIDEO_PLAY).toBeDefined()
      expect(ANALYTICS_EVENTS.PRICING_PLAN_SELECTED).toBeDefined()
      expect(ANALYTICS_EVENTS.FAQ_QUESTION_EXPANDED).toBeDefined()

      // Auth events
      expect(ANALYTICS_EVENTS.SIGNUP_STARTED).toBeDefined()
      expect(ANALYTICS_EVENTS.SIGNUP_COMPLETED).toBeDefined()
      expect(ANALYTICS_EVENTS.LOGIN_COMPLETED).toBeDefined()
      expect(ANALYTICS_EVENTS.SOCIAL_LOGIN_CLICK).toBeDefined()

      // Onboarding events
      expect(ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED).toBeDefined()
      expect(ANALYTICS_EVENTS.ONBOARDING_COMPLETED).toBeDefined()
      expect(ANALYTICS_EVENTS.ONBOARDING_SKIPPED).toBeDefined()

      // Projects events
      expect(ANALYTICS_EVENTS.PROJECT_CREATED).toBeDefined()
      expect(ANALYTICS_EVENTS.CHAPTER_CREATED).toBeDefined()
      expect(ANALYTICS_EVENTS.WRITING_SESSION_START).toBeDefined()
      expect(ANALYTICS_EVENTS.WORDS_WRITTEN).toBeDefined()

      // Billing events
      expect(ANALYTICS_EVENTS.UPGRADE_CTA_CLICK).toBeDefined()
      expect(ANALYTICS_EVENTS.CHECKOUT_STARTED).toBeDefined()
      expect(ANALYTICS_EVENTS.SUBSCRIPTION_CREATED).toBeDefined()
    })

    it('all event constants are strings', () => {
      Object.values(ANALYTICS_EVENTS).forEach((eventName) => {
        expect(typeof eventName).toBe('string')
      })
    })

    it('no duplicate event names', () => {
      const eventNames = Object.values(ANALYTICS_EVENTS)
      const uniqueNames = new Set(eventNames)
      
      expect(eventNames.length).toBe(uniqueNames.size)
    })

    it('event names follow snake_case convention', () => {
      const snakeCaseRegex = /^[a-z]+(_[a-z]+)*$/
      
      Object.values(ANALYTICS_EVENTS).forEach((eventName) => {
        expect(eventName).toMatch(snakeCaseRegex)
      })
    })
  })

  describe('Event Categories', () => {
    it('has landing page events', () => {
      const landingEvents = [
        ANALYTICS_EVENTS.LANDING_PAGE_VIEW,
        ANALYTICS_EVENTS.HERO_CTA_CLICK,
        ANALYTICS_EVENTS.DEMO_VIDEO_PLAY,
        ANALYTICS_EVENTS.PRICING_PLAN_SELECTED,
        ANALYTICS_EVENTS.FAQ_QUESTION_EXPANDED,
      ]
      
      expect(landingEvents).toHaveLength(5)
      landingEvents.forEach((event) => {
        expect(event).toBeTruthy()
      })
    })

    it('has auth events', () => {
      const authEvents = [
        ANALYTICS_EVENTS.SIGNUP_STARTED,
        ANALYTICS_EVENTS.SIGNUP_COMPLETED,
        ANALYTICS_EVENTS.LOGIN_COMPLETED,
        ANALYTICS_EVENTS.SOCIAL_LOGIN_CLICK,
      ]
      
      expect(authEvents).toHaveLength(4)
      authEvents.forEach((event) => {
        expect(event).toBeTruthy()
      })
    })

    it('has onboarding events', () => {
      const onboardingEvents = [
        ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED,
        ANALYTICS_EVENTS.ONBOARDING_COMPLETED,
        ANALYTICS_EVENTS.ONBOARDING_SKIPPED,
      ]
      
      expect(onboardingEvents).toHaveLength(3)
      onboardingEvents.forEach((event) => {
        expect(event).toBeTruthy()
      })
    })

    it('has project events', () => {
      const projectEvents = [
        ANALYTICS_EVENTS.PROJECT_CREATED,
        ANALYTICS_EVENTS.CHAPTER_CREATED,
        ANALYTICS_EVENTS.WRITING_SESSION_START,
        ANALYTICS_EVENTS.WORDS_WRITTEN,
      ]
      
      expect(projectEvents).toHaveLength(4)
      projectEvents.forEach((event) => {
        expect(event).toBeTruthy()
      })
    })

    it('has billing events', () => {
      const billingEvents = [
        ANALYTICS_EVENTS.UPGRADE_CTA_CLICK,
        ANALYTICS_EVENTS.CHECKOUT_STARTED,
        ANALYTICS_EVENTS.SUBSCRIPTION_CREATED,
      ]
      
      expect(billingEvents).toHaveLength(3)
      billingEvents.forEach((event) => {
        expect(event).toBeTruthy()
      })
    })
  })

  describe('Type Safety', () => {
    it('AnalyticsEventName type covers all events', () => {
      // This test verifies at compile time that all event values are assignable to AnalyticsEventName
      const eventValues: AnalyticsEventName[] = Object.values(ANALYTICS_EVENTS)
      
      expect(eventValues.length).toBeGreaterThan(0)
    })
  })
})
