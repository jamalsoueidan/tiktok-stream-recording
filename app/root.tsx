import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import {
  Button,
  ColorSchemeScript,
  Container,
  Flex,
  MantineProvider,
} from "@mantine/core";
import {
  Link,
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
import { FaHome, FaVideo } from "react-icons/fa";
import { FollowerForm } from "./components/FollowerForm";
import { MonitorButton } from "./components/MonitorButton";
import { SignIn } from "./components/SignIn";
import { SignOutButton } from "./components/Signout";

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
              <Container fluid p="md">
                <Flex flex="1" gap="xs" w="100%" mb="md">
                  <Button
                    component={Link}
                    to="/"
                    color="blue"
                    size="lg"
                    leftSection={<FaHome />}
                  >
                    Home
                  </Button>
                  <FollowerForm />
                  <Button
                    component={Link}
                    to="/videos"
                    color="green"
                    size="lg"
                    leftSection={<FaVideo />}
                  >
                    Videos
                  </Button>
                  <MonitorButton />
                  <SignOutButton />
                </Flex>
                {children}
              </Container>
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
