
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, PackageOpen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Product } from '../types';
import { products as defaultProducts } from '../data/products';
import { useLocalStorage } from '../hooks/useLocalStorage';
import AddProductForm from './AddProductForm';

const ProductsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [storedProducts, setStoredProducts] = useLocalStorage<Product[]>('products', defaultProducts);
  
  // Group products by category
  const pailProducts = storedProducts.filter(p => p.category === 'Pail');
  const smallBottleProducts = storedProducts.filter(p => p.category === 'Small Bottles');
  const drumProducts = storedProducts.filter(p => p.category === 'Drums');
  const ibcProducts = storedProducts.filter(p => p.category === 'IBC');

  // Filter products based on search term
  const filterProducts = (productList: Product[]) => {
    return productList.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleProductAdded = () => {
    setAddProductOpen(false);
    // No need to fetch products again since useLocalStorage hook will update automatically
  };

  const renderProductTable = (productList: Product[]) => {
    const filteredProducts = filterProducts(productList);
    
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.size}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                  No products match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Products Catalog</CardTitle>
          <Popover open={addProductOpen} onOpenChange={setAddProductOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96 p-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <PackageOpen className="mr-2 h-4 w-4" />
                  <h4 className="font-medium text-sm">Add New Product</h4>
                </div>
                <AddProductForm onProductAdded={handleProductAdded} />
              </div>
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="search-products">Search Products</Label>
            <Input
              id="search-products"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <Tabs defaultValue="pail" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="pail">Pail Products</TabsTrigger>
              <TabsTrigger value="small">Small Bottles</TabsTrigger>
              <TabsTrigger value="drums">Drums</TabsTrigger>
              <TabsTrigger value="ibc">IBC Products</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pail" className="pt-4">
              <h3 className="text-lg font-medium mb-4">Pail Products (10-20L)</h3>
              {renderProductTable(pailProducts)}
            </TabsContent>
            
            <TabsContent value="small" className="pt-4">
              <h3 className="text-lg font-medium mb-4">Small Bottles (1-5L)</h3>
              {renderProductTable(smallBottleProducts)}
            </TabsContent>
            
            <TabsContent value="drums" className="pt-4">
              <h3 className="text-lg font-medium mb-4">Drums (60-208L)</h3>
              {renderProductTable(drumProducts)}
            </TabsContent>
            
            <TabsContent value="ibc" className="pt-4">
              <h3 className="text-lg font-medium mb-4">IBC (1000L)</h3>
              {renderProductTable(ibcProducts)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsTab;
