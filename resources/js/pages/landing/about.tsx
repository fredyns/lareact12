import { Link } from '@inertiajs/react';
import LandingLayout from '@/layouts/landing-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Anchor,
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  CheckCircle,
  Eye,
  Globe,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  Ship,
  Target,
  Users,
} from 'lucide-react';

export default function LandingAbout() {
  return (
    <LandingLayout title="About Us - Maritime Survey & Classification">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 to-blue-700 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-700/50 px-4 py-2 backdrop-blur-sm">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Established 1964</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">About Our Company</h1>
            <p className="text-xl leading-relaxed text-blue-100">
              Six decades of excellence in maritime safety, classification, and technical services
            </p>
          </div>
        </div>
      </div>

      {/* Company Overview */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-20 grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold text-gray-900">Who We Are</h2>
              <p className="mb-6 text-lg leading-relaxed text-gray-600">
                We are a leading classification society and recognized organization providing comprehensive maritime
                services to ensure the safety, reliability, and environmental compliance of vessels and offshore
                installations worldwide.
              </p>
              <p className="mb-6 text-lg leading-relaxed text-gray-600">
                As a full member of the International Association of Classification Societies (IACS), we maintain the
                highest standards of technical expertise and regulatory compliance, serving the global maritime industry
                with integrity and professionalism.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="mb-1 text-3xl font-bold text-blue-900">60+</div>
                  <div className="text-sm text-gray-600">Years of Experience</div>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <div className="mb-1 text-3xl font-bold text-green-900">5,000+</div>
                  <div className="text-sm text-gray-600">Ships Surveyed</div>
                </div>
                <div className="rounded-xl bg-purple-50 p-4">
                  <div className="mb-1 text-3xl font-bold text-purple-900">50+</div>
                  <div className="text-sm text-gray-600">Countries Served</div>
                </div>
                <div className="rounded-xl bg-orange-50 p-4">
                  <div className="mb-1 text-3xl font-bold text-orange-900">500+</div>
                  <div className="text-sm text-gray-600">Expert Surveyors</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 -rotate-3 transform rounded-3xl bg-blue-200"></div>
              <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-12">
                <Ship className="mx-auto h-64 w-64 text-white/20" />
              </div>
            </div>
          </div>

          {/* Mission, Vision, Values */}
          <div className="mb-20 grid gap-8 md:grid-cols-3">
            <Card className="border-t-4 border-t-blue-600">
              <CardHeader>
                <Target className="mb-4 h-12 w-12 text-blue-600" />
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-gray-600">
                  To provide world-class classification and certification services that enhance maritime safety, protect
                  the maritime environment, and support the sustainable development of the maritime industry.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-600">
              <CardHeader>
                <Eye className="mb-4 h-12 w-12 text-green-600" />
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-gray-600">
                  To be the most trusted and innovative classification society, recognized globally for technical
                  excellence, reliability, and commitment to advancing maritime safety and environmental protection.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-purple-600">
              <CardHeader>
                <Heart className="mb-4 h-12 w-12 text-purple-600" />
                <CardTitle className="text-2xl">Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>Integrity & Independence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>Technical Excellence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>Customer Focus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>Innovation & Sustainability</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Our Journey</h2>
            <p className="text-xl text-gray-600">Six decades of growth and innovation in maritime services</p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                    1964
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Foundation</h3>
                  <p className="text-gray-600">
                    Established as a national classification society to support the growing maritime industry and ensure
                    vessel safety standards.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 font-bold text-white">
                    1985
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">IACS Membership</h3>
                  <p className="text-gray-600">
                    Achieved full membership status in the International Association of Classification Societies,
                    marking our commitment to international standards.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
                    2000
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Global Expansion</h3>
                  <p className="text-gray-600">
                    Expanded operations internationally with offices in major maritime hubs across Asia, Europe, and the
                    Middle East.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 font-bold text-white">
                    2015
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Digital Transformation</h3>
                  <p className="text-gray-600">
                    Launched digital survey systems and online services, enhancing efficiency and customer experience
                    through technology innovation.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-600 font-bold text-white">
                    2024
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Sustainability Leadership</h3>
                  <p className="text-gray-600">
                    Leading the industry in green shipping initiatives, alternative fuel assessments, and environmental
                    compliance services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accreditations & Memberships */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Accreditations & Memberships</h2>
            <p className="text-xl text-gray-600">Recognized and trusted by international maritime authorities</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Award className="mx-auto mb-3 h-16 w-16 text-blue-600" />
                <CardTitle>IACS Member</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Full member of International Association of Classification Societies
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Shield className="mx-auto mb-3 h-16 w-16 text-green-600" />
                <CardTitle>ISO Certified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">ISO 9001:2015 Quality Management System certified</p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Globe className="mx-auto mb-3 h-16 w-16 text-purple-600" />
                <CardTitle>Flag State RO</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Recognized Organization for 30+ flag state administrations</p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Anchor className="mx-auto mb-3 h-16 w-16 text-orange-600" />
                <CardTitle>IMO Recognized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Recognized by International Maritime Organization</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Global Presence */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold text-gray-900">Global Presence</h2>
              <p className="mb-8 text-lg text-gray-600">
                With offices and surveyors stationed in major ports worldwide, we provide 24/7 support to our clients
                wherever they operate.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Regional Offices</h3>
                    <p className="text-gray-600">15 regional offices across Asia, Europe, Middle East, and Africa</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Survey Stations</h3>
                    <p className="text-gray-600">100+ survey stations in major ports and shipbuilding centers</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Global Network</h3>
                    <p className="text-gray-600">Serving clients in over 50 countries with local expertise</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <h3 className="mb-6 text-2xl font-bold text-gray-900">Key Regions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                  <span className="font-semibold text-gray-900">Southeast Asia</span>
                  <span className="font-bold text-blue-600">8 Offices</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                  <span className="font-semibold text-gray-900">East Asia</span>
                  <span className="font-bold text-blue-600">4 Offices</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                  <span className="font-semibold text-gray-900">Middle East</span>
                  <span className="font-bold text-blue-600">2 Offices</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                  <span className="font-semibold text-gray-900">Europe</span>
                  <span className="font-bold text-blue-600">1 Office</span>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
                <h4 className="mb-4 font-bold">Headquarters</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5" />
                    <span>Jakarta, Indonesia</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5" />
                    <span>+62 21 4200 5000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5" />
                    <span>info@maritimesurvey.co.id</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Our Expert Team</h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Highly qualified professionals dedicated to maritime safety and excellence
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="transition-shadow hover:shadow-xl">
              <CardHeader>
                <Briefcase className="mb-4 h-12 w-12 text-blue-600" />
                <CardTitle>Maritime Surveyors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  500+ certified maritime surveyors with extensive experience in ship classification and statutory surveys
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Naval Architecture expertise</li>
                  <li>• Maritime Engineering specialists</li>
                  <li>• Electrical & Automation engineers</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-xl">
              <CardHeader>
                <GraduationCap className="mb-4 h-12 w-12 text-green-600" />
                <CardTitle>Technical Experts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Specialized technical team providing consultancy and support for complex maritime challenges
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Structural analysis specialists</li>
                  <li>• Materials & welding experts</li>
                  <li>• Environmental compliance advisors</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-xl">
              <CardHeader>
                <Users className="mb-4 h-12 w-12 text-purple-600" />
                <CardTitle>Support Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Dedicated support team ensuring seamless service delivery and customer satisfaction
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Customer service representatives</li>
                  <li>• Technical documentation team</li>
                  <li>• IT & digital services support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Join Our Growing List of Satisfied Clients</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Experience the difference of working with a trusted classification society
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/landing/services">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                Explore Our Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/landing/home">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
