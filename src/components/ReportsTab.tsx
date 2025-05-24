
import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, Transaction, PaymentStatus, ReportFilter } from '../types';
import { products } from '../data/products';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Printer, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const ReportsTab: React.FC = () => {
  const [clients] = useLocalStorage<Client[]>('clients', []);
  const [transactions] = useLocalStorage<Transaction[]>('transactions', []);
  
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly' | 'quarterly' | 'custom'>('weekly');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: new Date(),
  });
  
  const currentDate = new Date();
  
  const dateRanges = useMemo(() => ({
    weekly: {
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      label: `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'PP')}`
    },
    monthly: {
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
      label: format(currentDate, 'MMMM yyyy')
    },
    quarterly: {
      start: startOfQuarter(currentDate),
      end: endOfQuarter(currentDate),
      label: `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`
    },
    custom: {
      start: dateRange.from || currentDate,
      end: dateRange.to || currentDate,
      label: dateRange.from && dateRange.to ? 
        `${format(dateRange.from, 'PP')} - ${format(dateRange.to, 'PP')}` : 
        'Custom Range'
    }
  }), [currentDate, dateRange]);

  // Update date range when report period changes
  useEffect(() => {
    if (reportPeriod !== 'custom') {
      setDateRange({
        from: dateRanges[reportPeriod].start,
        to: dateRanges[reportPeriod].end
      });
    }
  }, [reportPeriod, dateRanges]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const rangeStart = dateRanges[reportPeriod].start;
      const rangeEnd = dateRanges[reportPeriod].end;
      
      const isInDateRange = 
        transactionDate >= rangeStart &&
        transactionDate <= rangeEnd;
        
      const matchesClient = selectedClientId === 'all' || transaction.clientId === selectedClientId;
      
      const matchesStatus = 
        paymentStatusFilter === 'all' || 
        transaction.paymentStatus === paymentStatusFilter;
      
      return isInDateRange && matchesClient && matchesStatus;
    });
  }, [transactions, dateRanges, reportPeriod, selectedClientId, paymentStatusFilter]);

  const reportSummary = useMemo(() => {
    const summary = {
      totalAmount: 0,
      totalPaid: 0,
      totalDue: 0,
      transactionCount: filteredTransactions.length,
      clientCount: new Set(filteredTransactions.map(t => t.clientId)).size,
      productCount: new Set(filteredTransactions.map(t => t.productId)).size,
      settledCount: filteredTransactions.filter(t => t.paymentStatus === 'settled').length,
      pendingCount: filteredTransactions.filter(t => t.paymentStatus === 'pending').length,
    };
    
    filteredTransactions.forEach(transaction => {
      summary.totalAmount += transaction.totalPrice;
      summary.totalPaid += transaction.amountPaid;
      summary.totalDue += transaction.amountDue;
    });
    
    return summary;
  }, [filteredTransactions]);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} (${product.size})` : 'Unknown Product';
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    // Create CSV content
    const headers = ['Date', 'Client', 'Product', 'Quantity', 'Price (€)', 'Total (€)', 'Paid (€)', 'Due (€)', 'Status'];
    
    const rows = filteredTransactions.map(transaction => [
      format(new Date(transaction.date), 'dd/MM/yyyy'),
      getClientName(transaction.clientId),
      getProductName(transaction.productId),
      transaction.quantity,
      transaction.pricePerUnit.toFixed(2),
      transaction.totalPrice.toFixed(2),
      transaction.amountPaid.toFixed(2),
      transaction.amountDue.toFixed(2),
      transaction.paymentStatus === 'settled' ? 'Settled' : 'Pending Payment'
    ]);
    
    // Add summary rows
    rows.push([]);
    rows.push(['Report Summary', dateRanges[reportPeriod].label]);
    rows.push(['Total Transactions', reportSummary.transactionCount.toString()]);
    rows.push(['Total Amount', `€${reportSummary.totalAmount.toFixed(2)}`]);
    rows.push(['Total Paid', `€${reportSummary.totalPaid.toFixed(2)}`]);
    rows.push(['Total Due', `€${reportSummary.totalDue.toFixed(2)}`]);
    
    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zeta-energy-report-${reportPeriod}-${format(currentDate, 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card className="print:shadow-none">
        <CardHeader className="print:pb-0">
          <CardTitle>Financial Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:hidden">
            <div className="space-y-2">
              <Label>Report Period</Label>
              <Tabs value={reportPeriod} onValueChange={(value) => setReportPeriod(value as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {reportPeriod === 'custom' && (
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter as any}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="settled">Settled</SelectItem>
                  <SelectItem value="pending">Pending Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="print:hidden mb-6">
            <div className="flex flex-col md:flex-row gap-2 justify-end">
              <Button variant="outline" onClick={handlePrintReport}>
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </div>
          
          {/* Report Header - Visible on both screen and print */}
          <div className="mb-6 hidden print:block">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-bold">Zeta Energy Ltd.</h2>
                <p>Financial Statement</p>
              </div>
              <div className="text-right">
                <h3 className="font-medium">{dateRanges[reportPeriod].label}</h3>
                <p>Report Date: {format(currentDate, 'PPP')}</p>
              </div>
            </div>
            <hr className="my-4" />
          </div>
          
          {/* Report Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Report Summary - {dateRanges[reportPeriod].label}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{reportSummary.transactionCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">€{reportSummary.totalAmount.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">€{reportSummary.totalPaid.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Due</p>
                  <p className="text-2xl font-bold text-red-600">€{reportSummary.totalDue.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Transactions Table */}
          <div className="border rounded-md print:border-none">
            <h3 className="text-lg font-medium mb-2 px-4 pt-4 print:px-0">Transaction Details</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price (€)</TableHead>
                  <TableHead className="text-right">Total (€)</TableHead>
                  <TableHead className="text-right">Paid (€)</TableHead>
                  <TableHead className="text-right">Due (€)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{getClientName(transaction.clientId)}</TableCell>
                      <TableCell>{getProductName(transaction.productId)}</TableCell>
                      <TableCell className="text-right">{transaction.quantity}</TableCell>
                      <TableCell className="text-right">{transaction.pricePerUnit.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{transaction.totalPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{transaction.amountPaid.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{transaction.amountDue.toFixed(2)}</TableCell>
                      <TableCell className={transaction.paymentStatus === 'settled' ? 'status-settled' : 'status-pending'}>
                        {transaction.paymentStatus === 'settled' ? 'Settled' : 'Pending'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      No transactions found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Print Footer */}
          <div className="hidden print:block mt-8">
            <hr className="mb-4" />
            <div className="flex justify-between items-center text-sm text-gray-500">
              <p>Zeta Energy Financial Statement</p>
              <p>Page 1</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTab;
