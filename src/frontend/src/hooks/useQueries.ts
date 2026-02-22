import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, HostingPlan, MinecraftServer, Plugin, PaymentRecord, StripeConfiguration, ShoppingItem } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Plan Queries
export function useGetPlans() {
  const { actor, isFetching } = useActor();

  return useQuery<HostingPlan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPlans();
    },
    enabled: !!actor && !isFetching,
  });
}

// Server Queries
export function useGetMyServers() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<MinecraftServer[]>({
    queryKey: ['myServers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyServers();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetServer(serverId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MinecraftServer | null>({
    queryKey: ['server', serverId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getServer(serverId);
    },
    enabled: !!actor && !isFetching && !!serverId,
  });
}

export function useCreateServer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      if (!actor) throw new Error('Actor not available');
      const server = await actor.createServer(planId);
      return server;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServers'] });
    },
    onError: (error: any) => {
      console.error('Create server mutation error:', error);
      throw error;
    },
  });
}

export function useGetAllServers() {
  const { actor, isFetching } = useActor();

  return useQuery<MinecraftServer[]>({
    queryKey: ['allServers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServers();
    },
    enabled: !!actor && !isFetching,
  });
}

// Plugin Queries
export function useGetPlugins() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Plugin[]>({
    queryKey: ['plugins'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPlugins();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useInstallPlugin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, pluginId }: { serverId: string; pluginId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.installPluginToServer(serverId, pluginId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId] });
      queryClient.invalidateQueries({ queryKey: ['myServers'] });
    },
  });
}

export function useRemovePlugin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, pluginId }: { serverId: string; pluginId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removePluginFromServer(serverId, pluginId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId] });
      queryClient.invalidateQueries({ queryKey: ['myServers'] });
    },
  });
}

// User Queries
export function useGetAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

// Payment Queries
export function useGetMyPayments() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PaymentRecord[]>({
    queryKey: ['myPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPayments();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Stripe Queries
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      
      try {
        const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
        const session = JSON.parse(result) as CheckoutSession;
        
        if (!session?.url) {
          throw new Error('Stripe session missing url');
        }
        
        return session;
      } catch (error: any) {
        console.error('Checkout session creation error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }
    },
  });
}

export function useGetStripeSessionStatus(sessionId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['stripeSessionStatus', sessionId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}
