import { ArrowRight, Play, Shield, Users, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeroProps {
  handleStartSession: () => void;
  loading: boolean;
}

export function Hero({ handleStartSession, loading }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 pt-20 pb-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Status Badge */}
              <div className="flex items-end gap-2">
                <img
                  src="/logo.png"
                  alt="ShareZilla Logo"
                  className="w-16 h-16"
                />
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  ShareZilla - Real-time Sharing
                </Badge>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl tracking-tight">
                  Share Files
                  <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {" "}
                    Instantly
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  Experience the fastest, most secure way to share files in
                  real-time. No uploads, no waiting, no limits. Just instant
                  peer-to-peer magic.
                </p>
              </div>

              {/* Key Stats */}
              <div className="flex gap-8 py-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-2xl mb-1">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <span>10GB/s</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Transfer Speed
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-2xl mb-1">
                    <Shield className="w-6 h-6 text-green-500" />
                    <span>256-bit</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Encryption</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-2xl mb-1">
                    <Users className="w-6 h-6 text-blue-500" />
                    <span>50K+</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="group px-8 py-6 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                  onClick={handleStartSession}
                  disabled={loading}
                >
                  Start Sharing Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg group"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-border/40">
                <p className="text-sm text-muted-foreground mb-4">
                  Trusted by teams at:
                </p>
                <div className="flex gap-8 opacity-60">
                  <div className="px-4 py-2 bg-muted rounded text-sm">
                    Microsoft
                  </div>
                  <div className="px-4 py-2 bg-muted rounded text-sm">
                    Google
                  </div>
                  <div className="px-4 py-2 bg-muted rounded text-sm">
                    Apple
                  </div>
                  <div className="px-4 py-2 bg-muted rounded text-sm">Meta</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative">
                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 bg-card border rounded-lg p-4 shadow-lg z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Online</span>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-lg p-4 shadow-lg z-10">
                  <div className="text-sm">P2P Ready</div>
                </div>

                {/* Main Image */}
                <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-8 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1533279443086-d1c19a186416?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxlJTIwc2hhcmluZyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU1MzY1MjQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="File sharing technology"
                    className="w-full h-80 object-cover rounded-xl"
                  />
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
