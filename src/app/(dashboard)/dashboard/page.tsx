'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, Plus, Pencil, Trash2, Star, MapPin, Phone, Mail, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { ApiResponse } from '@/types/api';
import type { PetShop } from '@/types/petshop';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [shop, setShop] = useState<PetShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchShop();
  }, []);

  async function fetchShop() {
    try {
      const { data } = await api.get<ApiResponse<PetShop[]>>('/api/v1/petshops/mine');
      const shops = data.data;
      if (shops && shops.length > 0) {
        setShop(shops[0]);
      } else {
        setShop(null);
      }
    } catch {
      setShop(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!shop) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/petshops/${shop.id}`);
      toast.success('Shop deleted successfully');
      setShop(null);
      setDeleteDialogOpen(false);
    } catch {
      toast.error('Failed to delete shop');
    } finally {
      setDeleting(false);
    }
  }

  function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      grooming: 'Grooming',
      vet: 'Veterinary',
      boarding: 'Boarding',
      pet_store: 'Pet Store',
    };
    return labels[category] || category;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // No shop state
  if (!shop) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Store className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-2xl">Set Up Your Shop</CardTitle>
            <CardDescription>
              You haven&apos;t created a shop yet. Set up your pet shop to start appearing in the Kilat Pet directory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/setup">
                <Plus className="mr-2 h-4 w-4" />
                Create Your Shop
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has shop state
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Shop</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/shop/edit">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Shop
            </Link>
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Shop
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Delete Shop
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{shop.name}&quot;? This action cannot be undone. Your shop will be removed from the Kilat Pet directory.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Shop'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Shop Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{shop.name}</CardTitle>
              <CardDescription>{getCategoryLabel(shop.category)}</CardDescription>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">{shop.rating.toFixed(1)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {shop.description && (
            <p className="text-sm text-muted-foreground">{shop.description}</p>
          )}

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{shop.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{shop.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{shop.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{shop.opening_hours}</span>
            </div>
          </div>

          {/* Services */}
          {shop.services && shop.services.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Services</p>
              <div className="flex flex-wrap gap-2">
                {shop.services.map((service) => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{shop.rating.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{shop.services?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Services</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatDate(shop.created_at)}</p>
              <p className="text-sm text-muted-foreground">Created</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
