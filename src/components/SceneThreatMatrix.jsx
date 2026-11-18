import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stackCards = [
  {
    stage: '01',
    title: 'PERMISSION GRANTED',
    subtitle: 'UINT256_MAX ALLOWANCE',
    desc: 'Applications request unconstrained token allowances to optimize gas costs, creating permanent exposure channels.',
    status: 'GRANT: ACTIVE',
    color: '#ffffff',
    svgType: 'grant',
  },
  {
    stage: '02',
    title: 'DORMANT ACCESS',
    subtitle: 'STORAGE SLOT 0x0...3F',
    desc: 'Historical cryptographic linkages remain stored permanently on-chain long after session closure and wallet disconnect.',
    status: 'SLOT: RETAINED',
    color: '#a1a1aa',
    svgType: 'slot',
  },
  {
    stage: '03',
    title: 'UNUSUAL CONTRACT CALL',
    subtitle: 'UNMONITORED PROXY ROUTE',
    desc: 'Delegated signing contracts pass state execution calls through untrusted intermediaries without user alerts.',
    status: 'CALL: DETECTED',
    color: '#fbbf24',
    svgType: 'proxy',
  },
  {
    stage: '04',
    title: 'PRIVILEGE ESCALATION',
    subtitle: 'SUSPICIOUS DELEGATECALL',
    desc: 'Bytecode models flag unverified proxy routers attempting unconstrained transferFrom() calls.',
    status: 'ESCALATION: CRITICAL',
    color: '#ff4d4d',
    svgType: 'escalate',
  },
  {
    stage: '05',
    title: 'DRAIN ATTEMPT',
    subtitle: 'ACTIVE CAPITAL EXTRACTION',
    desc: 'Malicious actors trigger background token allowances to siphon multi-chain vault balances instantaneously.',
    status: 'DRAIN: INTERCEPTED',
    color: '#ff4d4d',
    svgType: 'drain',
  },
  {
    stage: '06',
    title: 'AEGIS INTERVENTION',
    subtitle: 'ATOMIC BATCH CLEARANCE',
    desc: 'Aegis telemetry intercepts suspicious mempool updates, zeroing all target allowances in a single atomic transaction.',
    status: 'SHIELD: ZEROED & SAFE',
    color: '#34d399',
    svgType: 'aegis',
  },
];

export default function SceneThreatMatrix({ onOpenConsole }) {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter(Boolean);
      const totalCards = cards.length;

      // Substantial scroll distance (160% viewport height per card)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: `+=${totalCards * 160}%`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            const cardStep = progress * (totalCards - 1);
            const activeIndex = Math.min(
              totalCards - 1,
              Math.floor(cardStep + 0.15)
            );
            setActiveCardIndex(activeIndex);
          },
        },
      });

      // Initial positions: Card 0 is active, rest wait below
      cards.forEach((card, i) => {
        if (i === 0) {
          gsap.set(card, { y: 0, scale: 1, opacity: 1 });
        } else {
          gsap.set(card, { y: '120vh', scale: 0.95, opacity: 0 });
        }
      });

      // Sequentially animate card stacking with settled reading phases
      for (let i = 1; i < totalCards; i++) {
        const prevCard = cards[i - 1];
        const currentCard = cards[i];

        // 1. Previous card scales down slightly and stays partially visible at top
        tl.to(
          prevCard,
          {
            y: -24 * i,
            scale: 1 - i * 0.03,
            opacity: 0.45,
            duration: 1,
            ease: 'power2.inOut',
          },
          `step-${i}`
        );

        // 2. Current card slides up from below, settles cleanly into viewport center
        tl.to(
          currentCard,
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
          },
          `step-${i}`
        );

        // 3. Settled reading hold state before next transition begins
        tl.to(currentCard, { duration: 0.8 });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="scene-threat-matrix" data-bg="#000000" data-theme="dark" ref={containerRef}>
      <div className="stack-section-wrapper">
        {/* Header Block */}
        <div className="stack-title-block">
          <h2 className="stack-anton-heading">
            ANATOMY OF AN EXPLOITED PERMISSION.
          </h2>
        </div>

        {/* Scroll Stack Viewport Stage */}
        <div className="scroll-stack-stage">
          {stackCards.map((card, idx) => (
            <div
              key={card.stage}
              className={`scroll-stack-card ${idx === activeCardIndex ? 'card-active' : ''}`}
              ref={(el) => (cardRefs.current[idx] = el)}
              style={{ zIndex: idx + 10 }}
            >
              <div className="card-curved-border">
                <div className="card-inner-content">
                  {/* Left Narrative Text */}
                  <div className="card-left">
                    <div className="card-stage-num">{card.stage}</div>
                    <div className="card-header-group">
                      <span className="card-subtitle">{card.subtitle}</span>
                      <h3 className="card-title">{card.title}</h3>
                    </div>
                    <p className="card-desc">{card.desc}</p>
                    <div className="card-status-badge" style={{ color: card.color }}>
                      [STATUS] {card.status}
                    </div>
                    {card.stage === '06' && onOpenConsole && (
                      <button
                        className="matrix-action-btn interactive"
                        onClick={() => onOpenConsole()}
                        style={{
                          marginTop: '1rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: '#34d399',
                          color: '#000000',
                          border: 'none',
                          padding: '0.55rem 1rem',
                          borderRadius: '4px',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        <span>LAUNCH ATOMIC SHIELD</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>

                  {/* Right Stage SVG Diagram */}
                  <div className="card-right-diagram">
                    <svg viewBox="0 0 240 180" className="card-svg">
                      {card.svgType === 'grant' && (
                        <g transform="translate(120, 90)">
                          <circle r="40" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 4" />
                          <circle r="12" fill="#ffffff" />
                          <text x="0" y="60" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="JetBrains Mono">
                            ALLOWANCE: UINT256_MAX
                          </text>
                        </g>
                      )}
                      {card.svgType === 'slot' && (
                        <g transform="translate(120, 90)">
                          <rect x="-50" y="-30" width="100" height="60" rx="8" fill="none" stroke="#a1a1aa" strokeWidth="2" />
                          <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="JetBrains Mono">
                            SLOT 0x0...3F
                          </text>
                          <text x="0" y="60" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="JetBrains Mono">
                            EVM STATE PERSISTENCE
                          </text>
                        </g>
                      )}
                      {card.svgType === 'proxy' && (
                        <g transform="translate(120, 90)">
                          <path d="M -60 0 L 60 0" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 5" />
                          <circle cx="-60" cy="0" r="16" fill="#121212" stroke="#ffffff" strokeWidth="2" />
                          <circle cx="60" cy="0" r="16" fill="#121212" stroke="#fbbf24" strokeWidth="2" />
                          <text x="0" y="-15" textAnchor="middle" fill="#fbbf24" fontSize="10" fontFamily="JetBrains Mono">
                            UNTRUSTED PROXY
                          </text>
                        </g>
                      )}
                      {card.svgType === 'escalate' && (
                        <g transform="translate(120, 90)">
                          <circle r="45" fill="none" stroke="#ff4d4d" strokeWidth="2" />
                          <path d="M -30 30 L 30 -30" stroke="#ff4d4d" strokeWidth="2" />
                          <text x="0" y="65" textAnchor="middle" fill="#ff4d4d" fontSize="10" fontFamily="JetBrains Mono">
                            DELEGATECALL ESCALATION
                          </text>
                        </g>
                      )}
                      {card.svgType === 'drain' && (
                        <g transform="translate(120, 90)">
                          <path d="M -50 -20 L 50 20" stroke="#ff4d4d" strokeWidth="3" />
                          <circle cx="50" cy="20" r="18" fill="#ff4d4d" />
                          <text x="0" y="65" textAnchor="middle" fill="#ff4d4d" fontSize="10" fontFamily="JetBrains Mono">
                            SIPHON INITIATED
                          </text>
                        </g>
                      )}
                      {card.svgType === 'aegis' && (
                        <g transform="translate(120, 90)">
                          <circle r="42" fill="rgba(52, 211, 153, 0.1)" stroke="#34d399" strokeWidth="2" />
                          <path d="M -15 0 L -5 10 L 15 -10" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
                          <text x="0" y="65" textAnchor="middle" fill="#34d399" fontSize="10" fontFamily="JetBrains Mono">
                            ATOMIC ZEROED
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
