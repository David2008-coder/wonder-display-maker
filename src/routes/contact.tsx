import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Gee-Bee Properties Concepts" },
      { name: "description", content: "Get in touch with Gee-Bee Properties Concepts in Lagos, Nigeria." },
    ],
  }),
});

function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <p className="text-xs tracking-widest text-gold mb-2">GET IN TOUCH</p>
      <h1 className="font-display text-5xl mb-10">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {[
          { icon: Phone, label: "Phone", value: "+234 803 678 7815", href: "tel:+2348036787815" },
          { icon: MessageCircle, label: "WhatsApp", value: "+234 803 678 7815", href: "https://wa.me/2348036787815" },
          { icon: Mail, label: "Email", value: "chriscage988@gmail.com", href: "mailto:chriscage988@gmail.com" },
          { icon: MapPin, label: "Address", value: "Ologolo, Lekki Peninsula II, Lekki 106104, Lagos, Nigeria" },
          { icon: Clock, label: "Hours", value: "Open 24 hours" },
        ].map((c) => (
          <div key={c.label} className="p-6 border border-border rounded-lg bg-card">
            <c.icon className="w-6 h-6 text-gold mb-3" />
            <div className="text-xs tracking-widest text-muted-foreground mb-1">{c.label.toUpperCase()}</div>
            {c.href ? (
              <a href={c.href} className="text-foreground hover:text-gold">{c.value}</a>
            ) : (
              <p className="text-foreground">{c.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg overflow-hidden border border-border h-80">
        <iframe
          title="Geebee Properties Location"
          src="https://www.google.com/maps?q=Ologolo,+Lekki+Peninsula+II,+Lagos,+Nigeria&output=embed"
          className="w-full h-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}
