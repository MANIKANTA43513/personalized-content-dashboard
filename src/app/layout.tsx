import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: { default: 'Pulse — your personalized content dashboard', template: '%s · Pulse' },
  description: 'News, recommendations and social posts, tuned to the topics you care about.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1f4f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1211' },
  ],
};

// Runs before first paint so there is no flash of the wrong theme. Reads only a known key and a known value.
const themeScript = `try{var s=JSON.parse(localStorage.getItem('pcd:v1')||'{}');var d=s.theme?s.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
