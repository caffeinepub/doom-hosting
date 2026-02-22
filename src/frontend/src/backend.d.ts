import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface PaymentRecord {
    id: string;
    status: string;
    planId: string;
    user: Principal;
    timestamp: Time;
    stripeSessionId: string;
    amount: bigint;
}
export interface Plugin {
    id: string;
    url: string;
    name: string;
    description: string;
    version: string;
}
export interface HostingPlan {
    id: string;
    fps: bigint;
    ram: bigint;
    name: string;
    price: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface ServerPermission {
    grantedAt: Time;
    grantedBy: Principal;
    user: Principal;
    canExecuteCommands: boolean;
    serverId: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface MinecraftServer {
    id: string;
    status: string;
    domain: string;
    owner: Principal;
    createdAt: Time;
    plan: HostingPlan;
    installedPlugins: Array<string>;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPlan(plan: HostingPlan): Promise<void>;
    addPlugin(plugin: Plugin): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createServer(planId: string): Promise<MinecraftServer>;
    getAllPayments(): Promise<Array<PaymentRecord>>;
    getAllServers(): Promise<Array<MinecraftServer>>;
    getAllUsers(): Promise<Array<Principal>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyPayments(): Promise<Array<PaymentRecord>>;
    getMyServers(): Promise<Array<MinecraftServer>>;
    getPlans(): Promise<Array<HostingPlan>>;
    getPlugins(): Promise<Array<Plugin>>;
    getServer(serverId: string): Promise<MinecraftServer | null>;
    getServerPermissions(serverId: string): Promise<Array<ServerPermission>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantServerPermission(serverId: string, user: Principal, canExecuteCommands: boolean): Promise<void>;
    installPluginToServer(serverId: string, pluginId: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    processStripePayment(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    recordPayment(planId: string, amount: bigint, stripeSessionId: string): Promise<void>;
    removePluginFromServer(serverId: string, pluginId: string): Promise<void>;
    revokeServerPermission(serverId: string, user: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateServerStatus(serverId: string, status: string): Promise<void>;
}
