import { Link } from '@inertiajs/react';
import LandingLayout from '@/layouts/landing-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Anchor,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  Container,
  FileCheck,
  Fuel,
  Gauge,
  Globe,
  Radio,
  Shield,
  Ship,
  Users,
  Waves,
  Wrench,
} from 'lucide-react';

export default function LandingServices() {
  return (
    <LandingLayout title="Our Services - Maritime Survey & Classification">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 to-blue-700 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">Comprehensive Maritime Services</h1>
            <p className="text-xl leading-relaxed text-blue-100">
              From ship classification to statutory surveys, we provide end-to-end solutions for maritime safety,
              compliance, and operational excellence.
            </p>
          </div>
        </div>
      </div>

      {/* Main Services Tabs */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="classification" className="w-full">
            <TabsList className="mb-12 grid h-auto w-full grid-cols-1 md:grid-cols-3">
              <TabsTrigger value="classification" className="py-4 text-lg">
                <Ship className="mr-2 h-5 w-5" />
                Ship Classification
              </TabsTrigger>
              <TabsTrigger value="statutory" className="py-4 text-lg">
                <Shield className="mr-2 h-5 w-5" />
                Statutory Surveys
              </TabsTrigger>
              <TabsTrigger value="consultancy" className="py-4 text-lg">
                <Award className="mr-2 h-5 w-5" />
                Technical Consultancy
              </TabsTrigger>
            </TabsList>

            {/* Ship Classification Tab */}
            <TabsContent value="classification" className="space-y-12">
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div>
                  <h2 className="mb-6 text-4xl font-bold text-gray-900">Ship Classification Services</h2>
                  <p className="mb-6 text-lg text-gray-600">
                    Our classification services ensure that vessels meet international standards for structural
                    integrity, machinery reliability, and safety systems throughout their operational life.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">New Building Surveys</h3>
                        <p className="text-gray-600">Complete supervision from keel laying to delivery</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Periodic Surveys</h3>
                        <p className="text-gray-600">Annual, intermediate, and special surveys</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Plan Approval</h3>
                        <p className="text-gray-600">Review and approval of technical drawings and specifications</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-t-4 border-t-blue-600">
                    <CardHeader>
                      <Anchor className="mb-2 h-8 w-8 text-blue-600" />
                      <CardTitle className="text-lg">Hull Structure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Comprehensive hull inspection and structural integrity assessment
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-green-600">
                    <CardHeader>
                      <Gauge className="mb-2 h-8 w-8 text-green-600" />
                      <CardTitle className="text-lg">Machinery</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Main and auxiliary machinery systems evaluation</p>
                    </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-purple-600">
                    <CardHeader>
                      <Radio className="mb-2 h-8 w-8 text-purple-600" />
                      <CardTitle className="text-lg">Electrical</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Electrical systems and automation verification</p>
                    </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-orange-600">
                    <CardHeader>
                      <Fuel className="mb-2 h-8 w-8 text-orange-600" />
                      <CardTitle className="text-lg">Special Systems</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Cargo handling, ballast, and safety systems</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-8">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">Classification Notations</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <h4 className="mb-3 font-semibold text-gray-900">Vessel Types</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Cargo Ships</li>
                      <li>• Tankers</li>
                      <li>• Passenger Vessels</li>
                      <li>• Offshore Units</li>
                      <li>• Special Purpose Ships</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold text-gray-900">Additional Notations</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Ice Class</li>
                      <li>• Dynamic Positioning</li>
                      <li>• Green Passport</li>
                      <li>• Cyber Security</li>
                      <li>• LNG Ready</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold text-gray-900">Service Notations</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Coastal Service</li>
                      <li>• Unrestricted Service</li>
                      <li>• Short International</li>
                      <li>• Domestic Service</li>
                      <li>• Special Trade</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Statutory Surveys Tab */}
            <TabsContent value="statutory" className="space-y-12">
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div className="order-2 md:order-1">
                  <div className="grid gap-4">
                    <Card className="border-l-4 border-l-blue-600">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <FileCheck className="h-6 w-6 text-blue-600" />
                          <CardTitle>SOLAS Certificates</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-gray-600">
                          Safety of Life at Sea convention compliance surveys and certification
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Passenger Ship Safety Certificate</li>
                          <li>• Cargo Ship Safety Equipment Certificate</li>
                          <li>• Cargo Ship Safety Radio Certificate</li>
                          <li>• Cargo Ship Safety Construction Certificate</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-600">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Waves className="h-6 w-6 text-green-600" />
                          <CardTitle>Load Line Surveys</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-gray-600">
                          International Load Line Convention compliance and certification
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Initial Load Line Survey</li>
                          <li>• Annual Load Line Survey</li>
                          <li>• Load Line Renewal Survey</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-600">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Container className="h-6 w-6 text-purple-600" />
                          <CardTitle>Tonnage Measurement</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          Gross and net tonnage calculation and certification according to International Tonnage
                          Convention
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h2 className="mb-6 text-4xl font-bold text-gray-900">Statutory Survey Services</h2>
                  <p className="mb-6 text-lg text-gray-600">
                    As a Recognized Organization (RO), we conduct statutory surveys on behalf of flag state
                    administrations to ensure compliance with international maritime conventions.
                  </p>
                  <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
                    <h3 className="mb-3 font-semibold text-blue-900">Authorized by Flag States</h3>
                    <p className="mb-4 text-blue-800">
                      We are authorized to issue statutory certificates on behalf of multiple flag states including:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-sm text-blue-900">Indonesia</span>
                      <span className="rounded-full bg-white px-3 py-1 text-sm text-blue-900">Panama</span>
                      <span className="rounded-full bg-white px-3 py-1 text-sm text-blue-900">Singapore</span>
                      <span className="rounded-full bg-white px-3 py-1 text-sm text-blue-900">Liberia</span>
                      <span className="rounded-full bg-white px-3 py-1 text-sm text-blue-900">Marshall Islands</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">ISM/ISPS Code Certification</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">MARPOL Compliance Surveys</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">MLC 2006 Certification</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">BWM Convention Surveys</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Technical Consultancy Tab */}
            <TabsContent value="consultancy" className="space-y-12">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-4xl font-bold text-gray-900">Technical Consultancy Services</h2>
                <p className="mx-auto max-w-3xl text-xl text-gray-600">
                  Expert technical support and consultancy services to optimize your maritime operations and ensure
                  regulatory compliance
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <Wrench className="mb-3 h-10 w-10 text-blue-600" />
                    <CardTitle>Damage Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-600">
                      Comprehensive damage surveys and repair recommendations for vessels
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Collision damage assessment</li>
                      <li>• Grounding surveys</li>
                      <li>• Machinery breakdown analysis</li>
                      <li>• Repair specification development</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <ClipboardCheck className="mb-3 h-10 w-10 text-green-600" />
                    <CardTitle>Condition Surveys</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-600">
                      Pre-purchase and condition assessment surveys for vessel transactions
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Pre-purchase surveys</li>
                      <li>• Valuation surveys</li>
                      <li>• On/Off hire surveys</li>
                      <li>• Condition monitoring</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <BookOpen className="mb-3 h-10 w-10 text-purple-600" />
                    <CardTitle>Technical Training</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-600">Professional training programs for maritime personnel</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• ISM/ISPS implementation</li>
                      <li>• Safety management systems</li>
                      <li>• Technical workshops</li>
                      <li>• Regulatory updates</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <Users className="mb-3 h-10 w-10 text-orange-600" />
                    <CardTitle>Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-600">Comprehensive risk analysis and mitigation strategies</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Operational risk assessment</li>
                      <li>• Safety audits</li>
                      <li>• FSA (Formal Safety Assessment)</li>
                      <li>• Risk management plans</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <Globe className="mb-3 h-10 w-10 text-cyan-600" />
                    <CardTitle>Retrofit & Conversion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-600">Technical support for vessel modifications and upgrades</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Conversion feasibility studies</li>
                      <li>• Scrubber installation</li>
                      <li>• Ballast water treatment systems</li>
                      <li>• Energy efficiency upgrades</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <Award className="mb-3 h-10 w-10 text-pink-600" />
                    <CardTitle>Regulatory Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-600">Expert guidance on maritime regulations and standards</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• IMO regulations interpretation</li>
                      <li>• Flag state requirements</li>
                      <li>• Port state control preparation</li>
                      <li>• Compliance audits</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Additional Services */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Additional Services</h2>
            <p className="text-lg text-gray-600">Specialized services to meet diverse maritime industry needs</p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Ship className="mx-auto mb-3 h-12 w-12 text-blue-600" />
                <CardTitle className="text-lg">Offshore Units</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Classification and certification of offshore installations and mobile units
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Container className="mx-auto mb-3 h-12 w-12 text-green-600" />
                <CardTitle className="text-lg">Container Surveys</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Container inspection and certification services for cargo safety
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Anchor className="mx-auto mb-3 h-12 w-12 text-purple-600" />
                <CardTitle className="text-lg">Materials Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Laboratory testing and material certification services</p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Shield className="mx-auto mb-3 h-12 w-12 text-orange-600" />
                <CardTitle className="text-lg">Cyber Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Maritime cyber security assessment and certification</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Need More Information About Our Services?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Our technical team is ready to discuss your specific requirements and provide tailored solutions
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/landing/home">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                Contact Our Team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Download Service Catalog
            </Button>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
