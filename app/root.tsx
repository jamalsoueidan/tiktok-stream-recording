import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";

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

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState } from "react";
import { FaHome, FaRecordVinyl, FaVideo } from "react-icons/fa";
import { FollowerForm } from "./components/FollowerForm";

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
          <ConvexProvider client={convex}>
            <Container fluid p="md">
              <Flex flex="1" gap="xs" w="100%" mb="md">
                <Button
                  component={Link}
                  to="/"
                  color="blue"
                  size="xl"
                  leftSection={<FaHome />}
                >
                  Home
                </Button>
                <FollowerForm />
                <Button
                  component={Link}
                  to="/videos"
                  color="green"
                  size="xl"
                  leftSection={<FaVideo />}
                >
                  Videos
                </Button>
                <Button
                  component={Link}
                  to="/monitor"
                  color="yellow"
                  size="xl"
                  leftSection={<FaRecordVinyl />}
                >
                  Monitor
                </Button>
              </Flex>
              {children}
            </Container>
          </ConvexProvider>
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
