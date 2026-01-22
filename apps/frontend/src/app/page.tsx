"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building, Users, Receipt, ArrowRight } from "lucide-react";
import { APP_NAME } from "@nestject/shared";
import { authClient } from "@/lib/auth-client";

export default function LandingPage() {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Building className="h-6 w-6" />
          <span>{APP_NAME}</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="#features" className="hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="#pricing" className="hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link href="#about" className="hover:underline underline-offset-4">
            About
          </Link>
        </nav>
        <div className="flex gap-4">
          {session ? (
            <Link href="/properties">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center space-y-8 bg-zinc-50 dark:bg-zinc-950">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl max-w-4xl mx-auto">
            Manage your apartments with{" "}
            <span className="text-primary">ease</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The all-in-one platform for landlords and property managers. Track
            tenants, automate billing, and gain insights instantly.
          </p>
          <div className="flex justify-center gap-4">
            {session ? (
              <Link href="/properties">
                <Button size="lg" className="h-12 px-8">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8">
                  Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/properties">
              <Button size="lg" variant="outline" className="h-12 px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Tenant Management</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Keep track of all your tenants, leases, and contact information
                in one secure place.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Receipt className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Automated Billing</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Generate monthly invoices automatically based on electricity and
                water usage.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Building className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Property Insights</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                View occupancy rates, revenue reports, and maintenance requests
                at a glance.
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t text-center text-sm text-muted-foreground">
        <p>© 2026 {APP_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}
