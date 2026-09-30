// Site-wide FAQ (/faq). General questions only; each service page carries its
// own five FAQs (with their own FAQPage schema), so they aren't repeated here.
// Factual answers link a primary source. Agent-drafted: client to approve.
export interface SiteFaq {
  group: "Buying" | "Selling" | "Working with Marissa";
  question: string;
  answer: string; // HTML
}

export const siteFaqs: SiteFaq[] = [
  {
    group: "Buying",
    question: "Who pays the buyer's agent now?",
    answer:
      '<p>Since August 17, 2024, agents who use the MLS must have a written agreement with a buyer before touring homes. The agreement states what the agent will be paid and how, and commissions are fully negotiable. Sometimes a seller offers to cover part or all of it, and that can be part of the negotiation. Source: <a href="https://www.nar.realtor/the-facts/what-the-nar-settlement-means-for-home-buyers-and-sellers" rel="noopener">National Association of Realtors</a>.</p>',
  },
  {
    group: "Buying",
    question: "What closing costs should a buyer expect?",
    answer:
      '<p>Closing costs include lender fees, title and settlement charges, prepaid taxes and insurance, and more. Your lender lists them on your Loan Estimate early on, and on your Closing Disclosure at least three business days before closing. Source: <a href="https://www.consumerfinance.gov/ask-cfpb/what-is-a-closing-disclosure-en-1983/" rel="noopener">Consumer Financial Protection Bureau</a>.</p>',
  },
  {
    group: "Buying",
    question: "Do I need a Realtor for new construction?",
    answer:
      '<p>You aren\'t required to have one, but the builder\'s sales team represents the builder. Your own agent compares builders and communities, reviews the contract and advocates for you through the build. See <a href="/services/new-construction">buying new construction</a>.</p>',
  },
  {
    group: "Selling",
    question: "What is the Ohio Residential Property Disclosure Form?",
    answer:
      '<p>It\'s the state form most sellers of homes with one to four units must give buyers before they sign a purchase contract, covering what the seller knows about the property\'s condition. Source: <a href="https://com.ohio.gov/divisions-and-programs/real-estate-and-professional-licensing/salespersons-and-brokers/transaction-forms-and-disclosures/residential-property-disclosure-form" rel="noopener">Ohio Department of Commerce</a>.</p>',
  },
  {
    group: "Selling",
    question: "Can I buy and sell at the same time?",
    answer:
      '<p>Yes. The key is sequencing your sale, your purchase and your financing so they line up. We\'ll map out the options before you commit to either side. See <a href="/services/selling-your-home">selling your home</a>.</p>',
  },
  {
    group: "Working with Marissa",
    question: "How long does it take to close?",
    answer:
      "<p>Once you're under contract, closing commonly takes about a month or so, depending on the loan, appraisal and title work. Cash purchases can close faster. We'll set a realistic timeline at the start.</p>",
  },
  {
    group: "Working with Marissa",
    question: "What areas do you serve?",
    answer: "<p>Cuyahoga, Medina, Summit, Stark, Lake and Lorain counties across Greater Cleveland and Northeast Ohio.</p>",
  },
  {
    group: "Working with Marissa",
    question: "How do I get started?",
    answer: '<p>Book a free 30-minute call. We\'ll talk through your goals, your timeline and the next right step. <a href="/schedule">Book a call</a>.</p>',
  },
];
