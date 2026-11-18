import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Terminal, Shield, ArrowRight, Play, Zap } from 'lucide-react';

export default function SceneHero({ onOpenConsole }) {
  const [logs, setLogs] = useState([
    { type: 'cmd', text: '$ aegis inspect --target 0x71a2...9b4d' },
    { type: 'info', text: 'TARGET: 0x71a2B721E0170a75D5F0273EbC0667C2a69b4d8A' },
    { type: 'warn', text: 'ANALYZING: Storage slot 0x3f · 4 active allowances detected' },
    { type: 'critical', text: 'HAZARD DETECTED: Unverified proxy holds UINT256_MAX USDT allowance' },
    { type: 'success', text: 'AEGIS SHIELD: Countermeasure ready · Clearance available' },
  ]);
  const [cmdInput, setCmdInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef(null);

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

  const handleCommand = (commandStr) => {
    const clean = commandStr.trim().toLowerCase();
    if (!clean) return;

    setIsRunning(true);
    setLogs((prev) => [...prev, { type: 'cmd', text: `$ aegis ${clean}` }]);

    setTimeout(() => {
      if (clean === 'help') {
        setLogs((prev) => [
          ...prev,
          { type: 'info', text: 'COMMANDS:' },
          { type: 'info', text: '  scan           - Scan current target permissions' },
          { type: 'info', text: '  inspect <0x..> - Deep heuristic bytecode inspection' },
          { type: 'info', text: '  shield / app   - Launch complete Aegis Security Console' },
          { type: 'info', text: '  vitalik        - Audit Vitalik.eth historical approvals' },
          { type: 'info', text: '  clear          - Reset terminal stream' },
        ]);
      } else if (clean.startsWith('inspect')) {
        const parts = clean.split(' ');
        const target = parts[1] || '0x93c12658A3297127eEdb98227bCeef3a93F86c5B';
        setLogs((prev) => [
          ...prev,
          { type: 'warn', text: `Disassembling bytecode for ${target}...` },
          { type: 'critical', text: 'Opcode 0xF4 (DELEGATECALL) detected pointing to dynamic storage' },
          { type: 'success', text: 'Simulation outcome: High hazard rating (94/100)' },
        ]);
        if (onOpenConsole) onOpenConsole(target);
      } else if (clean === 'shield' || clean === 'app' || clean === 'console') {
        setLogs((prev) => [
          ...prev,
          { type: 'success', text: 'Launching Aegis V1 Security Console...' },
        ]);
        if (onOpenConsole) onOpenConsole();
      } else if (clean === 'vitalik') {
        setLogs((prev) => [
          ...prev,
          { type: 'info', text: 'Auditing 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045...' },
          { type: 'warn', text: 'Historical DAI allowance granted to Uniswap V2 (1,120 days dormant)' },
        ]);
        if (onOpenConsole) onOpenConsole('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
      } else if (clean === 'clear') {
        setLogs([{ type: 'cmd', text: '$ aegis' }]);
      } else {
        // default scan
        setLogs((prev) => [
          ...prev,
          { type: 'info', text: 'INTERCEPTING: Querying validator gossip mempool...' },
          { type: 'critical', text: 'VULNERABILITY: 1 unverified proxy with infinite USDT allowance' },
          { type: 'success', text: 'SHIELD ARMED: Click [LAUNCH CONSOLE] to neutralize.' },
        ]);
      }
      setIsRunning(false);
      setCmdInput('');
    }, 700);
  };

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

          <p className="hero-editorial-subtext">
            Aegis shields your Web3 vaults in real time. We intercept malicious mempool calls,
            model bytecode threat vectors, and execute atomic clearance before assets are drained.
          </p>

          <div className="hero-cta-action-row">
            <button
              className="hero-primary-launch-btn interactive"
              onClick={() => onOpenConsole && onOpenConsole()}
              data-cursor="cta"
              data-cursor-text="LAUNCH"
            >
              <Shield size={16} />
              <span>LAUNCH SECURITY SUITE</span>
              <ArrowRight size={16} />
            </button>

            <a href="#scene-threat-matrix" className="hero-secondary-link interactive">
              EXPLORE PIPELINE
            </a>
          </div>
        </motion.div>

        {/* Right Column: Interactive Cyber Terminal */}
        <motion.div
          className="hero-terminal-wrapper"
          ref={terminalRef}
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mac-terminal-window interactive" data-cursor="diagram" data-cursor-text="CLI">
            {/* Window Header */}
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="terminal-title">aegis · live cli v1.0.4</div>
              <button
                className="terminal-rerun-btn interactive"
                onClick={() => handleCommand('scan')}
                disabled={isRunning}
                data-cursor="cta"
                data-cursor-text="SCAN"
              >
                {isRunning ? 'SCANNING...' : 'RUN SCAN'}
              </button>
            </div>

            {/* Terminal Body */}
            <div className="terminal-body interactive-cli-body">
              <div className="cli-log-stream">
                {logs.map((log, index) => (
                  <div key={index} className={`cli-log-row cli-${log.type}`}>
                    {log.type === 'cmd' ? (
                      <span className="mono-cmd">{log.text}</span>
                    ) : (
                      <span className="mono-text">{log.text}</span>
                    )}
                  </div>
                ))}
                {isRunning && <div className="cli-log-row cli-info">Processing heuristics...</div>}
              </div>

              {/* Interactive Prompt Input */}
              <form
                className="cli-prompt-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCommand(cmdInput);
                }}
              >
                <span className="prompt-symbol">$ aegis</span>
                <input
                  type="text"
                  className="cli-input-field interactive"
                  placeholder="type 'help', 'scan', 'shield', or 'inspect'..."
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  disabled={isRunning}
                />
              </form>

              {/* Quick CLI Shortcuts */}
              <div className="cli-quick-chips">
                <span className="quick-label">ACTIONS:</span>
                <button
                  type="button"
                  className="quick-chip interactive"
                  onClick={() => handleCommand('scan')}
                >
                  $ scan
                </button>
                <button
                  type="button"
                  className="quick-chip interactive"
                  onClick={() => handleCommand('inspect 0x93c12658A3297127eEdb98227bCeef3a93F86c5B')}
                >
                  $ inspect
                </button>
                <button
                  type="button"
                  className="quick-chip interactive"
                  onClick={() => handleCommand('vitalik')}
                >
                  $ vitalik
                </button>
                <button
                  type="button"
                  className="quick-chip highlight interactive"
                  onClick={() => onOpenConsole && onOpenConsole()}
                >
                  [ OPEN CONSOLE ]
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
