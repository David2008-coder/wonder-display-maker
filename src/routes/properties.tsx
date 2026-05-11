import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard, type PropertyCardData } from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/properties")({
  component: PropertiesPage,
});

async function fetchAll(): Promise<PropertyCardData[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("id, title, price, currency, location, bedrooms, bathrooms, area_sqm, property_type, status, property_media(url, media_type, display_order)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => {
    const sorted = (p.property_media ?? []).sort((a: any, b: any) => a.display_order - b.display_order);
    return { ...p, cover: sorted[0] ?? null };
  });
}

function PropertiesPage() {
  const { data: properties = [], isLoading } = useQuery({ queryKey: ["properties"], queryFn: fetchAll });
  const [q, setQ] = useState("");

  const filtered = properties.filter((p) => {
    const text = `${p.title} ${p.location ?? ""} ${p.property_type ?? ""}`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-widest text-gold mb-2">EXPLORE</p>
        <h1 className="font-display text-4xl sm:text-5xl">All Properties</h1>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, location, type…" className="pl-10" />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">No properties found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  );
}
