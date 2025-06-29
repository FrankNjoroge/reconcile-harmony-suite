
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle, MessageSquare, Book, ExternalLink, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpSupport: React.FC = () => {
  const navigate = useNavigate();
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Help & Support</h1>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>

        {/* Quick Help Cards - Now Interactive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Dialog>
            <DialogTrigger asChild>
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
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-blue-600" />
                  <span>Getting Started</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">1. Upload Your Files</h4>
                  <p className="text-sm text-blue-700">
                    Start by uploading both your internal system export and payment provider statement in CSV format
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">2. Review Results</h4>
                  <p className="text-sm text-green-700">
                    Check the reconciliation summary showing matched, internal-only, and provider-only transactions
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">3. Export Reports</h4>
                  <p className="text-sm text-purple-700">
                    Download detailed reports for each category to share with your team
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
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
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span>Common Issues</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">File Format Problems</h4>
                  <p className="text-sm text-red-700">
                    Ensure CSV files have proper headers and transaction_reference column
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Missing Transactions</h4>
                  <p className="text-sm text-yellow-700">
                    Check if transaction references match exactly between files
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">Amount Discrepancies</h4>
                  <p className="text-sm text-orange-700">
                    Verify currency formatting and decimal places are consistent
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
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
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <ExternalLink className="h-5 w-5 text-purple-600" />
                  <span>Best Practices</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Regular Reconciliation</h4>
                  <p className="text-sm text-blue-700">
                    Run reconciliation daily to catch discrepancies early
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Data Validation</h4>
                  <p className="text-sm text-green-700">
                    Always verify file formats before uploading
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Documentation</h4>
                  <p className="text-sm text-purple-700">
                    Keep exported reports for audit trails and team communication
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
