/**
 * AEGIS Real-time Mempool Telemetry & Threat Stream
 */

const SAMPLE_EVENTS = [
  {
    type: 'INTERCEPT',
    level: 'CRITICAL',
    title: 'Dormant Allowance Drain Attempt Intercepted',
    txHash: '0x94f1...8c2b',
    target: '0x71a2...9b4d',
    network: 'Ethereum',
    details: 'Spender 0x93c1...6c5B initiated transferFrom(0x71a2, 54,200 USDT). Blocked by Aegis MEV Relayer.',
    counterAction: 'Zero-allowance counter-tx broadcasted to private builder (Bundle #48291)',
    gasSaved: '0.042 ETH',
  },
  {
    type: 'ALERT',
    level: 'HIGH',
    title: 'Unverified Dynamic Proxy Deployment Detected',
    txHash: '0x3a82...19de',
    target: '0x1402...ff12',
    network: 'Arbitrum',
    details: 'DELEGATECALL pointing to uninitialized storage slot. Bytecode matched Drainer:Inferno variant.',
    counterAction: 'Heuristic signature added to global blackhole filter',
    gasSaved: '-',
  },
  {
    type: 'INTERCEPT',
    level: 'CRITICAL',
    title: 'Phishing Permit2 EIP-712 Signature Flagged',
    txHash: '0xfe19...5530',
    target: '0x4838...5f97',
    network: 'Base',
    details: 'Victim attempted off-chain permit signature with UINT256_MAX allowance to unverified router.',
    counterAction: 'Aegis client intercepted signature digest before relay',
    gasSaved: '4.8 ETH',
  },
  {
    type: 'MONITOR',
    level: 'SAFE',
    title: 'Routine Canonical Swap Settlement',
    txHash: '0x621a...bb03',
    target: '0xd8da...0045',
    network: 'Ethereum',
    details: 'Uniswap V3 SwapRouter executed 2.50 ETH swap. Zero hazard flags.',
    counterAction: 'State verified · In-flight risk score 8/100',
    gasSaved: '-',
  },
  {
    type: 'INTERCEPT',
    level: 'HIGH',
    title: 'Malicious Sandwich Frontrun Neutralized',
    txHash: '0x8821...4419',
    target: '0xa391...120f',
    network: 'Optimism',
    details: 'Predatory MEV bot attempted 12% slippage squeeze on user liquidity deposit.',
    counterAction: 'Protected by private RPC conduit · Routed directly to builder block',
    gasSaved: '0.18 ETH',
  },
  {
    type: 'ALERT',
    level: 'MEDIUM',
    title: 'Dormant Allowance Exceeding 180 Days Threshold',
    txHash: '0x77c2...e81a',
    target: '0x6199...c014',
    network: 'Polygon',
    details: 'Token allowance on deprecated SushiSwap v1 router inactive since Q2 2024.',
    counterAction: 'Marked for atomic pruning in user security dossier',
    gasSaved: '-',
  },
];

export function createMempoolStream(onEvent, intervalMs = 3500) {
  let timerId = null;
  let isRunning = false;
  let index = 0;

  function start() {
    if (isRunning) return;
    isRunning = true;

    // Emit initial event immediately
    onEvent({
      ...SAMPLE_EVENTS[0],
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
    });

    timerId = setInterval(() => {
      index = (index + 1) % SAMPLE_EVENTS.length;
      const base = SAMPLE_EVENTS[index];
      const event = {
        ...base,
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      onEvent(event);
    }, intervalMs);
  }

  function stop() {
    isRunning = false;
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  return {
    start,
    stop,
    isRunning: () => isRunning,
  };
}
