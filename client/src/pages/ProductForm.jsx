import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { Upload, FileSpreadsheet } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function ProductForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleCSVImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await axios.post(`${API_BASE_URL}/api/products/import`, formData, config);
      toast.success(data.message);
      setShowImportDialog(false);
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import CSV');
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err));
      }
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await axios.get(`${API_BASE_URL}/api/products/${id}`);
          setValue('name', data.name);
          setValue('category', data.category);
          setValue('description', data.description);
          setValue('price', data.price);
          setValue('quantity', data.quantity);
          setValue('sku', data.sku);
          setValue('imageUrl', data.imageUrl);
        } catch (error) {
          toast.error('Failed to fetch product details');
          navigate('/products');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, setValue, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/api/products/${id}`, data, config);
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/products`, data, config);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</CardTitle>
            {!isEditMode && (
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" /> Import CSV
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Products from CSV</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a CSV file with columns: name, sku, category, price, quantity, description, imageUrl
                      </p>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVImport}
                        disabled={importing}
                        className="cursor-pointer"
                      />
                      {importing && <p className="text-sm text-muted-foreground mt-2">Importing...</p>}
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-xs font-medium mb-2">CSV Format Example:</p>
                      <code className="text-xs block">
                        name,sku,category,price,quantity,description,imageUrl<br/>
                        Laptop,LAP001,Electronics,999.99,50,High-performance,url
                      </code>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...register('category', { required: 'Category is required' })}
                />
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...register('sku', { required: 'SKU is required' })}
                  disabled={isEditMode}
                />
                {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...register('quantity', { 
                    required: 'Quantity is required',
                    min: { value: 0, message: 'Quantity must be positive' }
                  })}
                />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                {...register('imageUrl')}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/products')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </PageTransition>
  );
}
