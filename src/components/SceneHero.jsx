import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

export default function SceneHero() {
  const [step, setStep] = useState(0); // 0: Idle, 1: Command, 2: Target, 3: Analyzing, 4: Result
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    runScan();
  }, []);

  const runScan = () => {
    setIsRunning(true);
    setStep(1); // Command

    setTimeout(() => setStep(2), 600); // Target
    setTimeout(() => setStep(3), 1200); // Analyzing
    setTimeout(() => {
      setStep(4); // Result
      setIsRunning(false);
    }, 2000);
  };

  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal) return;

    gsap.to(terminal, {
      y: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '#scene-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, []);

  return (
    <section id="scene-hero" data-bg="#0a0a0a" data-theme="dark">
      <div className="hero-editorial-layout">
        {/* Left Column: 3-Line Anton Headline */}
        <motion.div
          className="hero-typography-block"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="headline-line line-1">AUTONOMOUS</div>
          <div className="headline-line line-2">Security for Every</div>
          <div className="headline-line line-3">TRANSACTION.</div>
        </motion.div>

        {/* Right Column: Refined Minimal Mac Terminal */}
        <motion.div
          className="hero-terminal-wrapper"
          ref={terminalRef}
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mac-terminal-window interactive" data-cursor="diagram" data-cursor-text="DEMO">
            {/* Window Header */}
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="terminal-title">aegis · demo</div>
              <button
                className="terminal-rerun-btn interactive"
                onClick={runScan}
                disabled={isRunning}
                data-cursor="cta"
                data-cursor-text="SCAN"
              >
                {isRunning ? 'SCANNING' : 'RUN SCAN'}
              </button>
            </div>

            {/* Clean Spaced Terminal Body */}
            <div className="terminal-body">
              {step >= 1 && (
                <div className="terminal-group">
                  <div className="terminal-cmd">$ aegis inspect</div>
                </div>
              )}

              {step >= 2 && (
                <div className="terminal-group">
                  <div className="terminal-label">TARGET</div>
                  <div className="terminal-value">0x71a2...9b4d</div>
                </div>
              )}

              {step >= 3 && (
                <div className="terminal-group">
                  <div className="terminal-label">ANALYZING</div>
                  <div className="terminal-subtext">
                    contract permissions • execution paths
                  </div>
                </div>
              )}

              {step >= 4 && (
                <div className="terminal-group result-group">
                  <div className="terminal-label">RESULT</div>
                  <div className="terminal-result-badge">PROTECTED</div>
                </div>
              )}

              {isRunning && <span className="terminal-cursor">_</span>}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
