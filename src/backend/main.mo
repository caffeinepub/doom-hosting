import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Stripe "stripe/stripe";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type HostingPlan = {
    id : Text;
    name : Text;
    price : Nat;
    ram : Nat;
    fps : Nat;
  };

  public type MinecraftServer = {
    id : Text;
    owner : Principal;
    plan : HostingPlan;
    domain : Text;
    status : Text;
    createdAt : Time.Time;
    installedPlugins : [Text];
  };

  public type Plugin = {
    id : Text;
    name : Text;
    description : Text;
    version : Text;
    url : Text;
  };

  public type PaymentRecord = {
    id : Text;
    user : Principal;
    planId : Text;
    amount : Nat;
    timestamp : Time.Time;
    stripeSessionId : Text;
    status : Text;
  };

  public type ServerPermission = {
    serverId : Text;
    user : Principal;
    canExecuteCommands : Bool;
    grantedBy : Principal;
    grantedAt : Time.Time;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let plans = Map.empty<Text, HostingPlan>();
  let servers = Map.empty<Text, MinecraftServer>();
  let plugins = Map.empty<Text, Plugin>();
  let payments = Map.empty<Text, PaymentRecord>();
  let serverPermissions = Map.empty<Text, [ServerPermission]>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Hosting Plans
  public query ({ caller }) func getPlans() : async [HostingPlan] {
    plans.values().toArray();
  };

  public shared ({ caller }) func addPlan(plan : HostingPlan) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add plans");
    };
    plans.add(plan.id, plan);
  };

  // Server Management
  public shared ({ caller }) func createServer(planId : Text) : async MinecraftServer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create servers");
    };

    let plan = switch (plans.get(planId)) {
      case (null) { Runtime.trap("Invalid plan id") };
      case (?p) { p };
    };

    let serverId = Nat.toText(servers.size() + 1);
    let server : MinecraftServer = {
      id = serverId;
      owner = caller;
      plan;
      domain = "minecraft-" # serverId # ".net";
      status = "active";
      createdAt = Time.now();
      installedPlugins = [];
    };
    servers.add(server.id, server);
    server;
  };

  public query ({ caller }) func getMyServers() : async [MinecraftServer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their servers");
    };

    servers.values()
      .filter(func(s : MinecraftServer) : Bool { s.owner == caller })
      .toArray();
  };

  public query ({ caller }) func getServer(serverId : Text) : async ?MinecraftServer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view servers");
    };

    let server = servers.get(serverId);
    switch (server) {
      case (null) { null };
      case (?s) {
        if (s.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own servers");
        };
        ?s;
      };
    };
  };

  public shared ({ caller }) func updateServerStatus(serverId : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update servers");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    if (server.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own servers");
    };

    let updatedServer = {
      server with status = status;
    };
    servers.add(serverId, updatedServer);
  };

  // Plugin Management
  public query ({ caller }) func getPlugins() : async [Plugin] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view plugins");
    };
    plugins.values().toArray();
  };

  public shared ({ caller }) func addPlugin(plugin : Plugin) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add plugins");
    };
    plugins.add(plugin.id, plugin);
  };

  public shared ({ caller }) func installPluginToServer(serverId : Text, pluginId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can install plugins");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    if (server.owner != caller) {
      Runtime.trap("Unauthorized: Can only install plugins on your own servers");
    };

    let plugin = switch (plugins.get(pluginId)) {
      case (null) { Runtime.trap("Plugin not found") };
      case (?p) { p };
    };

    let updatedPlugins = server.installedPlugins.concat([pluginId]);
    let updatedServer = {
      server with installedPlugins = updatedPlugins;
    };
    servers.add(serverId, updatedServer);
  };

  public shared ({ caller }) func removePluginFromServer(serverId : Text, pluginId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove plugins");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    if (server.owner != caller) {
      Runtime.trap("Unauthorized: Can only remove plugins from your own servers");
    };

    let updatedPlugins = server.installedPlugins.filter(func(id : Text) : Bool { id != pluginId });
    let updatedServer = {
      server with installedPlugins = updatedPlugins;
    };
    servers.add(serverId, updatedServer);
  };

  // Payment Processing
  public shared ({ caller }) func processStripePayment(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can process payments");
    };

    if (stripeConfig == null) { Runtime.trap("Stripe not configured") };
    if (items.size() != 1) { Runtime.trap("Can only buy one plan at a time") };

    await Stripe.createCheckoutSession(
      switch (stripeConfig) {
        case (null) { Runtime.trap("This cannot happen: Stripe configuration cannot be null here") };
        case (?conf) { conf };
      },
      caller,
      items,
      successUrl,
      cancelUrl,
      transform,
    );
  };

  public shared ({ caller }) func recordPayment(planId : Text, amount : Nat, stripeSessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record payments");
    };

    let paymentId = Nat.toText(payments.size() + 1);
    let payment : PaymentRecord = {
      id = paymentId;
      user = caller;
      planId;
      amount;
      timestamp = Time.now();
      stripeSessionId;
      status = "completed";
    };
    payments.add(paymentId, payment);
  };

  public query ({ caller }) func getMyPayments() : async [PaymentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view payments");
    };

    payments.values()
      .filter(func(p : PaymentRecord) : Bool { p.user == caller })
      .toArray();
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Incomplete integration: Stripe configuration is missing") };
      case (?conf) { await Stripe.getSessionStatus(conf, sessionId, transform) };
    };
  };

  // Admin Dashboard Functions
  public query ({ caller }) func getAllServers() : async [MinecraftServer] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all servers");
    };
    servers.values().toArray();
  };

  public query ({ caller }) func getAllPayments() : async [PaymentRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all payments");
    };
    payments.values().toArray();
  };

  public shared ({ caller }) func grantServerPermission(serverId : Text, user : Principal, canExecuteCommands : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can grant server permissions");
    };

    let server = switch (servers.get(serverId)) {
      case (null) { Runtime.trap("Server not found") };
      case (?s) { s };
    };

    let permission : ServerPermission = {
      serverId;
      user;
      canExecuteCommands;
      grantedBy = caller;
      grantedAt = Time.now();
    };

    let currentPermissions = switch (serverPermissions.get(serverId)) {
      case (null) { [] };
      case (?perms) { perms };
    };

    let updatedPermissions = currentPermissions.concat([permission]);
    serverPermissions.add(serverId, updatedPermissions);
  };

  public shared ({ caller }) func revokeServerPermission(serverId : Text, user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can revoke server permissions");
    };

    let currentPermissions = switch (serverPermissions.get(serverId)) {
      case (null) { Runtime.trap("No permissions found for this server") };
      case (?perms) { perms };
    };

    let updatedPermissions = currentPermissions.filter(func(p : ServerPermission) : Bool { p.user != user });
    serverPermissions.add(serverId, updatedPermissions);
  };

  public query ({ caller }) func getServerPermissions(serverId : Text) : async [ServerPermission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view server permissions");
    };

    switch (serverPermissions.get(serverId)) {
      case (null) { [] };
      case (?perms) { perms };
    };
  };

  public query ({ caller }) func getAllUsers() : async [Principal] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.keys().toArray();
  };

  // Implement missing Stripe functions
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Incomplete integration: Stripe configuration is missing") };
      case (?conf) {
        await Stripe.createCheckoutSession(conf, caller, items, successUrl, cancelUrl, transform);
      };
    };
  };
};
