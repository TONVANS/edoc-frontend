import type { Metadata } from "next";
import { Noto_Sans_Lao, Plus_Jakarta_Sans } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App } from "antd";
import { Toaster } from "sonner";
import ThemeProvider from "@/components/ThemeProvider";
import { SIDEBAR_MENU_STYLES } from "@/components/layout/sidebarStyles";
import "./globals.css";

const notoSanLao = Noto_Sans_Lao({
  subsets: ["lao", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-lao",
  fallback: ["Phetsarath OT", "sans-serif"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title: "E-Document Management System",
  description: "E-Document Management System for Accounting & Finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSanLao.variable} ${plusJakartaSans.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: SIDEBAR_MENU_STYLES }} />
      </head>
      <body
        className={`min-h-screen text-[#1C1C1E] antialiased flex flex-col font-sans`}
      >
        <AntdRegistry>
          <App>
            <ThemeProvider>{children}</ThemeProvider>
          </App>
        </AntdRegistry>

        {/* Master Architect Notes:
          - เอา richColors ออก เพราะเราจะ Custom สีเอง 100% ตาม Design Tokens
          - ใช้ [&_[data-icon]] ในการบังคับเปลี่ยนสี SVG Icon ของ Sonner ให้ตรงกับสี Text
          - ปรับแต่ง closeButton ให้เป็นสไตล์ Glass ทะลุเห็นพื้นหลัง
        */}
        <Toaster
          position="top-right"
          closeButton
          toastOptions={{
            style: {
              // Base Layer 1/2 Glass styling
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              boxShadow: "0 8px 32px rgba(31, 38, 135, 0.08)",
              borderRadius: "16px",
              fontFamily: 'var(--font-plus-jakarta-sans), var(--font-noto-sans-lao), "Phetsarath OT", sans-serif',
            },
            classNames: {
              toast: "group", // อนุญาตให้ใช้ Hover states กับ element ลูกได้
              // Status: Success (Green)
              success:
                "!border-[#BEE4CE] !bg-[rgba(225,242,232,0.85)] !text-[#1A7A44] [&_[data-icon]]:!text-[#1A7A44]",
              // Status: Error/Danger (Red)
              error:
                "!border-[#F8CACA] !bg-[rgba(252,228,228,0.85)] !text-[#B83131] [&_[data-icon]]:!text-[#B83131]",
              // Status: Warning (Yellow)
              warning:
                "!border-[#FBE1A9] !bg-[rgba(253,240,213,0.85)] !text-[#9B7016] [&_[data-icon]]:!text-[#9B7016]",
              // Status: Info/Default (Primary Forest Green)
              info:
                "!border-[#185C4D]/30 !bg-[rgba(255,255,255,0.85)] !text-[#185C4D] [&_[data-icon]]:!text-[#185C4D]",
              // Title & Description Typography adjustments
              title: "font-semibold text-sm tracking-tight",
              description: "font-medium text-xs opacity-90",
              // Close Button Styling (Layer 3 Interactive)
              closeButton:
                "!bg-white/50 !border-white/60 hover:!bg-white/90 hover:shadow-sm !text-[#1C1C1E] transition-all duration-300",
            },
          }}
        />
      </body>
    </html>
  );
}