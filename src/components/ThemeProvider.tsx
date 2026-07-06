'use client';

import { ConfigProvider } from 'antd';
import { antdThemeConfig } from '@/lib/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ConfigProvider theme={antdThemeConfig}>{children}</ConfigProvider>;
}
