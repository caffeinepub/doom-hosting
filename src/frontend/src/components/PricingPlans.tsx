import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Cpu, HardDrive } from 'lucide-react';
import { useGetPlans } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { HostingPlan } from '../backend';

const planIcons: Record<string, string> = {
  free: '/assets/generated/plan-free-icon.dim_128x128.png',
  '1': '/assets/generated/plan-1-icon.dim_128x128.png',
  '2': '/assets/generated/plan-2-icon.dim_128x128.png',
  '4': '/assets/generated/plan-4-icon.dim_128x128.png',
};

export default function PricingPlans() {
  const { data: plans, isLoading } = useGetPlans();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const handleSelectPlan = (plan: HostingPlan) => {
    if (!identity) {
      toast.error('Please login to create a server');
      return;
    }
    navigate({ to: '/dashboard', search: { selectedPlan: plan.id } });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-48 bg-muted" />
            <CardContent className="h-32 bg-muted/50" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans?.map((plan) => {
        const isFree = plan.price === BigInt(0);
        const planKey = isFree ? 'free' : plan.id;
        const iconSrc = planIcons[planKey] || planIcons['free'];

        return (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all hover:shadow-xl hover:scale-105 ${
              !isFree ? 'border-primary/50' : ''
            }`}
          >
            {!isFree && (
              <div className="absolute top-4 right-4">
                <Badge variant="default" className="bg-primary">
                  Premium
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center">
                <img src={iconSrc} alt={plan.name} className="w-16 h-16" />
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-3xl font-bold text-foreground mt-2">
                {isFree ? 'Free' : `$${Number(plan.price)}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="w-4 h-4 text-primary" />
                <span>{Number(plan.ram)} GB RAM</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Cpu className="w-4 h-4 text-primary" />
                <span>{Number(plan.fps)} FPS</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Plugin Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>.net Domain</span>
              </div>
              {!isFree && (
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Priority Support</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSelectPlan(plan)} className="w-full" variant={isFree ? 'outline' : 'default'}>
                {isFree ? 'Start Free' : 'Get Started'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
