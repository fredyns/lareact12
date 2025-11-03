import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LandingLayout from '@/layouts/landing-layout';
import { Link } from '@inertiajs/react';
import { Anchor, ArrowRight, Award, CheckCircle, Mail, MapPin, Phone, Shield, Ship } from 'lucide-react';
import { Suspense, lazy } from 'react';

// Lazy load non-critical sections
const ServicesSection = lazy(() => import('./sections/services-section'));
const WhyChooseUsSection = lazy(() => import('./sections/why-choose-us-section'));
const CtaSection = lazy(() => import('./sections/cta-section'));

// Loading skeleton for sections
function SectionSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
  );
}

export default function LandingHome() {
  return (
    <LandingLayout title="Maritime Survey & Classification Services">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bTAgMjRjMC02LjYyNyA1LjM3My0xMiAxMi0xMnMxMiA1LjM3MyAxMiAxMi01LjM3MyAxMi0xMiAxMi0xMi01LjM3My0xMi0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-700/50 px-4 py-2 backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Certified & Trusted Since 1964</span>
              </div>
              <h1 className="mb-6 text-5xl leading-tight font-bold md:text-6xl">
                Leading Maritime Survey & Classification Services
              </h1>
              <p className="mb-8 text-xl leading-relaxed text-blue-100">
                Ensuring maritime safety and compliance through comprehensive ship classification, statutory surveys,
                and technical consultancy services.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/landing/services">
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                    Our Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/landing/about">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    About Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-3xl"></div>
              <div className="relative rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
                <Ship className="mx-auto h-48 w-48 text-blue-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-900 md:text-5xl">60+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-900 md:text-5xl">5,000+</div>
              <div className="text-gray-600">Ships Surveyed</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-900 md:text-5xl">50+</div>
              <div className="text-gray-600">Countries Served</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-900 md:text-5xl">100%</div>
              <div className="text-gray-600">IACS Compliant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Overview - Lazy Loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <ServicesSection />
      </Suspense>

      {/* Why Choose Us - Lazy Loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <WhyChooseUsSection />
      </Suspense>

      {/* CTA Section - Lazy Loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <CtaSection />
      </Suspense>
    </LandingLayout>
  );
}
