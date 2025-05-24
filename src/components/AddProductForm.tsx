
import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddProductFormProps {
  onProductAdded: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onProductAdded }) => {
  const [productName, setProductName] = useState('');
  const [productSize, setProductSize] = useState('');
  const [productCategory, setProductCategory] = useState<'Pail' | 'Drums' | 'IBC' | 'Small Bottles'>('Pail');
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Product name is required",
      });
      return;
    }

    if (!productSize.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Product size is required",
      });
      return;
    }

    // Create a unique ID for the new product
    const newProduct: Product = {
      id: `${Date.now()}_${productName}_${productSize}`.replace(/\s/g, '_').toLowerCase(),
      name: productName,
      size: productSize,
      category: productCategory,
    };

    // Check for duplicate product
    const isDuplicate = products.some(
      product => product.name.toLowerCase() === productName.toLowerCase() && 
                 product.size.toLowerCase() === productSize.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        variant: "destructive",
        title: "Duplicate Product",
        description: "A product with this name and size already exists",
      });
      return;
    }

    // Add the new product to localStorage
    setProducts([...products, newProduct]);
    
    // Reset form
    setProductName('');
    setProductSize('');
    
    toast({
      title: "Product Added",
      description: `${productName} (${productSize}) has been added to the catalog.`,
    });
    
    // Notify parent component
    onProductAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter product name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="product-size">Product Size</Label>
          <Input
            id="product-size"
            value={productSize}
            onChange={(e) => setProductSize(e.target.value)}
            placeholder="e.g., 20L, 208L, 1000L"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="product-category">Category</Label>
          <Select 
            value={productCategory} 
            onValueChange={(value) => setProductCategory(value as 'Pail' | 'Drums' | 'IBC' | 'Small Bottles')}
          >
            <SelectTrigger id="product-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pail">Pail (10-20L)</SelectItem>
              <SelectItem value="Small Bottles">Small Bottles (1-5L)</SelectItem>
              <SelectItem value="Drums">Drums (60-208L)</SelectItem>
              <SelectItem value="IBC">IBC (1000L)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button type="submit">Add Product</Button>
    </form>
  );
};

export default AddProductForm;
