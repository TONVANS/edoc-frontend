import PageTransition from '@/components/ui/animations/PageTransition';

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
