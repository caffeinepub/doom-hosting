import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSetStripeConfiguration } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function StripeSetup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');
  const setStripeConfig = useSetStripeConfiguration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      toast.error('Please enter Stripe secret key');
      return;
    }

    const allowedCountries = countries.split(',').map((c) => c.trim()).filter(Boolean);
    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one country code');
      return;
    }

    try {
      await setStripeConfig.mutateAsync({ secretKey: secretKey.trim(), allowedCountries });
      toast.success('Stripe configured successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to configure Stripe');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Stripe Payment</DialogTitle>
          <DialogDescription>Enter your Stripe credentials to enable payment processing</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
            <Input
              id="countries"
              placeholder="US,CA,GB"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Example: US,CA,GB,AU</p>
          </div>
          <Button type="submit" className="w-full" disabled={setStripeConfig.isPending}>
            {setStripeConfig.isPending ? 'Configuring...' : 'Configure Stripe'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
