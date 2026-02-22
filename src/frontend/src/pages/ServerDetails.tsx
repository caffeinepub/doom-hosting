import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, HardDrive, Cpu, Globe, Package, Trash2 } from 'lucide-react';
import { useGetServer, useGetPlugins, useInstallPlugin, useRemovePlugin } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function ServerDetails() {
  const { serverId } = useParams({ strict: false }) as { serverId: string };
  const navigate = useNavigate();
  const { data: server, isLoading } = useGetServer(serverId);
  const { data: allPlugins } = useGetPlugins();
  const installPlugin = useInstallPlugin();
  const removePlugin = useRemovePlugin();

  const handleInstallPlugin = async (pluginId: string) => {
    try {
      await installPlugin.mutateAsync({ serverId, pluginId });
      toast.success('Plugin installed successfully!');
    } catch (error) {
      toast.error('Failed to install plugin');
    }
  };

  const handleRemovePlugin = async (pluginId: string) => {
    try {
      await removePlugin.mutateAsync({ serverId, pluginId });
      toast.success('Plugin removed successfully!');
    } catch (error) {
      toast.error('Failed to remove plugin');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse">
          <CardHeader className="h-48 bg-muted" />
          <CardContent className="h-64 bg-muted/50" />
        </Card>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Server Not Found</CardTitle>
            <CardDescription>The server you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/dashboard' })}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const installedPluginObjects = allPlugins?.filter((p) => server.installedPlugins.includes(p.id)) || [];
  const availablePlugins = allPlugins?.filter((p) => !server.installedPlugins.includes(p.id)) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/dashboard' })} className="mb-6 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{server.domain}</CardTitle>
                <CardDescription className="mt-2">Server ID: {server.id}</CardDescription>
              </div>
              <Badge variant={server.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                {server.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HardDrive className="w-4 h-4" />
                  <span>RAM</span>
                </div>
                <p className="text-2xl font-bold">{Number(server.plan.ram)} GB</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Cpu className="w-4 h-4" />
                  <span>FPS</span>
                </div>
                <p className="text-2xl font-bold">{Number(server.plan.fps)}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>Domain</span>
              </div>
              <p className="font-mono text-sm bg-muted px-3 py-2 rounded">{server.domain}</p>
            </div>
          </CardContent>
        </Card>

        {/* Plan Info */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan Name</p>
              <p className="text-lg font-semibold">{server.plan.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-lg font-semibold">
                {server.plan.price === BigInt(0) ? 'Free' : `$${Number(server.plan.price)}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Installed Plugins */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Installed Plugins ({installedPluginObjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {installedPluginObjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {installedPluginObjects.map((plugin) => (
                  <div key={plugin.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{plugin.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{plugin.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">Version: {plugin.version}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePlugin(plugin.id)}
                      disabled={removePlugin.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No plugins installed yet</p>
            )}
          </CardContent>
        </Card>

        {/* Available Plugins */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Available Plugins ({availablePlugins.length})</CardTitle>
            <CardDescription>Install plugins to enhance your server</CardDescription>
          </CardHeader>
          <CardContent>
            {availablePlugins.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePlugins.map((plugin) => (
                  <div key={plugin.id} className="p-4 border rounded-lg space-y-3">
                    <div>
                      <h4 className="font-semibold">{plugin.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{plugin.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">Version: {plugin.version}</p>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleInstallPlugin(plugin.id)}
                      disabled={installPlugin.isPending}
                    >
                      Install
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">All available plugins are installed</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
