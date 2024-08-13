// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

export const metadata = {
  title: "AI Insurance Document Classifier",
  description: "The world's quickest classifier for good ol' insurance papers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark">
          <ColorSchemeScript defaultColorScheme="dark" />

          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
