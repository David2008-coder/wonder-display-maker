import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Maximize, MapPin, Play } from "lucide-react";
import { formatPrice } from "@/lib/format";

export type PropertyCardData = {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  property_type: string | null;
  status: string;
  cover?: { url: string; media_type: string } | null;
};

export function PropertyCard({ property }: { property: PropertyCardData }) {
  return (
    <Link to="/properties/$id" params={{ id: property.id }} className="group">
      <Card className="overflow-hidden bg-card border-border hover:border-gold/60 transition-all duration-300 shadow-card hover:shadow-luxe">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {property.cover ? (
            property.cover.media_type === "video" ? (
              <>
                <video src={property.cover.url} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-12 h-12 text-gold" fill="currentColor" />
                </div>
              </>
            ) : (
              <img src={property.cover.url} alt={property.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.property_type && (
              <Badge className="bg-background/80 backdrop-blur text-gold border-gold/40">{property.property_type}</Badge>
            )}
            {property.status !== "available" && (
              <Badge variant="destructive">{property.status}</Badge>
            )}
          </div>
        </div>
        <div className="p-5">
          <div className="text-gradient-gold font-display text-2xl mb-1">{formatPrice(property.price, property.currency)}</div>
          <h3 className="font-display text-lg text-foreground line-clamp-1">{property.title}</h3>
          {property.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" /> {property.location}
            </div>
          )}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            {property.bedrooms != null && <span className="flex items-center gap-1"><Bed className="w-4 h-4 text-gold" /> {property.bedrooms}</span>}
            {property.bathrooms != null && <span className="flex items-center gap-1"><Bath className="w-4 h-4 text-gold" /> {property.bathrooms}</span>}
            {property.area_sqm != null && <span className="flex items-center gap-1"><Maximize className="w-4 h-4 text-gold" /> {property.area_sqm} m²</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
