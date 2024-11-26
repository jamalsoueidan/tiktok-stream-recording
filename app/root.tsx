import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import {
  ColorSchemeScript,
  Container,
  Flex,
  MantineProvider,
} from "@mantine/core";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from "@remix-run/react";
import {
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { useState } from "react";
import { LeftNavigation } from "./components/LeftNavigation";
import { SignIn } from "./components/SignIn";

export async function loader() {
  const CONVEX_URL = process.env["CONVEX_URL"]!;
  return json({ ENV: { CONVEX_URL } });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { ENV } = useLoaderData<typeof loader>();
  const [convex] = useState(() => new ConvexReactClient(ENV.CONVEX_URL));

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <ConvexAuthProvider client={convex}>
            <Authenticated>
              <Flex>
                <LeftNavigation />
                <Container fluid>{children}</Container>
              </Flex>
            </Authenticated>
            <Unauthenticated>
              <SignIn />
            </Unauthenticated>
          </ConvexAuthProvider>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
