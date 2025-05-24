
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Transaction, PaymentStatus } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onSave: (transaction: Transaction) => void;
  getClientName: (id: string) => string;
  getProductName: (id: string) => string;
}

const EditTransactionDialog: React.FC<EditTransactionDialogProps> = ({
  open,
  onOpenChange,
  transaction,
  onSave,
  getClientName,
  getProductName
}) => {
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [amountDue, setAmountDue] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');

  // Update form when transaction changes
  useEffect(() => {
    if (transaction) {
      setAmountPaid(transaction.amountPaid);
      setAmountDue(transaction.amountDue);
      setPaymentStatus(transaction.paymentStatus);
    }
  }, [transaction]);

  // Calculate new amount due and status whenever amountPaid changes
  useEffect(() => {
    if (transaction) {
      const newAmountDue = Math.max(0, transaction.totalPrice - amountPaid);
      setAmountDue(newAmountDue);
      setPaymentStatus(newAmountDue === 0 ? 'settled' : 'pending');
    }
  }, [amountPaid, transaction]);

  const handleSave = () => {
    if (!transaction) return;

    const previousStatus = transaction.paymentStatus;
    const previousAmountPaid = transaction.amountPaid;

    const updatedTransaction: Transaction = {
      ...transaction,
      amountPaid,
      amountDue,
      paymentStatus,
      lastEditedAt: new Date(),
      editHistory: [
        ...(transaction.editHistory || []),
        {
          date: new Date(),
          previousAmountPaid,
          newAmountPaid: amountPaid,
          previousStatus,
          newStatus: paymentStatus
        }
      ]
    };

    onSave(updatedTransaction);
    onOpenChange(false);
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Client</Label>
            <div className="col-span-3 font-medium">
              {getClientName(transaction.clientId)}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Product</Label>
            <div className="col-span-3 font-medium">
              {getProductName(transaction.productId)}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Date</Label>
            <div className="col-span-3">
              {format(new Date(transaction.date), 'dd/MM/yyyy')}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Quantity</Label>
            <div className="col-span-3">{transaction.quantity}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Total Price</Label>
            <div className="col-span-3">€{transaction.totalPrice.toFixed(2)}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount-paid" className="text-right">Amount Paid</Label>
            <div className="col-span-3">
              <Input
                id="amount-paid"
                type="number"
                min="0"
                step="0.01"
                max={transaction.totalPrice}
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Amount Due</Label>
            <div className="col-span-3">€{amountDue.toFixed(2)}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <div className={`col-span-3 ${paymentStatus === 'settled' ? 'status-settled' : 'status-pending'}`}>
              {paymentStatus === 'settled' ? 'Settled' : 'Pending Payment'}
            </div>
          </div>

          {transaction.lastEditedAt && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Last Edited</Label>
              <div className="col-span-3 text-sm text-muted-foreground">
                {format(new Date(transaction.lastEditedAt), 'dd/MM/yyyy HH:mm')}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionDialog;
