import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

const SITE_DESCRIPTION = [
  "ISBN: 9798235142671 (e-Book)",
  "ISBN: 9798195009434 (Paperback)",
  "DOI 10.6084/m9.figshare.32133316",
  "ASIN: B0GZ42SBNY (e-Book)",
  "https://www.dram.gold (Official Page)",
].join("\n");

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The NVIDIA Innovator's Dilemma" },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "The NVIDIA Innovator's Dilemma" },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "The NVIDIA Innovator's Dilemma" },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/Mv5rAadNX1UWIuPV5Qm5FAWSS6p2/social-images/social-1777718182607-NVIDIA-Innovators-Dilemma_logo.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/Mv5rAadNX1UWIuPV5Qm5FAWSS6p2/social-images/social-1777718182607-NVIDIA-Innovators-Dilemma_logo.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
  return <Outlet />;
}
