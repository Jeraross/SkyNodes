import React, { useState, Children, useRef, useLayoutEffect, type HTMLAttributes, type ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  backButtonText = 'Voltar',
  nextButtonText = 'Próximo',
  disableStepIndicators = false,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) onFinalStepCompleted();
    else onStepChange(newStep);
  };

  return (
    <div className="w-full" {...rest}>
      <div className="w-full rounded-2xl border border-cyan-500/20 bg-white/[0.02]">
        <div className="flex w-full items-center px-10 pt-10">
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                <StepIndicator
                  step={stepNumber}
                  currentStep={currentStep}
                  disableStepIndicators={disableStepIndicators}
                  onClickStep={clicked => { setDirection(clicked > currentStep ? 1 : -1); updateStep(clicked); }}
                />
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper isCompleted={isCompleted} currentStep={currentStep} direction={direction} className="px-10">
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className="flex justify-between px-10 pb-10 mt-6">
            {currentStep !== 1 ? (
              <button onClick={() => { setDirection(-1); updateStep(currentStep - 1); }} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                {backButtonText}
              </button>
            ) : <span />}
            <button
              onClick={() => { setDirection(1); isLastStep ? updateStep(totalSteps + 1) : updateStep(currentStep + 1); }}
              className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-4 py-1.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition-colors"
            >
              {isLastStep ? 'Concluir' : nextButtonText}
            </button>
          </div>
        )}
        {isCompleted && (
          <div className="px-8 pb-8 pt-4 text-center">
            <p className="text-sm text-cyan-400 font-mono">✓ Todas as regras aplicadas</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className = '' }: {
  isCompleted: boolean; currentStep: number; direction: number; children: ReactNode; className?: string;
}) {
  const [parentHeight, setParentHeight] = useState(0);
  return (
    <motion.div
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={h => setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({ children, direction, onHeightReady }: { children: ReactNode; direction: number; onHeightReady: (h: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { if (containerRef.current) onHeightReady(containerRef.current.offsetHeight); }, [children, onHeightReady]);
  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({ x: dir >= 0 ? '-100%' : '100%', opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? '50%' : '-50%', opacity: 0 }),
};

export function Step({ children }: { children: ReactNode }) {
  return <div className="py-6">{children}</div>;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }: {
  step: number; currentStep: number; onClickStep: (n: number) => void; disableStepIndicators: boolean;
}) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';
  return (
    <motion.div
      onClick={() => !disableStepIndicators && step !== currentStep && onClickStep(step)}
      className={disableStepIndicators ? 'pointer-events-none' : 'cursor-pointer'}
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#64748b' },
          active: { backgroundColor: 'rgba(103,232,249,0.2)', color: '#67e8f9' },
          complete: { backgroundColor: 'rgba(103,232,249,0.3)', color: '#67e8f9' },
        }}
        transition={{ duration: 0.3 }}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-current text-xs font-semibold"
      >
        {status === 'complete' ? '✓' : status === 'active' ? <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> : <span>{step}</span>}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div className="relative mx-2 h-px flex-1 overflow-hidden rounded bg-white/10">
      <motion.div
        className="absolute left-0 top-0 h-full bg-cyan-400"
        initial={false}
        animate={{ width: isComplete ? '100%' : '0%' }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}
