import { Info } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <Card className="border-burgundy/20 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Info className="h-5 w-5 text-burgundy" />
          <h3 className="text-xl font-semibold" style={{fontFamily: 'Playfair Display, serif'}}>
            Frequently Asked Questions
          </h3>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left hover:text-burgundy">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-charcoal/80">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
