
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ShieldAnimation from '@/components/ShieldAnimation';
import { Check, ShieldAlert, Link as LinkIcon, Search } from 'lucide-react';

const Index = () => {
  return (
    <div className="dark">
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden gradient-bg py-20">
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
        <div className="container px-4 md:px-6 space-y-16 relative z-10">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            <div className="space-y-6 text-center lg:text-left lg:w-1/2">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white">
                  GhostGuard <span className="text-ghost-400">AI</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/80 max-w-[800px]">
                  The real-time AI firewall between you and the dark web.™
                </p>
              </div>
              <p className="text-muted-foreground md:text-lg max-w-[600px] mx-auto lg:mx-0">
                Protecting your digital life with advanced AI-powered phishing and malicious link detection across browsers, emails, and APIs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button size="lg" className="bg-ghost-400 hover:bg-ghost-500">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    <span>View Dashboard</span>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-ghost-400 text-ghost-400 hover:bg-ghost-400/10">
                  <Link to="/scan" className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    <span>Scan URL</span>
                  </Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 flex items-center justify-center">
              <ShieldAnimation size="lg" className="pointer-events-none" />
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">Cutting-Edge Protection</h2>
              <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
                Our AI-powered system uses advanced transformer models and heuristics to detect threats in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glassmorphism rounded-xl p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-ghost-400/20 text-ghost-400 flex items-center justify-center">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Real-time Detection</h3>
                <p className="text-muted-foreground">
                  Instantly identify phishing attempts, malicious URLs, and suspicious content before damage occurs.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glassmorphism rounded-xl p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-ghost-400/20 text-ghost-400 flex items-center justify-center">
                  <LinkIcon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Universal Protection</h3>
                <p className="text-muted-foreground">
                  Works across browsers, email clients, and custom applications through our robust API.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glassmorphism rounded-xl p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-ghost-400/20 text-ghost-400 flex items-center justify-center">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Threat Intelligence</h3>
                <p className="text-muted-foreground">
                  Advanced scoring system categorizes threats by severity so you know what needs immediate attention.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="glassmorphism rounded-2xl p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">Start Protecting Your Digital Life Today</h2>
            <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
              Join thousands of users who trust GhostGuard AI to shield them from online threats.
            </p>
            <Button size="lg" className="bg-ghost-400 hover:bg-ghost-500">
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
