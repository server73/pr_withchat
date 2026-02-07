import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { PRProvider } from '@/lib/prContext';
import { SchemaProvider } from '@/lib/schemaContext';
import { BriefingConfigProvider } from '@/lib/briefingConfigContext';
import { UserBriefingPrefsProvider } from '@/lib/userBriefingPrefsContext';

export const metadata: Metadata = {
  title: 'PR Assistant - 구매요청 도우미',
  description: '채팅 기반 구매요청 솔루션',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="overflow-hidden">
        <SchemaProvider>
          <BriefingConfigProvider>
            <UserBriefingPrefsProvider>
              <PRProvider>
                <div className="flex h-screen">
                  <Sidebar />
                  <main className="flex-1 overflow-hidden">
                    {children}
                  </main>
                </div>
              </PRProvider>
            </UserBriefingPrefsProvider>
          </BriefingConfigProvider>
        </SchemaProvider>
      </body>
    </html>
  );
}
