import { forwardRef, useEffect, useState } from 'react';

const Navbar = forwardRef(function Navbar(props, ref) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav id="navbar" ref={ref}>
      <div className="nav-progress-indicator" style={{ width: `${scrollProgress}%` }}></div>
      <div className="nav-left">
        <a href="#scene-hero" className="nav-brand interactive">
          AEGIS®
        </a>
      </div>
      <div className="nav-links">
        <a href="#scene-genesis" className="interactive">
          INSIGHTS
        </a>
        <a href="#scene-threat-matrix" className="interactive">
          PIPELINE
        </a>
        <a href="#scene-architecture" className="interactive">
          ARCHITECTURE
        </a>
        <a href="#scene-roadmap" className="interactive">
          WORKFLOW
        </a>
        <a href="#scene-final-cta" className="interactive">
          ABOUT
        </a>
      </div>
    </nav>
  );
});

export default Navbar;
