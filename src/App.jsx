import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import SceneHero from './components/SceneHero';
import SceneGenesis from './components/SceneGenesis';
import SceneThreatMatrix from './components/SceneThreatMatrix';
import SceneArchitecture from './components/SceneArchitecture';
import SceneRoadmap from './components/SceneRoadmap';
import SceneFinalCta from './components/SceneFinalCta';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const bgLayerRef = useRef(null);
  const navbarRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({ duration: 1.2 });

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0, 0);

    // 2. Global ScrollTrigger for section theme & background transitions
    const bgLayer = bgLayerRef.current;
    const navbar = navbarRef.current;
    const sections = document.querySelectorAll('section');
    const scrollTriggers = [];

    sections.forEach((section) => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 60%',
        onEnter: () => updateTheme(section),
        onEnterBack: () => updateTheme(section),
      });
      scrollTriggers.push(st);
    });

    function updateTheme(section) {
      if (bgLayer && section.dataset.bg) {
        gsap.to(bgLayer, {
          backgroundColor: section.dataset.bg,
          duration: 1.2,
          ease: 'power2.out',
        });
      }

      if (navbar) {
        if (section.dataset.theme === 'dark') {
          document.body.style.color = '#ffffff';
          navbar.style.background = 'rgba(255, 255, 255, 0.05)';
          navbar.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        } else {
          document.body.style.color = '#121212';
          navbar.style.background = 'rgba(222, 222, 222, 0.8)';
          navbar.style.borderColor = 'rgba(0, 0, 0, 0.12)';
        }
      }
    }

    return () => {
      gsap.ticker.remove(updateTicker);
      scrollTriggers.forEach((st) => st.kill());
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <div className="bg-texture" id="bg-layer" ref={bgLayerRef}></div>
      <CustomCursor />
      <Navbar ref={navbarRef} />
      <SceneHero />
      <SceneGenesis />
      <SceneThreatMatrix />
      <SceneArchitecture />
      <SceneRoadmap />
      <SceneFinalCta />
    </>
  );
}
