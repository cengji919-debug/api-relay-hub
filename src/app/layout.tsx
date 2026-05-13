import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'API Relay Hub - Unified Access to Chinese LLM APIs',
  description: 'Access leading Chinese large language models through a single, developer-friendly API. ERNIE Bot, Tongyi Qianwen, Spark Desk and more.',
  keywords: ['API', 'LLM', 'Chinese AI', 'ERNIE Bot', 'Tongyi Qianwen', 'Spark Desk', 'DeepSeek'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}