import { Button } from '@/components/ui/button';

export default function CtaSection() {
  return (
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
  );
}
