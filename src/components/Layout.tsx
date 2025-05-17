
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Watermark from './Watermark';
import Logo from './Logo';
import ClientsTab from './ClientsTab';
import ProductsTab from './ProductsTab';
import TransactionsTab from './TransactionsTab';
import ReportsTab from './ReportsTab';

interface LayoutProps {
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Watermark />
      
      <header className="bg-white py-3 px-4 border-b shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              onClick={onLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <h1 className="text-3xl font-bold mt-2 mb-6 text-center">Financial Statement System</h1>
        
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="clients">
            <ClientsTab />
          </TabsContent>
          
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          
          <TabsContent value="transactions">
            <TransactionsTab />
          </TabsContent>
          
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-white py-4 px-4 border-t text-center text-sm text-gray-600">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Zeta Energy Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
