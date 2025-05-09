
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, ShieldIcon } from "lucide-react";

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <ShieldIcon className="h-8 w-8 text-ghost-400 animate-pulse-shield" />
          <div className="flex flex-col">
            <Link to="/" className="text-xl font-bold tracking-tighter">GhostGuard AI</Link>
            <span className="text-xs text-muted-foreground">Real-Time AI Threat Protection</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:underline underline-offset-4">Home</Link>
          <Link to="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">Dashboard</Link>
          <Link to="/scan" className="text-sm font-medium hover:underline underline-offset-4">Scan</Link>
          <Link to="/threats" className="text-sm font-medium hover:underline underline-offset-4">Threats</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="default" className="bg-ghost-400 text-white hover:bg-ghost-500">
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
