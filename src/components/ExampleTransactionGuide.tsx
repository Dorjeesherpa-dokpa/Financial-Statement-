
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from 'date-fns';

interface ExampleTransactionGuideProps {
  onDismiss: () => void;
}

const ExampleTransactionGuide: React.FC<ExampleTransactionGuideProps> = ({ onDismiss }) => {
  return (
    <Card className="mb-6 border-2 border-primary/20 bg-primary/5 animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Quick Transaction Example</span>
          <Button variant="ghost" size="sm" onClick={onDismiss} className="h-8">
            Dismiss
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <p className="font-medium">How to record Client A's purchase of Granit Maximum 15W40:</p>
          
          <ol className="space-y-2 list-decimal pl-5">
            <li>
              <span className="font-medium">Add a client named "Client A"</span> in the Clients tab if not already created
            </li>
            <li>
              <span className="font-medium">Select Client:</span> Choose "Client A" from the client dropdown
            </li>
            <li>
              <span className="font-medium">Select Product:</span> Choose "Granit Maximum 15W40 (Pail 20L)" from the product dropdown
            </li>
            <li>
              <span className="font-medium">Set Date:</span> <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded">
                <CalendarIcon className="h-3 w-3" /> {format(new Date(), 'dd/MM/yyyy')}
              </span>
            </li>
            <li>
              <span className="font-medium">Enter Quantity:</span> <span className="bg-muted px-2 py-1 rounded">1</span>
            </li>
            <li>
              <span className="font-medium">Enter Price per Unit (€):</span> <span className="bg-muted px-2 py-1 rounded">90.00</span>
            </li>
            <li>
              <span className="font-medium">Enter Amount Paid (€):</span>
              <ul className="list-disc pl-5 mt-1">
                <li>For "Settled" status: Enter <span className="bg-muted px-2 py-1 rounded">90.00</span></li>
                <li>For "Pending Payment" status: Enter a lower amount, e.g., <span className="bg-muted px-2 py-1 rounded">50.00</span></li>
              </ul>
            </li>
            <li>
              Click <span className="bg-primary text-white px-2 py-1 rounded">Record Transaction</span>
            </li>
          </ol>
          
          <div className="pt-2 text-muted-foreground">
            <p>All transactions will appear in the Transaction History table below and in the Reports tab.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExampleTransactionGuide;
