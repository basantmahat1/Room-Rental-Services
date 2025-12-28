import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react'; // 'npm install lucide-react' garnu hola or use standard icons

const faqData = [
  {
    question: "How can I book a room?",
    answer: "You can search for rooms using our search bar, click on your desired room, and then contact the owner or book directly online."
  },
  {
    question: "Are the room listings verified?",
    answer: "Yes, all room listings are verified by our team for authenticity and safety."
  },
  {
    question: "Can I post my room for rent?",
    answer: "Absolutely! Click the 'Post Your Room' button in the header and follow the steps to list your room."
  },
  {
    question: "How do I contact the room owner?",
    answer: "Each listing has a contact button. You can message the owner directly via our platform."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept multiple payment methods including bank transfer, mobile wallets, and online payment gateways."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="max-w-4xl mx-auto my-14 px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold tracking-tight text-[var(--color-primary)] mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Everything you need to know about booking and listing rooms on our platform.
        </p>
      </div>

      <div className="space-y-2">
        {faqData.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`group border-2 rounded-2xl transition-all duration-300 ${
                isOpen 
                ? "border-[var(--color-secondary)] bg-white shadow-md" 
                : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
              }`}
            >
              <button
                className="w-full text-left flex justify-between items-center p-5 sm:p-6 focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className={`text-lg font-semibold transition-colors duration-300 ${
                  isOpen ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]"
                }`}>
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-6 h-6 transition-transform duration-300 text-gray-400 ${
                    isOpen ? "rotate-180 text-[var(--color-secondary)]" : ""
                  }`} 
                />
              </button>
              
              <div className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
              }`}>
                <div className="overflow-hidden">
                  <div className="px-6 text-[var(--color-text-dark)] leading-relaxed border-t border-gray-50 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;