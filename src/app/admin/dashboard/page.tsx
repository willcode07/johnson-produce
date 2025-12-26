'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Package, ShoppingCart, Settings, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    // Check authentication
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus !== 'true') {
      router.push('/admin');
      return;
    }

    // Fetch stats
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setStats(prev => ({ ...prev, totalProducts: productsData.products?.length || 0 }));
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const orders = ordersData.orders || [];
        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const dashboardCards = [
    {
      title: 'Products',
      count: stats.totalProducts,
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-500',
    },
    {
      title: 'Orders',
      count: stats.totalOrders,
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-green-500',
      badge: stats.pendingOrders > 0 ? stats.pendingOrders : undefined,
    },
    {
      title: 'Images',
      count: 'Manage',
      icon: ImageIcon,
      href: '/admin/images',
      color: 'bg-purple-500',
    },
    {
      title: 'Settings',
      count: 'Config',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-amber-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to the admin panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              {card.badge && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {card.badge} pending
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

