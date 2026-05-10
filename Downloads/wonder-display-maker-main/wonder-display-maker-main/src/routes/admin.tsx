import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Image as ImageIcon, Video as VideoIcon, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Property = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  location: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  property_type: string | null;
  status: string;
  property_media?: { id: string; url: string; storage_path: string | null; media_type: string }[];
};

const empty = {
  title: "",
  description: "",
  price: "",
  currency: "NGN",
  location: "",
  bedrooms: "",
  bathrooms: "",
  area_sqm: "",
  property_type: "",
  status: "available",
};

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/auth" });
        return;
      }
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!role);
      setAuthChecked(true);
    })();
  }, [navigate]);

  const { data: properties = [], refetch } = useQuery({
    queryKey: ["admin-properties"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*, property_media(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
  });

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setFiles([]);
    setOpenDialog(true);
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description ?? "",
      price: String(p.price),
      currency: p.currency,
      location: p.location ?? "",
      bedrooms: p.bedrooms?.toString() ?? "",
      bathrooms: p.bathrooms?.toString() ?? "",
      area_sqm: p.area_sqm?.toString() ?? "",
      property_type: p.property_type ?? "",
      status: p.status,
    });
    setFiles([]);
    setOpenDialog(true);
  };

  const save = async () => {
    if (!form.title || !form.price) {
      toast.error("Title and price are required.");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        title: form.title,
        description: form.description || null,
        price: Number(form.price),
        currency: form.currency || "NGN",
        location: form.location || null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
        property_type: form.property_type || null,
        status: form.status,
        created_by: user?.id ?? null,
      };

      let propertyId = editing?.id;
      if (editing) {
        const { error } = await supabase.from("properties").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("properties").insert(payload).select("id").single();
        if (error) throw error;
        propertyId = data.id;
      }

      // Upload files
      if (files.length && propertyId) {
        const existing = editing?.property_media?.length ?? 0;
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const isVideo = f.type.startsWith("video/");
          const bucket = isVideo ? "property-videos" : "property-images";
          const ext = f.name.split(".").pop();
          const path = `${propertyId}/${Date.now()}-${i}.${ext}`;
          const { error: upErr } = await supabase.storage.from(bucket).upload(path, f, { cacheControl: "3600", upsert: false });
          if (upErr) throw upErr;
          const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
          const { error: mErr } = await supabase.from("property_media").insert({
            property_id: propertyId,
            media_type: isVideo ? "video" : "image",
            url: publicUrl,
            storage_path: `${bucket}/${path}`,
            display_order: existing + i,
          });
          if (mErr) throw mErr;
        }
      }

      toast.success(editing ? "Property updated." : "Property added.");
      setOpenDialog(false);
      qc.invalidateQueries({ queryKey: ["admin-properties"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["featured"] });
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const removeProperty = async (p: Property) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    // delete storage objects
    for (const m of p.property_media ?? []) {
      if (m.storage_path) {
        const [bucket, ...rest] = m.storage_path.split("/");
        await supabase.storage.from(bucket).remove([rest.join("/")]);
      }
    }
    const { error } = await supabase.from("properties").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted.");
      refetch();
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["featured"] });
    }
  };

  const removeMedia = async (mediaId: string, storagePath: string | null) => {
    if (storagePath) {
      const [bucket, ...rest] = storagePath.split("/");
      await supabase.storage.from(bucket).remove([rest.join("/")]);
    }
    await supabase.from("property_media").delete().eq("id", mediaId);
    refetch();
    if (editing) {
      const updated = properties.find((p) => p.id === editing.id);
      if (updated) setEditing(updated);
    }
  };

  if (!authChecked) return <div className="p-12 text-muted-foreground">Loading…</div>;
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-gold mb-2">Not authorized</h1>
        <p className="text-muted-foreground mb-6">Your account does not have admin privileges.</p>
        <Link to="/" className="text-gold hover:underline">Go home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-widest text-gold mb-1">DASHBOARD</p>
          <h1 className="font-display text-4xl">Manage Properties</h1>
        </div>
        <Button onClick={openNew} className="bg-gradient-gold text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Property</Button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No properties yet.</p>
          <Button onClick={openNew} variant="outline" className="border-gold/40 text-gold">Add your first property</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p) => {
            const cover = p.property_media?.[0];
            return (
              <div key={p.id} className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="aspect-video bg-secondary relative">
                  {cover ? (
                    cover.media_type === "video"
                      ? <video src={cover.url} className="w-full h-full object-cover" muted />
                      : <img src={cover.url} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No media</div>}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg line-clamp-1">{p.title}</h3>
                  <p className="text-gold text-sm">{formatPrice(Number(p.price), p.currency)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.property_media?.length ?? 0} media · {p.status}</p>
                  <div className="flex gap-2 mt-3">
                    <Button onClick={() => openEdit(p)} size="sm" variant="outline" className="flex-1"><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                    <Button onClick={() => removeProperty(p)} size="sm" variant="destructive"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Property" : "New Property"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="4 Bedroom Detached Duplex" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="150000000" />
              </div>
              <div>
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lekki Phase 1, Lagos" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Bedrooms</Label><Input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} /></div>
              <div><Label>Bathrooms</Label><Input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} /></div>
              <div><Label>Area (m²)</Label><Input type="number" value={form.area_sqm} onChange={(e) => setForm({ ...form, area_sqm: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Input value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} placeholder="Duplex, Apartment, Land…" />
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            {editing && editing.property_media && editing.property_media.length > 0 && (
              <div>
                <Label>Existing media</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {editing.property_media.map((m) => (
                    <div key={m.id} className="relative group aspect-square rounded overflow-hidden border border-border">
                      {m.media_type === "video"
                        ? <video src={m.url} className="w-full h-full object-cover" muted />
                        : <img src={m.url} alt="" className="w-full h-full object-cover" />}
                      <button
                        type="button"
                        onClick={() => removeMedia(m.id, m.storage_path)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                        aria-label="Delete media"
                      >
                        <Trash2 className="w-5 h-5 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Add photos & videos</Label>
              <label className="mt-2 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-gold/60">
                <Upload className="w-5 h-5 text-gold" />
                <span className="text-sm text-muted-foreground">Click to select files (images or videos)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
              </label>
              {files.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {f.type.startsWith("video/") ? <VideoIcon className="w-3 h-3 text-gold" /> : <ImageIcon className="w-3 h-3 text-gold" />}
                      {f.name} <span>({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={save} disabled={saving} className="bg-gradient-gold text-primary-foreground">
              {saving ? "Saving…" : editing ? "Update Property" : "Create Property"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
