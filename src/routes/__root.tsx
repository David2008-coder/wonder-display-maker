import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/Layout";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display text-gold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
        <Link to="/" className="mt-6 inline-block text-gold hover:underline">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Geebee Properties — Premium Real Estate in Lagos" },
      { name: "description", content: "Discover luxury homes and properties across Lagos, Nigeria. Browse listings with photos, videos, and pricing from Geebee Properties." },
      { property: "og:title", content: "Geebee Properties — Premium Real Estate in Lagos" },
      { property: "og:description", content: "Discover luxury homes and properties across Lagos, Nigeria. Browse listings with photos, videos, and pricing from Geebee Properties." },
      { property: "og:type", content: "website" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { name: "twitter:title", content: "Geebee Properties — Premium Real Estate in Lagos" },
      { name: "twitter:description", content: "Discover luxury homes and properties across Lagos, Nigeria. Browse listings with photos, videos, and pricing from Geebee Properties." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cb775227-396e-430f-a967-cb185df6aecb/id-preview-adad96e8--035a5288-8e9d-43b1-b464-cc4810e71de0.lovable.app-1778278024524.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cb775227-396e-430f-a967-cb185df6aecb/id-preview-adad96e8--035a5288-8e9d-43b1-b464-cc4810e71de0.lovable.app-1778278024524.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Layout />
      <Toaster />
    </QueryClientProvider>
  );
}
