
import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ClientsTab: React.FC = () => {
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const { toast } = useToast();

  const addClient = () => {
    if (!newClientName.trim() || !newClientPhone.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both name and phone number.",
      });
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      createdAt: new Date(),
    };

    setClients([...clients, newClient]);
    setNewClientName('');
    setNewClientPhone('');

    toast({
      title: "Client Added",
      description: `${newClientName} has been added to your client list.`,
    });
  };

  const confirmDeleteClient = (clientId: string) => {
    setDeleteClientId(clientId);
  };

  const deleteClient = () => {
    if (deleteClientId) {
      const clientToDelete = clients.find(c => c.id === deleteClientId);
      setClients(clients.filter(client => client.id !== deleteClientId));
      
      toast({
        title: "Client Deleted",
        description: `${clientToDelete?.name} has been removed from your client list.`,
      });
      
      setDeleteClientId(null);
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Register New Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="client-name" className="text-sm font-medium">Client Name</label>
              <Input
                id="client-name"
                placeholder="Enter client name"
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="client-phone" className="text-sm font-medium">Phone Number</label>
              <Input
                id="client-phone"
                placeholder="Enter phone number"
                value={newClientPhone}
                onChange={e => setNewClientPhone(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addClient} className="w-full">Add Client</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search clients by name or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => confirmDeleteClient(client.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      {clients.length === 0 ? 'No clients registered yet.' : 'No clients match your search.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteClientId} onOpenChange={() => setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client and all associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteClient} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientsTab;
