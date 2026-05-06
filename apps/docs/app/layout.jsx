import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import "./globals.css";

export const metadata = {
  title: "HisabKit Documentation",
  description: "Engineering standards and playbooks for the HisabKit Enterprise Platform.",
};

export default async function RootLayout({ children }) {
  const pageMap = await getPageMap();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning data-scroll-behavior="smooth">
      <Head />
      <body className="antialiased font-sans">
        <Layout
          pageMap={pageMap}
          navbar={<Navbar logo={<b>HisabKit</b>} />}
          footer={<Footer>HisabKit © 2026</Footer>}
          docsRepositoryBase="https://github.com/nayag/hisabkit/tree/main/apps/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
