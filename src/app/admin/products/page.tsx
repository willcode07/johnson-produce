'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Product } from '@/lib/products';
import { Plus, Edit, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';

interface ImageInfo {
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageInfo[]>([]);
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '',
    name: '',
    description: '',
    image: '',
    images: [],
    primaryImageIndex: 0,
    pricePerPound: 0,
    availability: true,
    season: '',
    origin: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchUploadedImages = async () => {
    try {
      const response = await fetch('/api/admin/images');
      if (response.ok) {
        const data = await response.json();
        setUploadedImages(data.images || []);
      }
    } catch (error) {
      console.error('Error fetching uploaded images:', error);
    }
  };

  const handleOpenImageSelector = () => {
    fetchUploadedImages();
    setShowImageSelector(true);
  };

  const handleSelectImage = (imageUrl: string) => {
    // Check if image is already in the list
    if (!formData.images?.includes(imageUrl)) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), imageUrl],
      });
    }
    setShowImageSelector(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      images: product.images || [product.image],
    });
  };

  const handleSave = async () => {
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchProducts();
        setEditingProduct(null);
        setShowCreateModal(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to save product'}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      image: '',
      images: [],
      primaryImageIndex: 0,
      pricePerPound: 0,
      availability: true,
      season: '',
      origin: '',
    });
  };

  const addImageUrl = () => {
    setFormData({
      ...formData,
      images: [...(formData.images || []), ''],
    });
  };

  const updateImageUrl = (index: number, url: string) => {
    const newImages = [...(formData.images || [])];
    newImages[index] = url;
    setFormData({ ...formData, images: newImages });
  };

  const removeImageUrl = (index: number) => {
    const newImages = formData.images?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, images: newImages });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading products...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-2">Manage your product catalog</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Images
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.pricePerPound}/lb</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.availability
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.availability ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(product.images?.length || 1)} image(s)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-amber-600 hover:text-amber-900 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit/Create Modal */}
        {(editingProduct || showCreateModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Create Product'}
                </h2>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product ID
                    </label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${
                        editingProduct
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'text-gray-900'
                      }`}
                      placeholder="e.g., mango"
                      disabled={!!editingProduct}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      placeholder="e.g., Mango"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    rows={3}
                    placeholder="Product description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per lb ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pricePerPound}
                      onChange={(e) =>
                        setFormData({ ...formData, pricePerPound: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Season
                    </label>
                    <input
                      type="text"
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      placeholder="e.g., May - September"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Origin
                    </label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      placeholder="e.g., Florida"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.availability}
                      onChange={(e) =>
                        setFormData({ ...formData, availability: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Available</span>
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Images
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleOpenImageSelector}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Select from Uploaded
                      </button>
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="text-sm text-amber-600 hover:text-amber-700"
                      >
                        + Add URL
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {formData.images?.map((url, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-10 w-10 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => updateImageUrl(index, e.target.value)}
                            className="flex-1 bg-transparent border-none focus:outline-none text-gray-900"
                            placeholder="/images/product.jpg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    {(!formData.images || formData.images.length === 0) && (
                      <p className="text-sm text-gray-500 italic">No images added yet</p>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Image Index
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={(formData.images?.length || 1) - 1}
                      value={formData.primaryImageIndex || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryImageIndex: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Which image should be shown first? (0 = first image)
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Selector Modal */}
        {showImageSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Select Images</h2>
                <button
                  onClick={() => setShowImageSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {uploadedImages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No images uploaded yet</p>
                    <p className="text-sm mt-2">Upload images from the Images page first</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((image) => {
                      const isSelected = formData.images?.includes(image.url);
                      return (
                        <div
                          key={image.filename}
                          onClick={() => handleSelectImage(image.url)}
                          className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                            isSelected
                              ? 'border-amber-500 ring-2 ring-amber-200'
                              : 'border-gray-200 hover:border-amber-300'
                          }`}
                        >
                          <div className="aspect-square bg-gray-100">
                            <img
                              src={image.url}
                              alt={image.filename}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="p-2 bg-white">
                            <p className="text-xs font-medium text-gray-900 truncate" title={image.filename}>
                              {image.filename}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setShowImageSelector(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

