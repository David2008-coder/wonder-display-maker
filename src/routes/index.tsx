import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard, type PropertyCardData } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Sparkles, ShieldCheck, Home as HomeIcon } from "lucide-react";
import hero from "@/assets/hero.jpg";
import cacCertificate from "@/assets/cac-certificate.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

async function fetchFeatured(): Promise<PropertyCardData[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("id, title, price, currency, location, bedrooms, bathrooms, area_sqm, property_type, status, property_media(url, media_type, display_order)")
    .order("created_at", { ascending: false })
    .limit(6);
  if (error) throw error;
  return (data ?? []).map((p: any) => {
    const sorted = (p.property_media ?? []).sort((a: any, b: any) => a.display_order - b.display_order);
    return { ...p, cover: sorted[0] ?? null };
  });
}

function HomePage() {
  const { data: properties = [] } = useQuery({ queryKey: ["featured"], queryFn: fetchFeatured });

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <img src={hero} alt="Luxury home" width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-gold/40 rounded-full text-xs text-gold tracking-widest mb-6">
              <Sparkles className="w-3 h-3" /> PREMIUM REAL ESTATE · LAGOS
            </div>
            <h1 className="font-display text-5xl sm:text-7xl text-foreground leading-[1.05]">
              Find your <span className="text-gradient-gold italic">precious</span> home.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Geebee Properties curates the finest residences across Lekki and beyond. Ready to satisfy you with a home of your choice.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/properties">
                <Button size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-luxe">
                  Browse Properties <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="tel:+2348036787815">
                <Button size="lg" variant="outline" className="border-gold/40 text-gold hover:bg-gold/10">
                  <Phone className="mr-2 w-4 h-4" /> Call Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid sm:grid-cols-3 gap-6">
        {[
          { icon: HomeIcon, title: "Curated Listings", text: "Hand-picked premium properties." },
          { icon: ShieldCheck, title: "Verified", text: "Every property is verified before listing." },
          { icon: Sparkles, title: "Concierge Service", text: "Personal guidance from inquiry to keys." },
        ].map((f) => (
          <div key={f.title} className="p-6 rounded-lg border border-border bg-card/50">
            <f.icon className="w-8 h-8 text-gold" />
            <h3 className="mt-4 font-display text-xl">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Certification */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-8">
          <p className="text-xs tracking-widest text-gold mb-2">OFFICIALLY REGISTERED</p>
          <h2 className="font-display text-4xl">Certificate of Registration</h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
            Gee-Bee Properties Concepts is a registered business under the Corporate Affairs Commission of the Federal Republic of Nigeria.
          </p>
        </div>
        <div className="rounded-2xl border border-gold/30 bg-card p-4 sm:p-8 shadow-luxe">
          <img
            src={cacCertificate}
            alt="Gee-Bee Properties Concepts CAC Certificate of Registration"
            className="w-full h-auto rounded-lg mx-auto max-w-2xl"
            loading="lazy"
          />
          <div className="mt-6 grid sm:grid-cols-3 gap-4 text-center text-sm">
            <div className="p-3 rounded-lg bg-background/40">
              <div className="text-xs tracking-widest text-gold mb-1">REG. NO.</div>
              <div className="font-medium">8832115</div>
            </div>
            <div className="p-3 rounded-lg bg-background/40">
              <div className="text-xs tracking-widest text-gold mb-1">BUSINESS</div>
              <div className="font-medium">Real Estate Activities</div>
            </div>
            <div className="p-3 rounded-lg bg-background/40">
              <div className="text-xs tracking-widest text-gold mb-1">REGISTERED</div>
              <div className="font-medium">17 September, 2025</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-widest text-gold mb-2">FEATURED</p>
            <h2 className="font-display text-4xl">Latest Properties</h2>
          </div>
          <Link to="/properties" className="text-sm text-gold hover:underline hidden sm:inline-flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {properties.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">No properties listed yet.</p>
            <Link to="/auth" className="text-gold hover:underline text-sm mt-2 inline-block">Sign in as admin to add listings</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
