import type { ReactNode } from 'react';
import { useLocation } from 'wouter';
import ClickSpark from '@reactbits/ClickSpark/ClickSpark';
import Particles from '@reactbits/Particles/Particles';
import SplitText from '@reactbits/SplitText/SplitText';

interface ArticleLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function ArticleLayout({ title, subtitle, children }: ArticleLayoutProps) {
  const [, navigate] = useLocation();

  return (
    <ClickSpark sparkColor="#67e8f9" sparkSize={10} sparkRadius={18} sparkCount={8} duration={420}>
      <main className="relative min-h-screen w-full bg-[#020617] text-white">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
          <Particles
            particleColors={['#67e8f9', '#38bdf8', '#ffffff']}
            particleCount={80}
            particleSpread={9}
            speed={0.04}
            particleBaseSize={70}
            sizeRandomness={0.8}
            alphaParticles={true}
            moveParticlesOnHover={false}
            disableRotation={false}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-10 flex items-center gap-2 font-mono text-xs text-slate-400 transition-colors hover:text-cyan-400"
          >
            ← SkyNodes
          </button>

          <header className="mb-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
              Flight Graph Control — SkyNodes
            </p>
            <SplitText
              text={title}
              className="text-4xl font-bold text-white md:text-5xl"
              tag="h1"
              splitType="words"
              delay={65}
              duration={0.7}
              ease="power3.out"
              from={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            />
            <p className="mt-3 max-w-xl text-sm text-slate-400">{subtitle}</p>
          </header>

          {children}
        </div>
      </main>
    </ClickSpark>
  );
}
