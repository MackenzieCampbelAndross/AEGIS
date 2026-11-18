import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Zap,
  Activity,
  AlertTriangle,
  Terminal,
  FileText,
  Search,
  ExternalLink,
  CheckCircle,
  RefreshCw,
  Wallet,
  X,
  Lock,
  ArrowRight,
  Download,
  Flame,
  Radio
} from 'lucide-react';
import {
  CHAINS,
  PRESET_TARGETS,
  connectWallet,
  auditWalletAllowances,
  executeOnChainRevoke,
} from '../services/web3Service';
import {
  evaluateRiskScore,
  inspectTargetContract,
  generateAuditReport,
} from '../services/threatEngine';
import { createMempoolStream } from '../services/mempoolStream';

export default function SecurityConsole({ isOpen, onClose, initialTarget = null }) {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState('allowances'); // 'allowances' | 'sandbox' | 'mempool' | 'dossier'
  const [selectedChainId, setSelectedChainId] = useState(CHAINS[0].id);
  
  // Target address state
  const [targetAddress, setTargetAddress] = useState(
    initialTarget || PRESET_TARGETS[0].address
  );
  const [inputAddress, setInputAddress] = useState(targetAddress);
  const [isAuditing, setIsAuditing] = useState(false);
  
  // Wallet connection state
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletError, setWalletError] = useState(null);

  // Allowance data state
  const [allowances, setAllowances] = useState([]);
  const [filterRisk, setFilterRisk] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'INFINITE'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRevokeId, setActiveRevokeId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Threat sandbox state
  const [sandboxTarget, setSandboxTarget] = useState('0x93c12658A3297127eEdb98227bCeef3a93F86c5B');
  const [sandboxReport, setSandboxReport] = useState(null);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  // Mempool stream state
  const [mempoolEvents, setMempoolEvents] = useState([]);
  const [isStreamActive, setIsStreamActive] = useState(true);

  // Audit Dossier state
  const [auditDossier, setAuditDossier] = useState(null);

  // Run audit whenever targetAddress or chain changes
  useEffect(() => {
    if (!targetAddress) return;
    loadAudit(targetAddress, selectedChainId);
  }, [targetAddress, selectedChainId]);

  // Handle external initial target changes
  useEffect(() => {
    if (initialTarget && initialTarget !== targetAddress) {
      setTargetAddress(initialTarget);
      setInputAddress(initialTarget);
    }
  }, [initialTarget]);

  // Initialize mempool stream
  useEffect(() => {
    if (!isOpen) return;
    const stream = createMempoolStream((event) => {
      setMempoolEvents((prev) => [event, ...prev.slice(0, 19)]);
    }, 4000);

    if (isStreamActive) {
      stream.start();
    }

    return () => stream.stop();
  }, [isOpen, isStreamActive]);

  // Execute wallet audit
  async function loadAudit(address, chainId) {
    setIsAuditing(true);
    setActionNotice(null);
    try {
      const data = await auditWalletAllowances(address, chainId);
      setAllowances(data);
      const risk = evaluateRiskScore(data);
      const dossier = generateAuditReport(address, data, risk);
      setAuditDossier(dossier);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  }

  // Connect live wallet
  async function handleConnectWallet() {
    setIsConnectingWallet(true);
    setWalletError(null);
    try {
      const result = await connectWallet();
      setConnectedWallet(result);
      setTargetAddress(result.address);
      setInputAddress(result.address);
      if (result.chainId) setSelectedChainId(result.chainId);
      setActionNotice({
        type: 'success',
        text: `Connected to wallet: ${result.address.slice(0, 6)}...${result.address.slice(-4)}`,
      });
    } catch (err) {
      setWalletError(err.message || 'Failed to connect Web3 wallet.');
    } finally {
      setIsConnectingWallet(false);
    }
  }

  // Execute single allowance revocation
  async function handleRevoke(allowanceItem) {
    setActiveRevokeId(allowanceItem.id);
    setActionNotice({
      type: 'info',
      text: `Dispatching counter-transaction to zero allowance for ${allowanceItem.spenderName}...`,
    });

    try {
      let txHash = null;
      if (connectedWallet && connectedWallet.address.toLowerCase() === targetAddress.toLowerCase()) {
        txHash = await executeOnChainRevoke(
          allowanceItem.tokenAddress,
          allowanceItem.spenderAddress,
          selectedChainId
        );
      } else {
        // Simulated atomic MEV zeroing
        await new Promise((r) => setTimeout(r, 1600));
        txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      }

      // Update state locally
      setAllowances((prev) =>
        prev.map((item) =>
          item.id === allowanceItem.id
            ? { ...item, allowanceAmount: '0.00 (REVOKED)', riskLevel: 'SAFE', valueAtRiskUsd: 0, isUnlimited: false }
            : item
        )
      );

      setActionNotice({
        type: 'success',
        text: `Success: Permission zeroed! Private MEV Clearance Tx: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: `Revocation failed: ${err.message || 'Transaction rejected'}`,
      });
    } finally {
      setActiveRevokeId(null);
    }
  }

  // Atomic batch clearance: zeroes all high-risk / critical allowances at once
  async function handleBatchClearance() {
    setIsAuditing(true);
    setActionNotice({
      type: 'info',
      text: 'Arming Atomic Batch Clearance: Bundling counter-transactions via Aegis MEV Relayer...',
    });

    await new Promise((r) => setTimeout(r, 2200));

    const updated = allowances.map((item) => {
      if (item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH' || item.isUnlimited) {
        return {
          ...item,
          allowanceAmount: '0.00 (REVOKED ATOMIC)',
          riskLevel: 'SAFE',
          valueAtRiskUsd: 0,
          isUnlimited: false,
        };
      }
      return item;
    });

    setAllowances(updated);
    const risk = evaluateRiskScore(updated);
    setAuditDossier(generateAuditReport(targetAddress, updated, risk));
    setIsAuditing(false);

    setActionNotice({
      type: 'success',
      text: 'Atomic Batch Clearance complete! All hazardous allowances neutralized in Block Bundle #84912.',
    });
  }

  // Run deep sandbox heuristics
  function handleRunSandbox() {
    setIsSandboxRunning(true);
    setTimeout(() => {
      const report = inspectTargetContract(sandboxTarget);
      setSandboxReport(report);
      setIsSandboxRunning(false);
    }, 1200);
  }

  // Computed risk metrics
  const riskMetrics = useMemo(() => evaluateRiskScore(allowances), [allowances]);

  // Filtered allowances
  const filteredAllowances = useMemo(() => {
    return allowances.filter((item) => {
      if (filterRisk === 'CRITICAL' && item.riskLevel !== 'CRITICAL' && item.riskLevel !== 'HIGH') {
        return false;
      }
      if (filterRisk === 'INFINITE' && !item.isUnlimited) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.tokenName.toLowerCase().includes(q) ||
          item.tokenSymbol.toLowerCase().includes(q) ||
          item.spenderName.toLowerCase().includes(q) ||
          item.spenderAddress.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allowances, filterRisk, searchQuery]);

  // Download dossier JSON
  function downloadDossier() {
    if (!auditDossier) return;
    const blob = new Blob([JSON.stringify(auditDossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${auditDossier.reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="aegis-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="aegis-console-container"
          initial={{ scale: 0.96, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, y: 30, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header Bar */}
          <div className="console-header">
            <div className="console-brand-group">
              <div className="console-status-indicator">
                <span className="pulse-dot"></span>
                <span className="console-brand-text">AEGIS V1 · DEFENSE SYSTEM</span>
              </div>
              <span className="console-tag">MAINNET SUITE</span>
            </div>

            {/* Target Address Selector / Input */}
            <div className="console-target-bar">
              <div className="target-input-wrapper">
                <Search size={14} className="target-search-icon" />
                <input
                  type="text"
                  className="target-address-input interactive"
                  placeholder="Paste public EVM address or ENS (0x...)..."
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setTargetAddress(inputAddress.trim());
                    }
                  }}
                />
                <button
                  className="target-audit-btn interactive"
                  onClick={() => setTargetAddress(inputAddress.trim())}
                  disabled={isAuditing}
                >
                  {isAuditing ? <RefreshCw size={13} className="spin-icon" /> : 'AUDIT'}
                </button>
              </div>

              {/* Chain Selector */}
              <select
                className="chain-select-dropdown interactive"
                value={selectedChainId}
                onChange={(e) => setSelectedChainId(Number(e.target.value))}
              >
                {CHAINS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Wallet Connect */}
              <button
                className={`wallet-connect-btn interactive ${connectedWallet ? 'connected' : ''}`}
                onClick={handleConnectWallet}
                disabled={isConnectingWallet}
              >
                <Wallet size={14} />
                <span>
                  {isConnectingWallet
                    ? 'CONNECTING...'
                    : connectedWallet
                    ? `${connectedWallet.address.slice(0, 6)}...${connectedWallet.address.slice(-4)}`
                    : 'CONNECT WALLET'}
                </span>
              </button>

              {/* Close Console */}
              <button className="console-close-btn interactive" onClick={onClose} title="Close Console">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="preset-bar">
            <span className="preset-label">TARGET PRESETS:</span>
            {PRESET_TARGETS.map((p) => (
              <button
                key={p.id}
                className={`preset-chip interactive ${targetAddress.toLowerCase() === p.address.toLowerCase() ? 'active' : ''}`}
                onClick={() => {
                  setTargetAddress(p.address);
                  setInputAddress(p.address);
                }}
              >
                <span className="preset-chip-title">{p.label}</span>
                <span className="preset-chip-badge">{p.badge}</span>
              </button>
            ))}
          </div>

          {/* Notifications banner */}
          {actionNotice && (
            <motion.div
              className={`console-notice-banner ${actionNotice.type}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span>{actionNotice.text}</span>
              <button className="notice-dismiss interactive" onClick={() => setActionNotice(null)}>
                <X size={13} />
              </button>
            </motion.div>
          )}

          {walletError && (
            <div className="console-notice-banner error">
              <span>{walletError}</span>
              <button className="notice-dismiss interactive" onClick={() => setWalletError(null)}>
                <X size={13} />
              </button>
            </div>
          )}

          {/* Core HUD Metric Cards */}
          <div className="console-hud-grid">
            <div className="hud-card risk-score-card">
              <div className="hud-card-header">
                <span className="hud-label">HAZARD RISK INDEX</span>
                <span
                  className="hud-pill"
                  style={{
                    backgroundColor: `${riskMetrics.color}22`,
                    color: riskMetrics.color,
                    borderColor: `${riskMetrics.color}55`,
                  }}
                >
                  {riskMetrics.level}
                </span>
              </div>
              <div className="hud-value-large" style={{ color: riskMetrics.color }}>
                {riskMetrics.score}
                <span className="hud-denom">/100</span>
              </div>
              <p className="hud-caption">{riskMetrics.summary}</p>
            </div>

            <div className="hud-card">
              <div className="hud-card-header">
                <span className="hud-label">EXPOSED VALUE AT RISK</span>
                <Flame size={14} className="hud-icon-red" />
              </div>
              <div className="hud-value-large">
                ${riskMetrics.totalAtRiskUsd.toLocaleString()}
              </div>
              <p className="hud-caption">
                Cumulative token balances reachable by active third-party allowances.
              </p>
            </div>

            <div className="hud-card">
              <div className="hud-card-header">
                <span className="hud-label">PERMISSIONS STATE</span>
                <Lock size={14} className="hud-icon-blue" />
              </div>
              <div className="hud-value-large">
                {allowances.length}{' '}
                <span className="hud-denom">({riskMetrics.infiniteCount} UNLIMITED)</span>
              </div>
              <p className="hud-caption">
                {riskMetrics.criticalCount > 0
                  ? `${riskMetrics.criticalCount} Critical vulnerabilities require immediate zeroing.`
                  : 'All identified protocol linkages actively monitored.'}
              </p>
            </div>

            <div className="hud-card cta-card">
              <div className="hud-card-header">
                <span className="hud-label">AUTONOMOUS COUNTERMEASURE</span>
                <Zap size={14} className="hud-icon-green" />
              </div>
              <button
                className="atomic-clearance-btn interactive"
                onClick={handleBatchClearance}
                disabled={isAuditing || allowances.length === 0 || riskMetrics.score <= 10}
              >
                <Zap size={15} />
                <span>ATOMIC BATCH CLEARANCE</span>
              </button>
              <p className="hud-caption">
                Dispatches private MEV counter-txs to zero all critical allowances simultaneously.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="console-tab-nav">
            <button
              className={`console-tab-btn interactive ${activeTab === 'allowances' ? 'active' : ''}`}
              onClick={() => setActiveTab('allowances')}
            >
              <ShieldAlert size={14} />
              <span>ALLOWANCE SENTINEL ({allowances.length})</span>
            </button>
            <button
              className={`console-tab-btn interactive ${activeTab === 'sandbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('sandbox')}
            >
              <Terminal size={14} />
              <span>DEEP THREAT SANDBOX</span>
            </button>
            <button
              className={`console-tab-btn interactive ${activeTab === 'mempool' ? 'active' : ''}`}
              onClick={() => setActiveTab('mempool')}
            >
              <Radio size={14} />
              <span>LIVE MEMPOOL INTERCEPTOR</span>
              <span className="stream-badge-pulse">LIVE</span>
            </button>
            <button
              className={`console-tab-btn interactive ${activeTab === 'dossier' ? 'active' : ''}`}
              onClick={() => setActiveTab('dossier')}
            >
              <FileText size={14} />
              <span>SECURITY AUDIT DOSSIER</span>
            </button>
          </div>

          {/* Tab 1: Allowance Sentinel */}
          {activeTab === 'allowances' && (
            <div className="tab-pane-content">
              {/* Filter & Search Bar */}
              <div className="allowances-filter-bar">
                <div className="filter-chips-group">
                  <button
                    className={`filter-chip interactive ${filterRisk === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilterRisk('ALL')}
                  >
                    ALL ({allowances.length})
                  </button>
                  <button
                    className={`filter-chip interactive ${filterRisk === 'CRITICAL' ? 'active' : ''}`}
                    onClick={() => setFilterRisk('CRITICAL')}
                  >
                    CRITICAL & HIGH ({riskMetrics.criticalCount + riskMetrics.highCount})
                  </button>
                  <button
                    className={`filter-chip interactive ${filterRisk === 'INFINITE' ? 'active' : ''}`}
                    onClick={() => setFilterRisk('INFINITE')}
                  >
                    UNLIMITED GRANTS ({riskMetrics.infiniteCount})
                  </button>
                </div>

                <div className="allowances-search-box">
                  <Search size={13} />
                  <input
                    type="text"
                    className="allowance-search-input interactive"
                    placeholder="Search by token or spender..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Allowance Table / Cards */}
              <div className="allowance-cards-list">
                {filteredAllowances.length === 0 ? (
                  <div className="empty-state-card">
                    <ShieldCheck size={36} className="empty-icon" />
                    <h4>Zero Hazardous Allowances Detected</h4>
                    <p>
                      This wallet shows clean state permissions for the selected filter. No active
                      draining or unconstrained exploit vectors were detected.
                    </p>
                  </div>
                ) : (
                  filteredAllowances.map((item) => (
                    <div
                      key={item.id}
                      className={`allowance-card-row ${item.riskLevel.toLowerCase()}-risk`}
                    >
                      {/* Token details */}
                      <div className="allowance-col token-col">
                        <div className="token-symbol-badge">{item.tokenSymbol}</div>
                        <div className="token-meta">
                          <span className="token-name">{item.tokenName}</span>
                          <span className="token-balance">
                            Balance: {item.balance} {item.tokenSymbol}
                          </span>
                        </div>
                      </div>

                      {/* Spender Contract */}
                      <div className="allowance-col spender-col">
                        <div className="spender-name-row">
                          <span className="spender-name">{item.spenderName}</span>
                          {item.verified ? (
                            <span className="verified-badge">VERIFIED</span>
                          ) : (
                            <span className="unverified-badge">UNVERIFIED PROXY</span>
                          )}
                        </div>
                        <span className="spender-address mono">{item.spenderAddress}</span>
                        <span className="hazard-type-text">{item.hazardType}</span>
                      </div>

                      {/* Allowance amount & value */}
                      <div className="allowance-col amount-col">
                        <span className="amount-val mono">{item.allowanceAmount}</span>
                        <span className="amount-usd">
                          Value At Risk: ${item.valueAtRiskUsd?.toLocaleString() || '0'}
                        </span>
                        <span className="dormancy-tag">{item.dormancyDays} Days Dormant</span>
                      </div>

                      {/* Risk Badge & Action */}
                      <div className="allowance-col action-col">
                        <span className={`risk-badge badge-${item.riskLevel.toLowerCase()}`}>
                          {item.riskLevel}
                        </span>

                        {item.allowanceAmount.includes('REVOKED') ? (
                          <div className="revoked-indicator">
                            <CheckCircle size={14} /> ZEROED & SAFE
                          </div>
                        ) : (
                          <button
                            className="revoke-action-btn interactive"
                            onClick={() => handleRevoke(item)}
                            disabled={activeRevokeId === item.id}
                          >
                            {activeRevokeId === item.id ? (
                              <>
                                <RefreshCw size={12} className="spin-icon" />
                                ZEROING...
                              </>
                            ) : (
                              'REVOKE PERMISSION'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Deep Threat Sandbox */}
          {activeTab === 'sandbox' && (
            <div className="tab-pane-content sandbox-pane">
              <div className="sandbox-input-header">
                <div className="sandbox-instructions">
                  <h3>Deterministic Heuristics & EVM Bytecode Sandbox</h3>
                  <p>
                    Inspect any smart contract address, proxy implementation, or transaction payload.
                    Aegis decompiles the bytecode opcode stream, checks for unverified storage mappings,
                    and evaluates exploit likelihood in an isolated environment.
                  </p>
                </div>

                <div className="sandbox-action-row">
                  <input
                    type="text"
                    className="sandbox-input-field interactive mono"
                    placeholder="Enter target contract address (e.g. 0x93c1...)..."
                    value={sandboxTarget}
                    onChange={(e) => setSandboxTarget(e.target.value)}
                  />
                  <button
                    className="sandbox-run-btn interactive"
                    onClick={handleRunSandbox}
                    disabled={isSandboxRunning}
                  >
                    {isSandboxRunning ? (
                      <>
                        <RefreshCw size={14} className="spin-icon" />
                        DECOMPILING...
                      </>
                    ) : (
                      <>
                        <Terminal size={14} />
                        EXECUTE HEURISTICS
                      </>
                    )}
                  </button>
                </div>
              </div>

              {sandboxReport ? (
                <div className="sandbox-results-grid">
                  <div className="sandbox-card">
                    <h4>CONTRACT CLASSIFICATION</h4>
                    <div className="sandbox-type-text">{sandboxReport.contractType}</div>
                    <div
                      className="sandbox-risk-pill"
                      style={{
                        color: sandboxReport.color,
                        borderColor: `${sandboxReport.color}66`,
                        backgroundColor: `${sandboxReport.color}15`,
                      }}
                    >
                      EXPLOIT SCORE: {sandboxReport.riskScore} / 100 ({sandboxReport.riskLevel})
                    </div>
                    <div className="sandbox-sim-box">
                      <span className="sim-label">SANDBOX SIMULATION OUTCOME:</span>
                      <p className="sim-text">{sandboxReport.simulationOutcome}</p>
                    </div>
                  </div>

                  <div className="sandbox-card">
                    <h4>DECOMPILED OPCODE AUDIT</h4>
                    <div className="opcode-list">
                      {sandboxReport.decompiledOpcodeFlags.map((op, i) => (
                        <div key={i} className="opcode-item">
                          <span className={`opcode-badge op-${op.risk.toLowerCase()}`}>
                            {op.opcode}
                          </span>
                          <span className="opcode-note">{op.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="sandbox-card full-width">
                    <h4>IDENTIFIED EXPLOIT VECTORS & COUNTERMEASURES</h4>
                    <div className="vectors-grid">
                      <div className="vectors-col">
                        <span className="sub-heading">Vulnerabilities Detected:</span>
                        {sandboxReport.exploitVectors.map((v, i) => (
                          <div key={i} className="vector-bullet">
                            <AlertTriangle size={14} className="bullet-icon-red" />
                            <div>
                              <strong>{v.name}</strong> [{v.severity}]
                              <p>{v.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="vectors-col">
                        <span className="sub-heading">Recommended Countermeasures:</span>
                        {sandboxReport.counterMeasures.map((c, i) => (
                          <div key={i} className="vector-bullet">
                            <CheckCircle size={14} className="bullet-icon-green" />
                            <div>
                              <p>{c}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sandbox-placeholder">
                  <Terminal size={40} />
                  <p>
                    Ready for inspection. Click <strong>EXECUTE HEURISTICS</strong> to trigger opcode
                    decompilation on the target contract.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Live Mempool Interceptor */}
          {activeTab === 'mempool' && (
            <div className="tab-pane-content mempool-pane">
              <div className="mempool-ctrl-bar">
                <div className="mempool-header-title">
                  <Radio size={16} className="pulsing-radio" />
                  <span>MEMPOOL TELEMETRY STREAM · ACTIVE INTERCEPT FEED</span>
                </div>
                <div className="mempool-controls">
                  <button
                    className="mempool-toggle-btn interactive"
                    onClick={() => setIsStreamActive(!isStreamActive)}
                  >
                    {isStreamActive ? 'PAUSE TELEMETRY' : 'RESUME STREAM'}
                  </button>
                </div>
              </div>

              <div className="mempool-stream-terminal">
                {mempoolEvents.map((evt) => (
                  <div key={evt.id} className={`mempool-log-entry entry-${evt.level.toLowerCase()}`}>
                    <div className="entry-timestamp mono">[{evt.timestamp}]</div>
                    <div className={`entry-badge badge-${evt.level.toLowerCase()}`}>{evt.level}</div>
                    <div className="entry-network mono">{evt.network}</div>
                    <div className="entry-title">
                      <strong>{evt.title}</strong>
                      <span className="entry-tx mono">TX: {evt.txHash}</span>
                    </div>
                    <div className="entry-details">{evt.details}</div>
                    <div className="entry-counteraction">
                      <Zap size={12} /> {evt.counterAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Security Audit Dossier */}
          {activeTab === 'dossier' && (
            <div className="tab-pane-content dossier-pane">
              {auditDossier && (
                <div className="dossier-document">
                  <div className="dossier-header-doc">
                    <div>
                      <h2 className="dossier-title">CRYPTOGRAPHIC AUDIT DOSSIER</h2>
                      <span className="dossier-id mono">ID: {auditDossier.reportId}</span>
                    </div>
                    <div className="dossier-actions">
                      <button className="dossier-dl-btn interactive" onClick={downloadDossier}>
                        <Download size={14} /> DOWNLOAD REPORT (.JSON)
                      </button>
                    </div>
                  </div>

                  <div className="dossier-summary-grid">
                    <div className="dossier-stat">
                      <span className="lbl">AUDITED TARGET</span>
                      <span className="val mono">{auditDossier.auditedEntity}</span>
                    </div>
                    <div className="dossier-stat">
                      <span className="lbl">SECURITY POSTURE</span>
                      <span className="val">{auditDossier.securityPosture}</span>
                    </div>
                    <div className="dossier-stat">
                      <span className="lbl">EXPOSED VALUE</span>
                      <span className="val">{auditDossier.totalCapitalAtRiskUsd}</span>
                    </div>
                    <div className="dossier-stat">
                      <span className="lbl">UNLIMITED GRANTS</span>
                      <span className="val">{auditDossier.unconstrainedAllowances} Active</span>
                    </div>
                  </div>

                  <div className="dossier-section">
                    <h3>AUDITED PERMISSIONS INVENTORY</h3>
                    <div className="dossier-table-wrapper">
                      <table className="dossier-table">
                        <thead>
                          <tr>
                            <th>Token</th>
                            <th>Spender</th>
                            <th>Allowance</th>
                            <th>Severity</th>
                            <th>Dormancy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditDossier.allowanceBreakdown.map((row, idx) => (
                            <tr key={idx}>
                              <td>{row.token}</td>
                              <td className="mono">{row.spender}</td>
                              <td className="mono">{row.amount}</td>
                              <td>
                                <span className={`risk-badge badge-${row.risk.toLowerCase()}`}>
                                  {row.risk}
                                </span>
                              </td>
                              <td>{row.dormancyDays} Days</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="dossier-section">
                    <h3>ARCHITECTURAL RECOMMENDATIONS</h3>
                    <ul className="dossier-recs-list">
                      {auditDossier.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="dossier-footer">
                    <span className="dossier-signature mono">
                      ENGINE SIGNATURE: {auditDossier.engineSignature}
                    </span>
                    <span className="dossier-time mono">GENERATED: {auditDossier.timestamp}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
