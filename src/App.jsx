import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { presets, STEP_INFO } from './data/presets';
import { useFuzzyController } from './hooks/useFuzzyController';
import InputPanel from './components/InputPanel';
import MembershipChart from './components/MembershipChart';
import RuleMatrix from './components/RuleMatrix';
import DefuzzView from './components/DefuzzView';
import ExplanationPanel from './components/ExplanationPanel';
import Controls from './components/Controls';
import { Icon } from './components/icons';

const CURRENT_YEAR = new Date().getFullYear();

export default function App() {
  const {
    preset,
    inputs,
    currentStep,
    isPlaying,
    speed,
    pipeline,
    handCalc,
    setInput,
    changePreset,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    goToStep,
    setSpeed,
  } = useFuzzyController();

  const [leftOpen, setLeftOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoModal, setInfoModal] = useState(null); // 'privacy' | 'terms' | null

  // Focus management refs
  const drawerButtonRef = useRef(null);
  const menuButtonRef = useRef(null);
  const drawerSheetRef = useRef(null);
  const menuSheetRef = useRef(null);

  // Close overlays on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (infoModal) {
          setInfoModal(null);
        } else if (mobileDrawerOpen) {
          setMobileDrawerOpen(false);
          drawerButtonRef.current?.focus();
        } else if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen, mobileMenuOpen, infoModal]);

  // Focus trapping for mobile menu sheet
  useEffect(() => {
    if (!mobileMenuOpen || !menuSheetRef.current) return;
    const focusable = menuSheetRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function trap(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    first.focus();
    window.addEventListener('keydown', trap);
    return () => window.removeEventListener('keydown', trap);
  }, [mobileMenuOpen]);

  // Reset to step 1 for logo click
  function handleLogoClick(e) {
    e.preventDefault();
    goToStep(0);
    reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-ground text-ink flex flex-col font-sans select-none antialiased">
      {/* ─── TOP BAR HEADER ─── */}
      <header className="sticky top-0 z-30 h-14 bg-ground border-b border-line px-3 sm:px-6 flex items-center justify-between w-full max-w-full">
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle for Drawer / Rail */}
          <button
            ref={drawerButtonRef}
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileDrawerOpen(!mobileDrawerOpen);
              } else {
                setLeftOpen(!leftOpen);
              }
            }}
            aria-label="Toggle problem preset and crisp input parameters"
            aria-expanded={mobileDrawerOpen}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[6px] flex items-center justify-center text-muted hover:text-ink hover:bg-panel-hover transition-colors focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Icon name="sidebar" className="w-5 h-5" />
          </button>

          {/* Logo links to app root and resets to step 1 */}
          <button
            onClick={handleLogoClick}
            aria-label="Sugeno FLC Studio home, reset simulation"
            className="text-left flex items-center gap-2.5 min-h-[44px] focus-visible:outline-2 focus-visible:outline-accent rounded-[6px] px-1"
          >
            <span className="font-bold text-sm sm:text-base text-ink tracking-tight">
              Sugeno FLC Studio
            </span>
            <span className="hidden sm:inline-block text-xs uppercase tracking-wider text-muted border-l border-line pl-2.5">
              Takagi-Sugeno Controller
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-[6px] text-xs font-mono font-normal bg-panel border border-line text-ink">
            Zero-Order Sugeno
          </span>

          {/* Mobile Top-Bar Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu and documentation"
            aria-expanded={mobileMenuOpen}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[6px] flex items-center justify-center text-muted hover:text-ink hover:bg-panel-hover transition-colors focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Icon name="menu" className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ─── MAIN APP WORKSPACE ─── */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto min-h-0">
        {/* ═══ LEFT RAIL: Desktop Presets & Sliders (Sticky on >=1024px) ═══ */}
        {leftOpen && (
          <aside className="hidden lg:block w-[300px] xl:w-[320px] flex-shrink-0 border-r border-line bg-ground overflow-y-auto sticky top-14 h-[calc(100vh-3.5rem-3.5rem)]">
            <InputPanel
              preset={preset}
              inputs={inputs}
              onInputChange={setInput}
              presets={presets}
              onPresetChange={changePreset}
            />
          </aside>
        )}

        {/* ═══ CENTER STAGE: Step Tabs & Visualization ═══ */}
        <main className="flex-1 min-w-0 flex flex-col bg-ground">
          {/* Step Progress & Tab Bar */}
          <div className="border-b border-line bg-ground px-4 sm:px-6 pt-3">
            <div className="relative mb-3">
              {/* Thin background progress line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-line -translate-y-1/2" />
              {/* Filled progress line */}
              <div
                className="absolute top-1/2 left-0 h-px bg-accent -translate-y-1/2 transition-all duration-200"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />

              {/* Step tabs (1 to 5) - Single step selector */}
              <div className="relative flex justify-between items-center z-10 overflow-x-auto py-1">
                {STEP_INFO.map((step, idx) => {
                  const isActive = idx === currentStep;
                  const isCompleted = idx < currentStep;

                  return (
                    <button
                      key={step.id}
                      onClick={() => goToStep(idx)}
                      aria-current={isActive ? 'step' : undefined}
                      aria-label={`Step ${idx + 1}: ${step.title}`}
                      title={`Step ${idx + 1}: ${step.title}`}
                      className="group flex flex-col items-center min-h-[44px] min-w-[44px] px-2 py-1 relative focus-visible:outline-2 focus-visible:outline-accent rounded-[6px]"
                    >
                      <div
                        className={`w-6 h-6 rounded-[6px] flex items-center justify-center text-xs font-mono font-bold border transition-colors ${
                          isActive
                            ? 'bg-accent border-accent text-ground'
                            : isCompleted
                            ? 'bg-ground border-ink text-ink'
                            : 'bg-ground border-line text-muted'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      {/* Name shown from 768px up (md:inline); below that hidden with aria-label & tooltip */}
                      <span
                        className={`text-xs mt-1.5 font-medium whitespace-nowrap hidden md:inline ${
                          isActive
                            ? 'text-accent'
                            : isCompleted
                            ? 'text-ink'
                            : 'text-muted'
                        }`}
                      >
                        {step.label}
                      </span>

                      {/* Shared active tab underline using layoutId */}
                      {isActive && (
                        <motion.div
                          layoutId="activeStepUnderline"
                          className="absolute -bottom-3 left-0 right-0 h-0.5 bg-accent"
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Step Content */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto overflow-x-hidden max-w-full min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${preset.id}-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-4xl min-w-0 space-y-6 mx-auto"
              >
                {/* ── STEP 0 & 1: Membership Functions & Fuzzification ── */}
                {currentStep <= 1 && (
                  <div className="space-y-6 w-full max-w-full min-w-0">
                    {preset.inputs.map((inp, idx) => (
                      <section
                        key={inp.name}
                        className="rounded-[8px] bg-panel border border-line p-3.5 sm:p-5 space-y-4 w-full max-w-full min-w-0 overflow-hidden"
                      >
                        <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-ink">{inp.name}</h3>
                            <span className="text-xs font-mono text-muted">
                              Range [{inp.range[0]}, {inp.range[1]}]{inp.unit}
                            </span>
                          </div>
                          {currentStep === 1 && (
                            <span className="text-xs font-mono font-bold text-accent tabular-nums">
                              x = {inputs[idx].toFixed(1)} {inp.unit}
                            </span>
                          )}
                        </div>

                        <MembershipChart
                          variable={inp}
                          inputValue={inputs[idx]}
                          fuzzified={pipeline.fuzzified[idx]}
                          showIndicator={currentStep >= 1}
                          compact={false}
                        />

                        {currentStep === 1 && (
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-line-subtle">
                            {pipeline.fuzzified[idx].map((f, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded-[6px] text-center border ${
                                  f.degree > 0
                                    ? 'bg-panel-hover border-line-strong'
                                    : 'bg-transparent border-line-subtle'
                                }`}
                              >
                                <div
                                  className="text-xs font-semibold"
                                  style={{ color: f.degree > 0 ? f.color : 'var(--color-muted)' }}
                                >
                                  μ_{f.name}
                                </div>
                                <div className="text-xs font-mono tabular-nums font-bold mt-0.5 text-ink">
                                  {f.degree.toFixed(4)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    ))}

                    {/* Step 1 Read-only overview diagram (no jump behavior) */}
                    {currentStep === 0 && (
                      <section className="rounded-[8px] bg-panel border border-line p-4 sm:p-5 space-y-4">
                        <div className="border-b border-line-subtle pb-3">
                          <h3 className="text-sm sm:text-base font-bold text-ink">
                            Sugeno Inference Pipeline Overview
                          </h3>
                          <p className="text-xs text-muted mt-1">
                            Read-only flow of inference stages from crisp inputs to crisp output.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                          {STEP_INFO.map((s, i) => (
                            <div
                              key={s.id}
                              className="min-h-[44px] p-3 rounded-[6px] text-left sm:text-center bg-panel border border-line"
                            >
                              <div className="text-xs font-mono font-bold text-accent">
                                Stage {i + 1}
                              </div>
                              <div className="text-xs font-semibold text-ink mt-1">
                                {s.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {/* ── STEP 2: Rule Matrix ── */}
                {currentStep === 2 && (
                  <section className="rounded-[8px] bg-panel border border-line p-4 sm:p-5 space-y-4">
                    <div className="border-b border-line-subtle pb-3">
                      <h3 className="text-sm sm:text-base font-bold text-ink">Rule Base Evaluation</h3>
                      <p className="text-xs text-muted mt-1">
                        Firing strengths computed using Min T-norm for AND conjunctions.
                      </p>
                    </div>
                    <RuleMatrix
                      preset={preset}
                      evaluatedRules={pipeline.evaluatedRules}
                      currentStep={currentStep}
                    />
                  </section>
                )}

                {/* ── STEP 3: Consequent Computation ── */}
                {currentStep === 3 && (
                  <section className="rounded-[8px] bg-panel border border-line p-4 sm:p-5 space-y-4">
                    <div className="border-b border-line-subtle pb-3">
                      <h3 className="text-sm sm:text-base font-bold text-ink">
                        Active Rule Consequent Evaluation
                      </h3>
                      <p className="text-xs text-muted mt-1">
                        Zero-order Sugeno maps firing weights directly to crisp constant outputs.
                      </p>
                    </div>
                    <DefuzzView preset={preset} pipeline={pipeline} currentStep={3} />
                  </section>
                )}

                {/* ── STEP 4: Defuzzification ── */}
                {currentStep === 4 && (
                  <section className="rounded-[8px] bg-panel border border-line p-4 sm:p-5 space-y-4">
                    <div className="border-b border-line-subtle pb-3">
                      <h3 className="text-sm sm:text-base font-bold text-ink">
                        Weighted Average Defuzzification
                      </h3>
                      <p className="text-xs text-muted mt-1">
                        Computes crisp output z* via normalized weighted average of fired rule outputs.
                      </p>
                    </div>
                    <DefuzzView preset={preset} pipeline={pipeline} currentStep={4} />
                  </section>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Stacked Explanation & Ledger below stage on <1280px (mobile, tablet, 1024-1279px) */}
            <div className="xl:hidden mt-8 border-t border-line pt-6">
              <ExplanationPanel
                stepInfo={STEP_INFO}
                currentStep={currentStep}
                handCalc={handCalc}
                preset={preset}
                pipeline={pipeline}
              />
            </div>
          </div>
        </main>

        {/* ═══ RIGHT COLUMN: Explanation & Ledger (Only on >=1280px, stacked below on <1280px) ═══ */}
        <aside className="hidden xl:block w-[360px] 2xl:w-[400px] flex-shrink-0 border-l border-line bg-ground overflow-y-auto sticky top-14 h-[calc(100vh-3.5rem-3.5rem)]">
          <ExplanationPanel
            stepInfo={STEP_INFO}
            currentStep={currentStep}
            handCalc={handCalc}
            preset={preset}
            pipeline={pipeline}
          />
        </aside>
      </div>

      {/* ─── STICKY BOTTOM CONTROL BAR ─── */}
      <footer className="sticky bottom-0 z-20 h-14 bg-ground border-t border-line flex items-center">
        <Controls
          currentStep={currentStep}
          isPlaying={isPlaying}
          speed={speed}
          onPlay={play}
          onPause={pause}
          onStepForward={stepForward}
          onStepBack={stepBack}
          onReset={reset}
          onSpeedChange={setSpeed}
          stepInfo={STEP_INFO}
        />
      </footer>

      {/* ─── FOOTER METADATA BAR ─── */}
      <div className="bg-ground border-t border-line px-3 sm:px-6 py-3 text-xs text-muted flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left">
          <span>© {CURRENT_YEAR} Sugeno FLC Studio</span>
          <span>·</span>
          <span>MIT License</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          <a
            href="https://github.com/axyz97836/sugeno-flc-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-2.5 py-2 hover:text-ink transition-colors inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-accent rounded-[6px]"
          >
            <Icon name="github" className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
          <span className="text-line-strong">·</span>
          <button
            onClick={() => setInfoModal('privacy')}
            className="min-h-[44px] min-w-[44px] px-2.5 py-2 hover:text-ink transition-colors inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-accent rounded-[6px]"
          >
            Privacy
          </button>
          <span className="text-line-strong">·</span>
          <button
            onClick={() => setInfoModal('terms')}
            className="min-h-[44px] min-w-[44px] px-2.5 py-2 hover:text-ink transition-colors inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-accent rounded-[6px]"
          >
            Terms
          </button>
        </div>
      </div>

      {/* ─── MOBILE DRAWER (<1024px) FOR PRESETS & SLIDERS ─── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setMobileDrawerOpen(false);
                drawerButtonRef.current?.focus();
              }}
              className="fixed inset-0 bg-ground/80"
              aria-hidden="true"
            />

            {/* Drawer Sheet */}
            <motion.div
              ref={drawerSheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Preset and input sliders drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xs bg-ground border-r border-line flex flex-col h-full"
            >
              <div className="p-4 border-b border-line flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-ink">
                  Presets & Inputs
                </span>
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    drawerButtonRef.current?.focus();
                  }}
                  aria-label="Close drawer"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[6px] flex items-center justify-center text-muted hover:text-ink hover:bg-panel-hover focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <InputPanel
                  preset={preset}
                  inputs={inputs}
                  onInputChange={setInput}
                  presets={presets}
                  onPresetChange={(p) => {
                    changePreset(p);
                    setMobileDrawerOpen(false);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MOBILE TOP-BAR MENU SHEET ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setMobileMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              className="fixed inset-0 bg-ground/80"
              aria-hidden="true"
            />

            {/* Menu Sheet */}
            <motion.div
              ref={menuSheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation and options menu"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm bg-ground border-l border-line flex flex-col h-full"
            >
              <div className="p-4 border-b border-line flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-ink">
                  Menu & Navigation
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    menuButtonRef.current?.focus();
                  }}
                  aria-label="Close menu"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[6px] flex items-center justify-center text-muted hover:text-ink hover:bg-panel-hover focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Steps Section */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Simulation Steps
                  </h4>
                  <div className="space-y-1">
                    {STEP_INFO.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          goToStep(idx);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full min-h-[44px] px-3 py-2 rounded-[6px] text-left text-xs font-medium flex items-center justify-between border ${
                          currentStep === idx
                            ? 'bg-accent-subtle border-accent-line text-accent'
                            : 'bg-transparent border-transparent text-ink hover:bg-panel-hover'
                        }`}
                      >
                        <span>Step {idx + 1}: {s.title}</span>
                        <span className="text-xs font-mono">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Presets Section */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Problem Presets
                  </h4>
                  <div className="space-y-1">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          changePreset(p);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full min-h-[44px] px-3 py-2 rounded-[6px] text-left text-xs font-medium flex items-center gap-2.5 border ${
                          preset.id === p.id
                            ? 'bg-accent-subtle border-accent-line text-accent'
                            : 'bg-transparent border-transparent text-ink hover:bg-panel-hover'
                        }`}
                      >
                        <Icon name={p.iconKey} className="w-4 h-4" />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Links Section */}
                <div className="space-y-2 pt-2 border-t border-line">
                  <h4 className="text-xs uppercase tracking-wider text-muted font-semibold">
                    Resources & Legal
                  </h4>
                  <div className="space-y-1">
                    <a
                      href="https://github.com/axyz97836/sugeno-flc-studio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[44px] px-3 py-2 rounded-[6px] text-xs font-medium flex items-center gap-2 text-ink hover:bg-panel-hover border border-transparent"
                    >
                      <Icon name="github" className="w-4 h-4" />
                      <span>GitHub Repository</span>
                    </a>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setInfoModal('privacy');
                      }}
                      className="w-full min-h-[44px] px-3 py-2 rounded-[6px] text-left text-xs font-medium text-ink hover:bg-panel-hover border border-transparent"
                    >
                      Privacy Statement
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setInfoModal('terms');
                      }}
                      className="w-full min-h-[44px] px-3 py-2 rounded-[6px] text-left text-xs font-medium text-ink hover:bg-panel-hover border border-transparent"
                    >
                      Terms of Use
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── PRIVACY / TERMS MODAL ─── */}
      <AnimatePresence>
        {infoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setInfoModal(null)}
              className="fixed inset-0 bg-ground/80"
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={infoModal === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-md rounded-[8px] bg-ground border border-line-strong p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-base font-bold text-ink">
                  {infoModal === 'privacy' ? 'Privacy Statement' : 'Terms of Use'}
                </h3>
                <button
                  onClick={() => setInfoModal(null)}
                  aria-label="Close dialog"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[6px] flex items-center justify-center text-muted hover:text-ink hover:bg-panel-hover focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>

              {infoModal === 'privacy' ? (
                <div className="text-xs leading-relaxed text-ink space-y-3">
                  <p>
                    Sugeno FLC Studio operates entirely client-side inside your browser session.
                  </p>
                  <p>
                    No personal data, telemetry, cookies, or remote analytics are gathered, recorded, or transmitted to external servers. All fuzzy inference calculations and state updates execute strictly on your device.
                  </p>
                </div>
              ) : (
                <div className="text-xs leading-relaxed text-ink space-y-3">
                  <p>
                    Sugeno FLC Studio is open-source software provided under the MIT License for educational and technical simulation purposes.
                  </p>
                  <p>
                    The application is provided without warranty of any kind, express or implied. Control outputs and calculations are generated by mathematical models for simulation and evaluation.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setInfoModal(null)}
                  className="min-h-[44px] px-4 py-2 rounded-[6px] text-xs font-semibold bg-panel hover:bg-panel-hover text-ink border border-line transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
