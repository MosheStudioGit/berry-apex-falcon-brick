import { createServerFn } from "@tanstack/react-start";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Elixia · Meta Intelligence";

/** Same host guard the injector uses for og:image. Preview and loopback emit nothing. */
function publicAppHost(hostHeader: string): string {
  const host = String(hostHeader ?? "")
    .split(",")[0]
    ?.trim()
    .split(":")[0]
    ?.toLowerCase();
  if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return "";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
  if (
    host === "vercel.app" ||
    host.endsWith(".vercel.app") ||
    host === "vercel.com" ||
    host.endsWith(".vercel.com")
  ) {
    return "";
  }
  return host;
}

const shareHost = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  let header = "";
  try {
    const req = getRequest();
    header = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  } catch {
    header = "";
  }
  return publicAppHost(process.env.VITE_PUBLIC_HOSTNAME ?? "") || publicAppHost(header);
});

export const Route = createRootRoute({
  loader: () => shareHost(),
  head: ({ loaderData }) => {
    const host = typeof loaderData === "string" ? loaderData : "";
    const xBanner = host ? `https://${host}/x-banner.jpg` : "";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { title: APP_NAME },
        {
          name: "description",
          content: "Diagnóstico de Meta Ads en tres bloques: cuenta, creativos y fricción de la landing.",
        },
        { name: "theme-color", content: "#491B4B" },
        ...(xBanner ? [{ property: "x:game:image", content: xBanner }] : []),
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
        },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      ],
    };
  },
  component: Root,
});

function Root() {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('elixia_theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var s=localStorage.getItem('elixia_skin');if(s==='glass'||s==='luna'||s==='code'||s==='elixia')document.documentElement.dataset.skin=s}catch(e){document.documentElement.dataset.theme='light'}",
          }}
        />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}