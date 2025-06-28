
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, MessageSquare, Book, ExternalLink } from 'lucide-react';

const HelpSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      question: "What file formats are supported for reconciliation?",
      answer: "The reconciliation tool supports CSV files with specific column headers. Internal files should contain: transaction_reference, amount, status, timestamp. Provider files should contain similar fields. Ensure your CSV files are properly formatted with headers in the first row."
    },
    {
      question: "How does the matching algorithm work?",
      answer: "The system matches transactions based on the transaction reference ID first. If references match exactly, it then compares amounts and status. Transactions are considered matched when reference IDs are identical and amounts are within the configured threshold."
    },
    {
      question: "What should I do if I have many unmatched transactions?",
      answer: "Unmatched transactions can occur due to: 1) Different reference ID formats between systems, 2) Timing differences in transaction recording, 3) Processing fees not accounted for, 4) Data entry errors. Review the unmatched transactions manually and check for these common issues."
    },
    {
      question: "Can I adjust the matching criteria?",
      answer: "Yes, you can adjust the amount matching threshold in the Settings page. This allows for small differences in amounts due to rounding or fees. Be careful not to set the threshold too high as it may cause false matches."
    },
    {
      question: "How do I handle transactions with different statuses?",
      answer: "Transactions with matching references but different statuses are flagged as 'mismatched'. This often happens when there's a timing difference between your internal system and the payment provider. Review these transactions to understand the status discrepancies."
    },
    {
      question: "What does 'Internal Only' mean?",
      answer: "'Internal Only' transactions appear in your internal system but not in the provider statement. This could indicate: 1) The transaction hasn't been processed by the provider yet, 2) The transaction failed at the provider level, 3) Different reference IDs are being used."
    },
    {
      question: "What does 'Provider Only' mean?",
      answer: "'Provider Only' transactions appear in the provider statement but not in your internal system. This could indicate: 1) Transactions not recorded in your system, 2) Different reference ID formats, 3) Transactions processed directly by the provider."
    },
    {
      question: "How can I export the reconciliation results?",
      answer: "Use the 'Export CSV' button on each transaction category to download the results. You can also enable auto-export in Settings to automatically download results after each reconciliation process."
    },
    {
      question: "Is my data secure?",
      answer: "All processing happens locally in your browser. No transaction data is sent to external servers. Files are processed client-side and discarded when you refresh the page or close the browser."
    },
    {
      question: "How do I interpret the match rate percentage?",
      answer: "The match rate is calculated as (Matched Transactions / Total Internal Transactions) × 100. A rate above 95% is considered excellent, 90-95% is good, and below 90% may require investigation of your data quality or matching criteria."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center space-x-3 mb-8">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Help & Support</h1>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Book className="h-5 w-5 text-blue-600" />
                <span>Getting Started</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn the basics of using the reconciliation tool and uploading your first files.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span>Common Issues</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Solutions to frequently encountered problems and error messages.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5 text-purple-600" />
                <span>Best Practices</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tips and recommendations for optimal reconciliation results.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search FAQ..."
                className="w-full px-4 py-2 border border-border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {filteredFaqs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No FAQ items match your search.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you can't find the answer you're looking for, here are additional resources:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">Documentation</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive guides and technical documentation for advanced users.
                </p>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">Video Tutorials</h4>
                <p className="text-sm text-muted-foreground">
                  Step-by-step video guides for common reconciliation scenarios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpSupport;
