import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useGetStripeSessionStatus, useCreateServer } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { session_id?: string };
  const sessionId = search.session_id;
  const { data: sessionStatus } = useGetStripeSessionStatus(sessionId || '');
  const createServer = useCreateServer();

  useEffect(() => {
    if (sessionStatus && sessionStatus.__kind__ === 'completed') {
      // Payment successful - create the server
      const planId = sessionId?.includes('plan1') ? '1' : sessionId?.includes('plan2') ? '2' : '4';
      createServer.mutateAsync(planId).then(() => {
        toast.success('Server created successfully!');
      }).catch(() => {
        toast.error('Failed to create server');
      });
    }
  }, [sessionStatus]);

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your server is being provisioned</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Your payment has been processed successfully. Your Minecraft server will be ready in a few moments.
          </p>
          <Button onClick={() => navigate({ to: '/dashboard' })} className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
