import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PIPELINE_STAGES = [
  {
    id: 'intake',
    step: 'STAGE 01',
    label: '01 INTAKE',
    name: 'Intake',
    title: 'Mempool Telemetry Stream',
    summary: 'Aegis intercepts pending transaction payloads directly from validator gossip networks before block inclusion.',
    accentColor: '#60a5fa',
    cx: 90,
    cy: 210,
  },
  {
    id: 'context',
    step: 'STAGE 02',
    label: '02 CONTEXT',
    name: 'Context',
    title: 'State Storage Indexer',
    summary: 'Traverses storage slots (0x00..0x3f) to map active allowance permissions and account state history.',
    accentColor: '#34d399',
    cx: 270,
    cy: 115,
  },
  {
    id: 'bytecode',
    step: 'STAGE 03',
    label: '03 BYTECODE',
    name: 'Bytecode',
    title: 'Neural Heuristics Engine',
    summary: 'Disassembles EVM bytecode into opcode streams, evaluating unverified proxies for covert exploit vectors.',
    accentColor: '#fbbf24',
    cx: 450,
    cy: 210,
  },
  {
    id: 'risk',
    step: 'STAGE 04',
    label: '04 RISK',
    name: 'Risk',
    title: 'Deterministic Risk Evaluator',
    summary: 'Simulates transaction outcomes in a sandbox environment to calculate quantitative hazard risk scores.',
    accentColor: '#ff4d4d',
    cx: 630,
    cy: 305,
  },
  {
    id: 'clearance',
    step: 'STAGE 05',
    label: '05 CLEARANCE',
    name: 'Clearance',
    title: 'Private MEV Relayer',
    summary: 'Dispatches frontrun-protected multi-call counter-transactions to reset allowances and secure funds.',
    accentColor: '#34d399',
    cx: 810,
    cy: 210,
  },
];

const SVG_PATH_D = 'M 90,210 C 210,80 300,340 450,210 C 600,80 690,340 810,210';

export default function SceneArchitecture() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const scrollTextRef = useRef(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    // Slower, elegant scroll reveal for Anton headline words
    const words = scrollTextRef.current?.querySelectorAll('.scroll-word');
    if (words && words.length > 0) {
      gsap.fromTo(
        words,
        { opacity: 0.15, y: 8 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.04,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: scrollTextRef.current,
            start: 'top 85%',
            end: 'top 40%',
            scrub: 0.8,
          },
        }
      );
    }

    // Pinning stage scrubbing
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top 12%',
        end: '+=180%',
        pin: true,
        scrub: 0.4,
        onUpdate: (self) => {
          const progress = self.progress;
          const stage = Math.min(
            Math.floor(progress * PIPELINE_STAGES.length),
            PIPELINE_STAGES.length - 1
          );
          setActiveStageIndex(stage);
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const displayIndex = hoveredNode !== null ? hoveredNode : activeStageIndex;
  const activeStage = PIPELINE_STAGES[displayIndex];

  const line1Words = 'UNDER THE SURFACE,'.split(' ');
  const line2Words = 'AEGIS IS ALREADY READING.'.split(' ');

  return (
    <section id="scene-architecture" ref={sectionRef} data-bg="#0a0a0a" data-theme="dark">
      {/* Editorial Intro Typography */}
      <div className="arch-intro-block">
        <h2 className="arch-anton-headline" ref={scrollTextRef}>
          <div className="headline-line">
            {line1Words.map((word, i) => (
              <span key={i} className="scroll-word">
                {word}{' '}
              </span>
            ))}
          </div>
          <div className="headline-line">
            {line2Words.map((word, i) => (
              <span key={i} className="scroll-word">
                {word}{' '}
              </span>
            ))}
          </div>
        </h2>
      </div>

      {/* Pinned Pipeline Workspace Container */}
      <div className="arch-workspace-container" ref={containerRef}>
        {/* Navigation Rail */}
        <div className="arch-rail">
          <div className="rail-track" />
          {PIPELINE_STAGES.map((stage, idx) => {
            const isActive = idx === activeStageIndex;
            const isSelected = displayIndex === idx;
            const isPassed = idx <= activeStageIndex;

            return (
              <button
                key={stage.id}
                className={`rail-item ${isActive ? 'current' : ''} ${isSelected ? 'selected' : ''} ${isPassed ? 'passed' : ''}`}
                onClick={() => setActiveStageIndex(idx)}
                onMouseEnter={() => setHoveredNode(idx)}
                onMouseLeave={() => setHoveredNode(null)}
                data-cursor="pointer"
              >
                <span className="rail-dot" style={{ backgroundColor: isSelected ? stage.accentColor : undefined }} />
                <span className="rail-num">{stage.step}</span>
                <span className="rail-name">{stage.name}</span>
              </button>
            );
          })}
        </div>

        {/* 70 / 30 Visual Hero Grid */}
        <div className="arch-grid-hero">
          {/* Hero Flow Graph (70% Width) */}
          <div className="arch-graph-hero">
            <div className="graph-meta">
              <span className="meta-label">REAL-TIME PIPELINE FLOW</span>
              <span className="meta-status">
                <span className="pulse-green" /> LIVE EXECUTION
              </span>
            </div>

            <svg viewBox="0 0 900 420" className="arch-hero-svg">
              <defs>
                <linearGradient id="activePathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>

                <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Inactive Base Path */}
              <path
                d={SVG_PATH_D}
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Active Illuminated Path */}
              <motion.path
                d={SVG_PATH_D}
                fill="none"
                stroke="url(#activePathGrad)"
                strokeWidth="4.5"
                strokeLinecap="round"
                filter="url(#softGlow)"
                initial={{ pathLength: 0.2 }}
                animate={{ pathLength: (displayIndex + 1) / 5 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />

              {/* Data Signal Moving Pulse along Path */}
              <circle r="4" fill="#ffffff" filter="url(#softGlow)">
                <animateMotion dur="4s" repeatCount="indefinite" path={SVG_PATH_D} />
              </circle>

              {/* 5 Stage Nodes */}
              {PIPELINE_STAGES.map((node, idx) => {
                const isCurrent = idx === activeStageIndex;
                const isSelected = displayIndex === idx;
                const isPassed = idx <= activeStageIndex;

                return (
                  <g
                    key={node.id}
                    className={`svg-node ${isSelected ? 'active-node' : ''}`}
                    onClick={() => setActiveStageIndex(idx)}
                    onMouseEnter={() => setHoveredNode(idx)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Subtle Restrained Halo for Active Node */}
                    {isSelected && (
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r="38"
                        fill="none"
                        stroke={node.accentColor}
                        strokeWidth="1.5"
                        opacity="0.3"
                      >
                        <animate attributeName="r" values="32;42;32" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Node Base Circle */}
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r={isSelected ? 26 : 20}
                      fill={isSelected ? '#121212' : isPassed ? '#0d0d0d' : '#050505'}
                      stroke={isSelected ? node.accentColor : isPassed ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.18)'}
                      strokeWidth={isSelected ? '3' : '2'}
                      style={{ transition: 'all 0.3s ease' }}
                    />

                    {/* Node Inner Core Dot */}
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r={isSelected ? 7 : 5}
                      fill={isSelected ? node.accentColor : isPassed ? '#ffffff' : 'rgba(255,255,255,0.3)'}
                      style={{ transition: 'all 0.3s ease' }}
                    />

                    {/* Stage Label */}
                    <text
                      x={node.cx}
                      y={node.cy + (node.cy > 210 ? -36 : 46)}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'}
                      fontSize="12"
                      fontFamily="'JetBrains Mono', monospace"
                      fontWeight={isSelected ? '700' : '500'}
                      letterSpacing="0.08em"
                      style={{ transition: 'fill 0.3s ease' }}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Minimal Editorial Annotation Panel (30% Width) */}
          <div className="arch-annotation-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="annotation-content"
              >
                <span className="annotation-tag" style={{ color: activeStage.accentColor }}>
                  {activeStage.step} · {activeStage.name.toUpperCase()}
                </span>
                <h3 className="annotation-title">{activeStage.title}</h3>
                <p className="annotation-summary">{activeStage.summary}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
