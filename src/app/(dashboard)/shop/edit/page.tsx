'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { PetShop } from '@/types/petshop';
import { toast } from 'sonner';

const LocationPicker = dynamic(() => import('@/components/maps/location-picker'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
});

const SERVICES_OPTIONS = [
  'Grooming',
  'Vaccination',
  'Pet Boarding',
  'Pet Food',
  'Accessories',
  'Health Check',
  'Training',
  'Surgery',
];

export default function EditShopPage() {
  const router = useRouter();
  const [shopId, setShopId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    category: '',
    description: '',
    address: '',
    latitude: 3.139,
    longitude: 101.6869,
    services: [] as string[],
    opening_hours: '',
  });

  useEffect(() => {
    async function fetchShop() {
      try {
        const { data } = await api.get<ApiResponse<PetShop[]>>('/api/v1/petshops/mine');
        const shops = data.data;
        if (shops && shops.length > 0) {
          const shop = shops[0];
          setShopId(shop.id);
          setForm({
            name: shop.name || '',
            phone: shop.phone || '',
            email: shop.email || '',
            category: shop.category || '',
            description: shop.description || '',
            address: shop.address || '',
            latitude: shop.latitude || 3.139,
            longitude: shop.longitude || 101.6869,
            services: shop.services || [],
            opening_hours: shop.opening_hours || '',
          });
        } else {
          toast.error('No shop found. Please create one first.');
          router.push('/setup');
        }
      } catch {
        toast.error('Failed to load shop data');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchShop();
  }, [router]);

  function updateField(field: string, value: string | number | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleService(service: string) {
    setForm((prev) => {
      const services = prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  }

  async function handleSave() {
    setError('');
    setSaving(true);

    try {
      await api.put<ApiResponse<PetShop>>(`/api/v1/petshops/${shopId}`, {
        name: form.name,
        phone: form.phone,
        email: form.email,
        category: form.category,
        description: form.description,
        address: form.address,
        latitude: form.latitude,
        longitude: form.longitude,
        services: form.services,
        opening_hours: form.opening_hours,
      });
      toast.success('Shop updated successfully!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to update shop. Please try again.');
      toast.error(msg || 'Failed to update shop');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Shop</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your shop details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Shop Name</Label>
            <Input
              id="name"
              placeholder="e.g. Happy Paws Pet Shop"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+60123456789"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="shop@example.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={form.category} onValueChange={(val) => updateField('category', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grooming">Grooming</SelectItem>
                <SelectItem value="vet">Veterinary</SelectItem>
                <SelectItem value="boarding">Boarding</SelectItem>
                <SelectItem value="pet_store">Pet Store</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your shop..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Update your shop address and map pin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="e.g. 123 Jalan Bukit Bintang, 55100 KL"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Pin Location (click on map)</Label>
            <div className="h-64 overflow-hidden rounded-lg border">
              <LocationPicker
                lat={form.latitude}
                lng={form.longitude}
                onSelect={(lat, lng) => {
                  updateField('latitude', lat);
                  updateField('longitude', lng);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Lat: {form.latitude.toFixed(4)}, Lng: {form.longitude.toFixed(4)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Services & Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Hours</CardTitle>
          <CardDescription>Update the services you offer and your opening hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Services Offered</Label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES_OPTIONS.map((service) => (
                <label
                  key={service}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                    form.services.includes(service)
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.services.includes(service)}
                    onChange={() => toggleService(service)}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      form.services.includes(service)
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {form.services.includes(service) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  {service}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="opening_hours">Opening Hours</Label>
            <Input
              id="opening_hours"
              placeholder="e.g. Mon-Fri 9AM-6PM, Sat 9AM-1PM"
              value={form.opening_hours}
              onChange={(e) => updateField('opening_hours', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
