import PageTransition from '@/components/ui/animations/PageTransition';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-app-gradient">
      {/* Ambient blur orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-white/80 rounded-full mix-blend-overlay filter blur-[80px] md:blur-[100px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#185C4D]/10 rounded-full mix-blend-overlay filter blur-[100px] md:blur-[120px] pointer-events-none" />
      <PageTransition className="flex justify-center items-center">
        {children}
      </PageTransition>
    </main>
  );
}