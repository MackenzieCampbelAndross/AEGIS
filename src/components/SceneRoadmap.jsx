export default function SceneRoadmap() {
  return (
    <section id="scene-roadmap" data-bg="#e2e8f0" data-theme="light">
      <div className="roadmap-container">
        <div className="roadmap-title-area">
          <h2 style={{ color: '#121212' }}>How Aegis Secures Your Vaults.</h2>
        </div>

        <div className="roadmap-card-full interactive" data-cursor="hover">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.4rem, 2.2vw, 1.8rem)',
              fontWeight: 600,
              lineHeight: 1.4,
              maxWidth: '850px',
              color: '#ffffff',
            }}
          >
            Aegis doesn't hold your assets. It protects the cryptographic permissions surrounding them.
          </p>

          <div className="roadmap-steps-grid">
            <div className="roadmap-step-item">
              <h4>STAGE SCAN</h4>
              <p>Scan what you've granted.</p>
            </div>
            <div className="roadmap-step-item">
              <h4>STAGE ANALYSIS</h4>
              <p>Understand what it means.</p>
            </div>
            <div className="roadmap-step-item">
              <h4>STAGE CLEARANCE</h4>
              <p>Remove what you don't need.</p>
            </div>
            <div className="roadmap-step-item">
              <h4>STAGE DEFENSE</h4>
              <p>Stay protected.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
