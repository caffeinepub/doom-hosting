import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server, HardDrive, Cpu, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { MinecraftServer } from '../backend';

interface ServerCardProps {
  server: MinecraftServer;
}

export default function ServerCard({ server }: ServerCardProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'provisioning':
      case 'creating':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'stopped':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
      case 'error':
        return 'bg-red-500/20 text-red-500 border-red-500/50';
      default:
        return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
    }
  };

  const isProvisioning = server.status.toLowerCase() === 'provisioning' || server.status.toLowerCase() === 'creating';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {isProvisioning ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <Server className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{server.domain}</CardTitle>
              <CardDescription className="text-sm">{server.plan.name}</CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(server.status)} variant="outline">
            {server.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HardDrive className="w-4 h-4" />
          <span>{Number(server.plan.ram)} GB RAM</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Cpu className="w-4 h-4" />
          <span>{Number(server.plan.fps)} FPS</span>
        </div>
        {isProvisioning && (
          <div className="text-sm text-muted-foreground italic">
            Server is being provisioned...
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => navigate({ to: `/server/${server.id}` })}
          className="w-full gap-2"
          variant="outline"
          disabled={isProvisioning}
        >
          <ExternalLink className="w-4 h-4" />
          {isProvisioning ? 'Provisioning...' : 'Manage Server'}
        </Button>
      </CardFooter>
    </Card>
  );
}
