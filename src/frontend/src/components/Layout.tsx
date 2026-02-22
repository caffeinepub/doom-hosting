import { useNavigate } from '@tanstack/react-router';
import { Server, Package, Shield, Home } from 'lucide-react';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  const currentYear = new Date().getFullYear();

  const appIdentifier = encodeURIComponent(window.location.hostname || 'doom-hosting');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/assets/generated/doom-hosting-logo.dim_400x120.png"
                alt="Doom Hosting"
                className="h-10 w-auto"
              />
            </button>

            <nav className="flex items-center gap-6">
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => navigate({ to: '/dashboard' })}
                    className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    <Server className="w-4 h-4" />
                    My Servers
                  </button>
                  <button
                    onClick={() => navigate({ to: '/plugins' })}
                    className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    Plugins
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => navigate({ to: '/admin' })}
                      className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </button>
                  )}
                </>
              )}
              <LoginButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>© {currentYear} Doom Hosting. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Built with</span>
              <span className="text-red-500">♥</span>
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
