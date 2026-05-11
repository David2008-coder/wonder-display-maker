import { Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Menu, X, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";

export function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <div className="bg-gold text-background font-bold text-center text-xs sm:text-sm px-4 py-2">
        I sell real estate properties everywhere in the world e.g. USA, Dubai, UK, Nigeria and many more
      </div>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Gee-Bee Properties Concepts" className="h-10 w-10 object-contain" />
            <div className="hidden sm:block">
              <div className="font-display text-lg leading-none text-gold">Gee-Bee</div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground">PROPERTIES CONCEPTS</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm hover:text-gold transition-colors" activeProps={{ className: "text-gold" }}>Home</Link>
            <Link to="/properties" className="text-sm hover:text-gold transition-colors" activeProps={{ className: "text-gold" }}>Properties</Link>
            <Link to="/contact" className="text-sm hover:text-gold transition-colors" activeProps={{ className: "text-gold" }}>Contact</Link>
          </nav>
          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="flex flex-col p-4 gap-3">
              <Link to="/" onClick={() => setOpen(false)} className="text-sm py-2">Home</Link>
              <Link to="/properties" onClick={() => setOpen(false)} className="text-sm py-2">Properties</Link>
              <Link to="/contact" onClick={() => setOpen(false)} className="text-sm py-2">Contact</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-background mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="" className="h-10 w-10 object-contain" />
              <div className="font-display text-lg text-gold">Gee-Bee Properties Concepts</div>
            </div>
            <p className="text-sm text-muted-foreground">Ready to satisfy you and give you a precious home of your choice.</p>
          </div>
          <div>
            <h4 className="text-gold mb-3 text-sm tracking-widest">CONTACT</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold" /> +234 803 678 7815</li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gold" />
                <a href="https://wa.me/2348036787815" target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                  WhatsApp: +234 803 678 7815
                </a>
              </li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold" /> chriscage988@gmail.com</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gold mt-0.5" /> Ologolo, Lekki Peninsula II, Lagos, Nigeria</li>
            </ul>
          </div>
          <div>
            <h4 className="text-gold mb-3 text-sm tracking-widest">HOURS</h4>
            <p className="text-sm text-muted-foreground">Open 24 hours, 7 days a week</p>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Gee-Bee Properties Concepts. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
