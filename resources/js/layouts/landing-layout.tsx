import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { Menu, Ship, X } from 'lucide-react';
import { useState } from 'react';

interface LandingLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function LandingLayout({ children, title }: LandingLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/landing/home' },
    { name: 'Services', href: '/landing/services' },
    { name: 'About Us', href: '/landing/about' },
  ];

  return (
    <>
      <Head title={title} />

      {/* Top Navbar */}
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/landing/home"
              className="flex items-center gap-2 text-xl font-bold text-blue-900 transition-colors hover:text-blue-700"
            >
              <Ship className="h-8 w-8" />
              <span className="hidden sm:inline">Marine Survey</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'font-medium text-gray-700 transition-colors hover:text-blue-600',
                    'relative after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5',
                    'after:scale-x-0 after:bg-blue-600 after:transition-transform hover:after:scale-x-100',
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Login Button - Desktop */}
            <div className="hidden md:block">
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700">Login</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 transition-colors hover:text-blue-600 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="border-t border-gray-200 py-4 md:hidden">
              <div className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-2 py-1 font-medium text-gray-700 transition-colors hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Login</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content with top padding for fixed navbar */}
      <main className="pt-16">{children}</main>

      {/* Floating Login Button - Mobile/Tablet */}
      <Link href="/login" className="md:hidden">
        <Button
          size="lg"
          className="fixed right-6 bottom-6 z-40 h-14 w-14 rounded-full bg-blue-600 p-0 shadow-2xl hover:bg-blue-700"
        >
          <span className="sr-only">Login</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </Button>
      </Link>

      {/* Footer */}
      <footer className="mt-20 bg-gray-900 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xl font-bold">
                <Ship className="h-6 w-6" />
                <span>Marine Survey</span>
              </div>
              <p className="text-sm text-gray-400">
                Leading classification society providing comprehensive maritime services since 1964.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="transition-colors hover:text-white">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Ship Classification</li>
                <li>Statutory Surveys</li>
                <li>Technical Consultancy</li>
                <li>Offshore Units</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Jakarta, Indonesia</li>
                <li>+62 21 4200 5000</li>
                <li>info@marinesurvey.co.id</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Marine Survey & Classification. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
