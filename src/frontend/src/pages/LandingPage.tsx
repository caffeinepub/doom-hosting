import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Server, Zap, Shield, Package } from 'lucide-react';
import PricingPlans from '../components/PricingPlans';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function LandingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative py-24 px-4 overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/generated/hero-background.dim_1920x600.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Professional Minecraft
              <span className="block text-primary mt-2">Server Hosting</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Create your own Minecraft server in seconds. Choose from free or premium plans with automatic provisioning
              and full plugin support.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Button size="lg" onClick={() => navigate({ to: '/dashboard' })} className="gap-2">
                  <Server className="w-5 h-5" />
                  Go to Dashboard
                </Button>
              ) : (
                <Button size="lg" onClick={() => navigate({ to: '/' })} className="gap-2">
                  <Zap className="w-5 h-5" />
                  Get Started Free
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Setup</h3>
              <p className="text-muted-foreground">
                Your server is provisioned automatically after selecting a plan. Start playing in minutes.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Plugin Support</h3>
              <p className="text-muted-foreground">
                Browse and install plugins just like Aternos. Customize your server with ease.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Professional hosting with .net domains and secure payment processing via Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground">
              Start free or upgrade for more power and performance
            </p>
          </div>
          <PricingPlans />
        </div>
      </section>
    </div>
  );
}
