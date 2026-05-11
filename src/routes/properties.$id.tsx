import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Maximize, MapPin, Phone, Mail, ArrowLeft, Play } from "lucide-react";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/properties/$id")({
  component: PropertyDetail,
});

async function fetchProperty(id: string) {
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_media(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

function PropertyDetail() {
  const { id } = Route.useParams();
  const { data: property, isLoading } = useQuery({ queryKey: ["property", id], queryFn: () => fetchProperty(id) });
  const [activeIdx, setActiveIdx] = useState(0);

  if (isLoading) return <div className="max-w-7xl mx-auto p-12 text-muted-foreground">Loading…</div>;
  if (!property) return <div className="max-w-7xl mx-auto p-12">Not found.</div>;

  const media = (property.property_media ?? []).sort((a: any, b: any) => a.display_order - b.display_order);
  const active = media[activeIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to properties
      </Link>

      {/* Gallery */}
      {media.length > 0 && (
        <div className="mb-8">
          <div className="aspect-video rounded-lg overflow-hidden bg-card border border-border mb-3">
            {active?.media_type === "video" ? (
              <video
                key={active.url}
                src={active.url}
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload"
                className="w-full h-full object-contain bg-black"
              >
                <source src={active.url} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            ) : active ? (
              <img src={active.url} alt={property.title} className="w-full h-full object-cover" />
            ) : null}
          </div>
          {media.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {media.map((m: any, i: number) => (
                <button
                  key={m.id}
                  onClick={() => setActiveIdx(i)}
                  className={`relative aspect-square rounded overflow-hidden border-2 ${i === activeIdx ? "border-gold" : "border-transparent"}`}
                >
                  {m.media_type === "video" ? (
                    <>
                      <video src={m.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                      <Play className="absolute inset-0 m-auto w-6 h-6 text-white" fill="currentColor" />
                    </>
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 mb-3">
            {property.property_type && <Badge className="bg-gold/10 text-gold border-gold/40">{property.property_type}</Badge>}
            <Badge variant={property.status === "available" ? "secondary" : "destructive"}>{property.status}</Badge>
          </div>
          <h1 className="font-display text-4xl mb-2">{property.title}</h1>
          {property.location && (
            <p className="flex items-center gap-2 text-muted-foreground mb-4"><MapPin className="w-4 h-4 text-gold" /> {property.location}</p>
          )}
          <div className="text-gradient-gold font-display text-4xl mb-6">{formatPrice(Number(property.price), property.currency)}</div>

          <div className="flex flex-wrap gap-6 py-4 border-y border-border mb-6">
            {property.bedrooms != null && <div className="flex items-center gap-2"><Bed className="w-5 h-5 text-gold" /> <span>{property.bedrooms} Beds</span></div>}
            {property.bathrooms != null && <div className="flex items-center gap-2"><Bath className="w-5 h-5 text-gold" /> <span>{property.bathrooms} Baths</span></div>}
            {property.area_sqm != null && <div className="flex items-center gap-2"><Maximize className="w-5 h-5 text-gold" /> <span>{property.area_sqm} m²</span></div>}
          </div>

          {property.description && (
            <div>
              <h2 className="font-display text-2xl mb-3">About this property</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{property.description}</p>
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 p-6 border border-border rounded-lg bg-card">
            <h3 className="font-display text-xl mb-4">Interested?</h3>
            <p className="text-sm text-muted-foreground mb-4">Speak with our team about this property.</p>
            <div className="space-y-3">
              <a href="tel:+2348036787815" className="block">
                <Button className="w-full bg-gradient-gold text-primary-foreground"><Phone className="w-4 h-4 mr-2" /> Call +234 803 678 7815</Button>
              </a>
              <a href={`mailto:chriscage988@gmail.com?subject=Inquiry about ${property.title}`} className="block">
                <Button variant="outline" className="w-full border-gold/40 text-gold"><Mail className="w-4 h-4 mr-2" /> Send Email</Button>
              </a>
              <a
                href={`https://wa.me/2348036787815?text=${encodeURIComponent(`Hi, I'm interested in: ${property.title}`)}`}
                target="_blank" rel="noreferrer" className="block"
              >
                <Button variant="outline" className="w-full">WhatsApp</Button>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
