import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';

/**
 * FAQ Section Component with Schema Markup
 * 
 * Provides answers to common questions about Made to Hike
 * Includes FAQPage structured data for rich snippets in search results
 */

const faqs = [
  {
    question: "What is Made to Hike?",
    answer: "Made to Hike is Europe's first guide-centric marketplace that connects certified IFMGA and IML mountain guides with adventure seekers. We prioritize authentic experiences, verified credentials, and fair compensation for professional guides across the Alps, Dolomites, Pyrenees, and Scottish Highlands."
  },
  {
    question: "When will Made to Hike launch?",
    answer: "We're currently in the final stages of development and working with our founding guides to ensure the platform meets the highest standards. Join our waitlist to be notified as soon as we launch and receive exclusive early access."
  },
  {
    question: "How are mountain guides verified?",
    answer: "Every guide on Made to Hike undergoes thorough verification. We check their IFMGA, IML, or other recognized certifications, verify their professional insurance, and review their mountain leadership qualifications. Only certified professionals with proven track records are accepted."
  },
  {
    question: "What certifications do your guides have?",
    answer: "Our guides hold internationally recognized certifications including IFMGA (International Federation of Mountain Guides Associations), IML (International Mountain Leader), UIMLA, AEGM, national certifications like UK Mountain Leader, and specialized qualifications in wilderness first aid, avalanche safety, and technical climbing."
  },
  {
    question: "Which European mountain regions are covered?",
    answer: "Made to Hike features certified guides across major European mountain ranges including the Swiss, French, and Austrian Alps, Italian Dolomites, Spanish and French Pyrenees, Scottish Highlands, Norwegian mountains, and many other regions. Our network is continuously growing."
  },
  {
    question: "How does Made to Hike differ from other platforms?",
    answer: "Unlike general tour platforms, Made to Hike is built by a guide, for guides. We focus exclusively on professional mountain guiding, ensure fair compensation without excessive commissions, verify every guide's credentials, and prioritize authentic, safe mountain experiences over mass tourism."
  },
  {
    question: "What is IFMGA certification?",
    answer: "IFMGA (International Federation of Mountain Guides Associations) is the highest internationally recognized qualification for mountain guides. It requires years of training in rock climbing, alpine mountaineering, and ski mountaineering, ensuring guides can safely lead clients in any mountain environment."
  },
  {
    question: "Is Made to Hike safe for solo travelers?",
    answer: "Absolutely. All our guides are professionally certified, insured, and experienced in leading solo travelers and small groups. We prioritize safety through verified credentials, professional standards, and transparent communication between guides and clients."
  }
];

export function FAQSection() {
  // Create FAQPage structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <section className="py-20 px-4 bg-stone-50 dark:bg-charcoal/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal dark:text-cream mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Made to Hike
            </p>
          </div>

          <Card className="p-6 bg-white dark:bg-charcoal">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </section>
    </>
  );
}
