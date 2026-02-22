import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Server, Loader2 } from 'lucide-react';
import ServerCard from '../components/ServerCard';
import { useGetMyServers, useCreateServer, useCreateCheckoutSession } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { ShoppingItem } from '../backend';

export default function UserDashboard() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { selectedPlan?: string };
  const { identity } = useInternetIdentity();
  const { data: servers, isLoading } = useGetMyServers();
  const createServer = useCreateServer();
  const createCheckout = useCreateCheckoutSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const processedPlanRef = useRef<string | null>(null);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
      return;
    }

    // Only process if we have a selectedPlan, we're not already processing,
    // and we haven't already processed this exact plan
    if (search.selectedPlan && !isProcessing && processedPlanRef.current !== search.selectedPlan) {
      processedPlanRef.current = search.selectedPlan;
      handleCreateServer(search.selectedPlan);
    }
  }, [search.selectedPlan, identity, isProcessing]);

  const handleCreateServer = async (planId: string) => {
    setIsProcessing(true);
    try {
      // Check if it's a free plan (planId === 'free')
      if (planId === 'free') {
        await createServer.mutateAsync(planId);
        toast.success('Server created successfully!');
        // Clear the query parameter to prevent re-triggering
        navigate({ to: '/dashboard', search: {} });
      } else {
        // Paid plan - initiate Stripe checkout
        const items: ShoppingItem[] = [
          {
            productName: `Doom Hosting - Plan ${planId}`,
            productDescription: `Minecraft server hosting plan ${planId}`,
            priceInCents: BigInt(planId === '1' ? 10000 : planId === '2' ? 30000 : 50000),
            currency: 'usd',
            quantity: BigInt(1),
          },
        ];

        const session = await createCheckout.mutateAsync(items);
        if (!session?.url) {
          throw new Error('Stripe session missing url');
        }
        // Redirect to Stripe - this will leave the page
        window.location.href = session.url;
      }
    } catch (error: any) {
      console.error('Server creation error:', error);
      toast.error(error.message || 'Failed to create server');
      // Clear the query parameter and reset processing state
      navigate({ to: '/dashboard', search: {} });
      processedPlanRef.current = null;
    } finally {
      setIsProcessing(false);
    }
  };

  if (!identity) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-32 bg-muted" />
              <CardContent className="h-24 bg-muted/50" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </CardTitle>
              <CardDescription>
                {search.selectedPlan === 'free' 
                  ? 'Creating your server...' 
                  : 'Redirecting to payment...'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Servers</h1>
          <p className="text-muted-foreground mt-1">Manage your Minecraft servers</p>
        </div>
        <Button 
          onClick={() => navigate({ to: '/' })} 
          className="gap-2"
          disabled={isProcessing}
        >
          <Plus className="w-4 h-4" />
          Create Server
        </Button>
      </div>

      {servers && servers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Server className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle>No Servers Yet</CardTitle>
            <CardDescription>Create your first Minecraft server to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate({ to: '/' })} 
              className="gap-2"
              disabled={isProcessing}
            >
              <Plus className="w-4 h-4" />
              Create Your First Server
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
