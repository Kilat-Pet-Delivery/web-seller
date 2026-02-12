'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Store, MapPin, Settings, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const STEPS = [
  { label: 'Basic Info', icon: Store },
  { label: 'Location', icon: MapPin },
  { label: 'Services & Hours', icon: Settings },
];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    category: '' as string,
    description: '',
    address: '',
    latitude: 3.139,
    longitude: 101.6869,
    services: [] as string[],
    opening_hours: '',
  });

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

  function canAdvance(): boolean {
    if (step === 0) {
      return !!(form.name && form.phone && form.email && form.category);
    }
    if (step === 1) {
      return !!form.address;
    }
    if (step === 2) {
      return form.services.length > 0 && !!form.opening_hours;
    }
    return false;
  }

  async function handleSubmit() {
    setError('');
    setSubmitting(true);

    try {
      await api.post<ApiResponse<PetShop>>('/api/v1/petshops', {
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
      toast.success('Shop created successfully!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to create shop. Please try again.');
      toast.error(msg || 'Failed to create shop');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Set Up Your Shop</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  i < step
                    ? 'bg-green-600 text-white'
                    : i === step
                    ? 'bg-green-100 text-green-700 ring-2 ring-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < step ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <s.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  i <= step ? 'text-green-700' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${
                  i < step ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Step 1: Basic Info */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell us about your pet shop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Happy Paws Pet Shop"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+60123456789"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="shop@example.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
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
                placeholder="Describe your shop and what makes it special..."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Location */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Set your shop address and pin location on the map</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="e.g. 123 Jalan Bukit Bintang, 55100 KL"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                required
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
      )}

      {/* Step 3: Services & Hours */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Services & Hours</CardTitle>
            <CardDescription>Select the services you offer and your opening hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Services Offered *</Label>
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
              <Label htmlFor="opening_hours">Opening Hours *</Label>
              <Input
                id="opening_hours"
                placeholder="e.g. Mon-Fri 9AM-6PM, Sat 9AM-1PM"
                value={form.opening_hours}
                onChange={(e) => updateField('opening_hours', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className="bg-green-600 hover:bg-green-700"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canAdvance() || submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? 'Creating Shop...' : 'Create Shop'}
          </Button>
        )}
      </div>
    </div>
  );
}
