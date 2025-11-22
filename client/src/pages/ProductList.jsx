import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import { toast } from 'react-toastify';
import { CSVLink } from 'react-csv';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  FileDown, 
  ScanBarcode, 
  QrCode, 
  Pencil, 
  Trash2, 
  FileText 
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [qrProduct, setQrProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/products`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          category: categoryFilter,
          sort: sortField,
        },
      });
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter, sortField]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleScan = (err, result) => {
    if (result) {
      setSearchTerm(result.text);
      setScanning(false);
      toast.success(`Scanned: ${result.text}`);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Product Inventory Report", 14, 10);
    
    const tableColumn = ["Name", "SKU", "Category", "Price", "Quantity", "Status"];
    const tableRows = [];

    products.forEach(product => {
      const productData = [
        product.name,
        product.sku,
        product.category,
        `$${product.price}`,
        product.quantity,
        product.quantity < 10 ? "Low Stock" : "In Stock"
      ];
      tableRows.push(productData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("inventory_report.pdf");
  };

  const csvHeaders = [
    { label: "Name", key: "name" },
    { label: "SKU", key: "sku" },
    { label: "Category", key: "category" },
    { label: "Price", key: "price" },
    { label: "Quantity", key: "quantity" },
    { label: "Description", key: "description" }
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user && user.role === 'admin' && (
            <Button asChild>
              <Link to="/products/new">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Link>
            </Button>
          )}
          <Dialog open={scanning} onOpenChange={setScanning}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ScanBarcode className="mr-2 h-4 w-4" /> Scan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan Barcode</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center p-4">
                <BarcodeScannerComponent
                  width={300}
                  height={300}
                  onUpdate={handleScan}
                />
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={generatePDF}>
            <FileText className="mr-2 h-4 w-4" /> PDF
          </Button>

          <CSVLink
            data={products}
            headers={csvHeaders}
            filename={"inventory_export.csv"}
            className="inline-flex"
          >
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> CSV
            </Button>
          </CSVLink>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Clothing">Clothing</SelectItem>
              <SelectItem value="Home">Home</SelectItem>
              <SelectItem value="Books">Books</SelectItem>
              <SelectItem value="Toys">Toys</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortField} onValueChange={setSortField}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="quantity">Quantity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={product.quantity < 10 ? "text-red-500 font-bold" : ""}>
                      {product.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setQrProduct(product)}>
                          <QrCode className="mr-2 h-4 w-4" /> View QR Code
                        </DropdownMenuItem>
                        {user && user.role === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={`/products/${product._id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(product._id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <Dialog open={!!qrProduct} onOpenChange={(open) => !open && setQrProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{qrProduct?.name} - QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            {qrProduct && (
              <>
                <QRCodeCanvas value={qrProduct.sku} size={200} />
                <p className="text-sm text-muted-foreground">SKU: {qrProduct.sku}</p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </PageTransition>
  );
}
