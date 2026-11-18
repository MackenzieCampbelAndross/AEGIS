import { useState } from 'react';
import { Shield, ArrowRight, Search, CheckCircle } from 'lucide-react';

export default function SceneFinalCta({ onOpenConsole }) {
  const [addressInput, setAddressInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onOpenConsole) {
      onOpenConsole(addressInput.trim() || undefined);
    }
  };

  return (
    <section id="scene-final-cta" data-bg="#0a0a0a" data-theme="dark">
      <div className="cta-content-wrapper">
        <h2 className="cta-heading">
          Your wallet.<br />Under watch.
        </h2>
        <p className="cta-subtext">
          Initialize a deep historical state audit and neutralize legacy approval vectors across all your connected networks instantly.
        </p>

        {/* Live Address Audit Form */}
        <form className="cta-audit-form interactive" onSubmit={handleSubmit}>
          <div className="cta-input-box">
            <Search size={16} className="cta-search-icon" />
            <input
              type="text"
              placeholder="Paste any EVM address (0x...) or connect wallet..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="cta-input-field interactive mono"
            />
          </div>
          <button
            type="submit"
            className="cta-submit-btn interactive"
            data-cursor="cta"
            data-cursor-text="AUDIT"
          >
            <Shield size={16} />
            <span>ANALYZE WALLET NOW</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="cta-badges-row">
          <div className="cta-badge-item">
            <CheckCircle size={14} className="badge-check" />
            <span>Non-Custodial Architecture</span>
          </div>
          <div className="cta-badge-item">
            <CheckCircle size={14} className="badge-check" />
            <span>Frontrun-Protected MEV Relaying</span>
          </div>
          <div className="cta-badge-item">
            <CheckCircle size={14} className="badge-check" />
            <span>Multi-Chain EVM Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
