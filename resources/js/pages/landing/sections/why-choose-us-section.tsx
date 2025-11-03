import { Button } from '@/components/ui/button';
import { Anchor, Award, Mail, MapPin, Phone, Shield } from 'lucide-react';

export default function WhyChooseUsSection() {
  return (
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
  );
}
