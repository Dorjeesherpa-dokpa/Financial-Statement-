
import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, Product, Transaction } from '../types';
import { products } from '../data/products';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { cn } from '@/lib/utils';

const TransactionsTab: React.FC = () => {
  const [clients] = useLocalStorage<Client[]>('clients', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClientId, setFilterClientId] = useState<string>('');
  
  const { toast } = useToast();

  const totalPrice = useMemo(() => {
    return quantity * pricePerUnit;
  }, [quantity, pricePerUnit]);

  const amountDue = useMemo(() => {
    return Math.max(0, totalPrice - amountPaid);
  }, [totalPrice, amountPaid]);

  const paymentStatus = useMemo(() => {
    return amountDue === 0 ? 'settled' : 'pending';
  }, [amountDue]);

  const addTransaction = () => {
    if (!selectedClientId || !selectedProductId || quantity <= 0 || pricePerUnit <= 0) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      clientId: selectedClientId,
      productId: selectedProductId,
      quantity,
      pricePerUnit,
      totalPrice,
      date,
      paymentStatus,
      amountPaid,
      amountDue
    };

    setTransactions([...transactions, newTransaction]);
    
    // Reset form fields
    setQuantity(1);
    setPricePerUnit(0);
    setAmountPaid(0);

    toast({
      title: "Transaction Added",
      description: `Transaction for ${getClientName(selectedClientId)} has been recorded.`,
    });
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} (${product.size})` : 'Unknown Product';
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesClient = !filterClientId || transaction.clientId === filterClientId;
    const clientName = getClientName(transaction.clientId).toLowerCase();
    const productName = getProductName(transaction.productId).toLowerCase();
    const matchesSearch = !searchTerm || 
      clientName.includes(searchTerm.toLowerCase()) ||
      productName.includes(searchTerm.toLowerCase());
    
    return matchesClient && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Record New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length > 0 ? (
                    clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No clients available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.size})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transaction-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price per Unit (€)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={pricePerUnit}
                onChange={e => setPricePerUnit(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount-paid">Amount Paid (€)</Label>
              <Input
                id="amount-paid"
                type="number"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Total Price (€)</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                {totalPrice.toFixed(2)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Amount Due (€)</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                {amountDue.toFixed(2)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <div className={`h-10 px-3 py-2 border rounded-md flex items-center ${paymentStatus === 'settled' ? 'status-settled' : 'status-pending'}`}>
                {paymentStatus === 'settled' ? 'Settled' : 'Pending Payment'}
              </div>
            </div>
          </div>
          
          <Button onClick={addTransaction} className="mt-6">
            Record Transaction
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search-transactions" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-transactions"
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <Select value={filterClientId} onValueChange={setFilterClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md">
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
                  filteredTransactions.map(transaction => (
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
                      {transactions.length === 0 ? 'No transactions recorded yet.' : 'No transactions match your search.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsTab;
