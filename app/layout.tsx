import "./globals.css";
import RootWrapper from "@/wrappers/MainWrapper";
import { Host_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
const host_grostesk = Host_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-jakarta",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={` ${host_grostesk.variable} `}
    >
      <body className="min-h-full flex flex-col max-w-full overflow-x-clip">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <RootWrapper>{children}</RootWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
