'use client';

import { motion } from 'framer-motion';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, Mail } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How does the AI writing assistant work?',
    answer:
      'Ember uses three specialized AI personas to help you write. Muse assists with drafting new content, generating ideas, and overcoming writer\'s block. Editor helps polish your prose, fix grammar, and improve flow. Coach provides structural guidance on pacing, character arcs, and story beats. Each persona is trained specifically for romantasy and steamy romance genres.',
  },
  {
    question: 'Can I export my work?',
    answer:
      'Absolutely! On Solo (Flame) and Pro (Inferno) tiers, you can export your manuscripts in ePub, PDF, and JSON formats. Our exports are specifically formatted for Amazon KDP upload, making self-publishing seamless. Free tier users can copy their text, but direct export features require an upgrade.',
  },
  {
    question: 'Is my writing data secure?',
    answer:
      'Security is our top priority. All your manuscripts and personal data are protected with end-to-end encryption. Our infrastructure is SOC 2 compliant, and we never use your writing to train AI models without explicit consent. Your stories remain yours—always.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes, you can cancel anytime with no questions asked. There are no long-term contracts or cancellation fees. When you cancel, you\'ll retain access to all premium features until the end of your current billing period. Your projects and data remain accessible even after downgrading.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 30-day money-back guarantee, no questions asked. If Ember isn\'t the right fit for your writing workflow, simply contact our support team within 30 days of purchase for a full refund. We want you to be completely satisfied with your investment.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through Stripe\'s secure payment processing. We also support Apple Pay and Google Pay for quick checkout. All transactions are encrypted and PCI-compliant.',
  },
  {
    question: 'Can I collaborate with other writers?',
    answer:
      'Yes! Our Pro (Inferno) tier includes real-time collaboration features. You can invite up to 5 team members to work on projects together with real-time co-editing, inline comments, and full change tracking. Perfect for writing partners, editors, or author teams.',
  },
  {
    question: 'How does billing work?',
    answer:
      'You can choose between monthly or annual billing. Annual plans save you 20% compared to monthly pricing. Billing is automatic and occurs on the same date each month or year. You can switch between plans or cancel anytime from your account settings.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about Ember
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Accordion.Item
                  value={`item-${index}`}
                  className="bg-background rounded-lg border overflow-hidden"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="flex w-full items-center justify-between px-6 py-4 text-left font-medium hover:bg-muted/50 transition-colors group">
                      <span className="pr-4">{faq.question}</span>
                      <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="px-6 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </motion.div>
            ))}
          </Accordion.Root>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a
            href="mailto:support@ember.app"
            className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-600 font-medium transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contact us
          </a>
        </motion.div>
      </div>
    </section>
  );
}
