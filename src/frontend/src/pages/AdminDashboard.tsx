import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Server, Users, CreditCard, Settings } from 'lucide-react';
import { useIsCallerAdmin, useGetAllServers, useGetAllUsers, useIsStripeConfigured } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AccessDenied from '../components/AccessDenied';
import StripeSetup from '../components/StripeSetup';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: servers } = useGetAllServers();
  const { data: users } = useGetAllUsers();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const [showStripeSetup, setShowStripeSetup] = useState(false);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity]);

  useEffect(() => {
    if (isAdmin && stripeConfigured === false) {
      setShowStripeSetup(true);
    }
  }, [isAdmin, stripeConfigured]);

  if (!identity || adminLoading) {
    return null;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage servers, users, and platform settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stripe Status</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={stripeConfigured ? 'default' : 'secondary'}>
                {stripeConfigured ? 'Configured' : 'Not Configured'}
              </Badge>
              {!stripeConfigured && (
                <Button size="sm" variant="outline" onClick={() => setShowStripeSetup(true)}>
                  Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="servers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="servers">
          <Card>
            <CardHeader>
              <CardTitle>All Servers</CardTitle>
              <CardDescription>Manage all servers across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {servers && servers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Plugins</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servers.map((server) => (
                      <TableRow key={server.id}>
                        <TableCell className="font-mono text-sm">{server.domain}</TableCell>
                        <TableCell>{server.plan.name}</TableCell>
                        <TableCell>
                          <Badge variant={server.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                            {server.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{server.owner.toString().slice(0, 12)}...</TableCell>
                        <TableCell>{server.installedPlugins.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No servers found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {users && users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Principal ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.toString()}>
                        <TableCell className="font-mono text-sm">{user.toString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No users found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>Configure payment and platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Stripe Payment</h4>
                  <p className="text-sm text-muted-foreground">Configure Stripe for payment processing</p>
                </div>
                <Button variant="outline" onClick={() => setShowStripeSetup(true)}>
                  {stripeConfigured ? 'Reconfigure' : 'Setup'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StripeSetup open={showStripeSetup} onClose={() => setShowStripeSetup(false)} />
    </div>
  );
}
