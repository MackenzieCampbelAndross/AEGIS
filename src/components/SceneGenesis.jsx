import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import img1 from '../assets/img1.jpg';

gsap.registerPlugin(ScrollTrigger);

const timelineItemsData = [
  {
    phase: 'Inception Protocol',
    title: 'Infinite Allowance Grants',
    description:
      'Applications routinely request unconstrained token allowances to optimize gas costs, creating permanent exposure channels long after session closure.',
  },
  {
    phase: 'State Retention',
    title: 'Dormant State Persistence',
    description:
      'As protocols migrate or deprecate old proxies, historical cryptographic linkages remain recorded on-chain, hidden from user visibility.',
  },
  {
    phase: 'Vulnerability Window',
    title: 'Autonomous Zero-Day Extraction',
    description:
      'Malicious actors compromise legacy contract registries to silently siphon linked vault balances without manual user prompts.',
  },
  {
    phase: 'Perimeter Breach',
    title: 'Unmonitored Proxy Routing',
    description:
      'Delegated signing contracts pass state execution calls through untrusted intermediaries, bypassing client-side security alerts entirely.',
  },
  {
    phase: 'Systemic Cascade',
    title: 'Active Capital Depletion',
    description:
      'Unchecked background token allowances permit instantaneous drainage across multi-chain portfolio vaults before manual intervention.',
  },
];

export default function SceneGenesis() {
  const timelineAreaRef = useRef(null);
  const progressBarRef = useRef(null);
  const itemsRef = useRef([]);
  const statRef = useRef(null);
  const [statNumber, setStatNumber] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Stat Counter
      ScrollTrigger.create({
        trigger: statRef.current,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(
            { val: 0 },
            {
              val: 475,
              duration: 2,
              ease: 'power3.out',
              onUpdate: function () {
                setStatNumber(Math.floor(this.targets()[0].val));
              },
            }
          );
        },
      });

      // 2. Timeline Progress Bar
      if (progressBarRef.current && timelineAreaRef.current) {
        gsap.to(progressBarRef.current, {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: timelineAreaRef.current,
            start: 'top 60%',
            end: 'bottom 70%',
            scrub: true,
          },
        });
      }

      // 3. Timeline Items
      itemsRef.current.forEach((item) => {
        if (!item) return;
        ScrollTrigger.create({
          trigger: item,
          start: 'top 75%',
          end: 'bottom 40%',
          onToggle: (self) => {
            if (self.isActive) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="scene-genesis" data-bg="#dedede" data-theme="light">
      <div className="genesis-container">
        <div className="genesis-header-block">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#4A5568',
            }}
          >
            Vulnerability Vectors
          </span>
          <h2 className="genesis-title">
            The <span className="fancy-italic">silent drain</span> on capital.
          </h2>
        </div>

        <div className="genesis-grid">
          <div className="genesis-portrait-panel interactive" data-cursor="diagram">
            <div className="ascii-portrait-container">
              <img src={img1} alt="Self Portrait" />
            </div>
            <div ref={statRef}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#4A5568',
                }}
              >
                Cumulative Industry Loss
              </span>
              <div className="genesis-stat-number">${statNumber}M+</div>
            </div>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#4A5568' }}>
              Siphoned via forgotten approval exploits. Standard real-time wallet prompts leave historical permissions open indefinitely to dormant smart contracts.
            </p>
          </div>

          <div className="genesis-timeline" ref={timelineAreaRef}>
            <div className="timeline-progress-bar-genesis" ref={progressBarRef}></div>

            {timelineItemsData.map((item, index) => (
              <div
                key={index}
                className="genesis-timeline-item interactive"
                ref={(el) => (itemsRef.current[index] = el)}
              >
                <div className="genesis-timeline-node"></div>
                <span className="genesis-phase-tag">{item.phase}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
