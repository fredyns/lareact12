import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LandingLayout from '@/layouts/landing-layout';
import { Link } from '@inertiajs/react';
import { Anchor, ArrowRight, Award, CheckCircle, Mail, MapPin, Phone, Shield, Ship } from 'lucide-react';

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

      {/* Services Overview */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Our Core Services</h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Comprehensive maritime solutions tailored to meet international standards and regulations
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-t-4 border-t-blue-600 transition-shadow duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Ship className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Ship Classification</CardTitle>
                <CardDescription>Complete classification services for new builds and existing vessels</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-600">Hull & Machinery Classification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-600">Plan Approval & Review</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-600">Construction Supervision</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-600 transition-shadow duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Statutory Surveys</CardTitle>
                <CardDescription>Mandatory surveys on behalf of flag state administrations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-600">SOLAS Compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-600">Load Line Surveys</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-600">ISM/ISPS Certification</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-purple-600 transition-shadow duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Technical Consultancy</CardTitle>
                <CardDescription>Expert advice and technical support for maritime operations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-600">Risk Assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-600">Damage Surveys</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-600">Retrofit & Conversion</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link href="/landing/services">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold text-gray-900">Why Choose Us</h2>
              <p className="mb-8 text-lg text-gray-600">
                As a leading classification society, we provide unparalleled expertise and commitment to maritime safety
                and excellence.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">IACS Member</h3>
                    <p className="text-gray-600">
                      Full member of International Association of Classification Societies
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">Global Recognition</h3>
                    <p className="text-gray-600">Recognized by major flag states and port authorities worldwide</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
                    <Anchor className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">Expert Surveyors</h3>
                    <p className="text-gray-600">Highly qualified and experienced maritime surveyors and engineers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rotate-3 transform rounded-3xl bg-blue-200"></div>
              <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
                <h3 className="mb-6 text-2xl font-bold">Get Started Today</h3>
                <p className="mb-6">
                  Contact us for a consultation and discover how we can support your maritime operations.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5" />
                    <span>+62 21 4200 5000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5" />
                    <span>info@maritimesurvey.co.id</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5" />
                    <span>Jakarta, Indonesia</span>
                  </div>
                </div>
                <Button className="mt-6 w-full bg-white text-blue-600 hover:bg-blue-50">Contact Us Now</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Ensure Your Vessel's Compliance?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Let our expert team guide you through classification and certification processes
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              Request a Quote
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Download Brochure
            </Button>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
