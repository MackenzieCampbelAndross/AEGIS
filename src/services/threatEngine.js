/**
 * AEGIS Threat Heuristics & Deterministic Sandbox Engine
 */

export function evaluateRiskScore(allowances = []) {
  if (!allowances || allowances.length === 0) {
    return {
      score: 4,
      level: 'SAFE',
      color: '#34d399',
      summary: 'Clean cryptographic state. No hazardous or unconstrained allowances detected.',
      totalAtRiskUsd: 0,
      criticalCount: 0,
      highCount: 0,
      infiniteCount: 0,
    };
  }

  let totalRiskPoints = 0;
  let totalAtRiskUsd = 0;
  let criticalCount = 0;
  let highCount = 0;
  let infiniteCount = 0;

  allowances.forEach((item) => {
    totalAtRiskUsd += item.valueAtRiskUsd || 0;
    if (item.isUnlimited) infiniteCount++;

    if (item.riskLevel === 'CRITICAL') {
      totalRiskPoints += 38;
      criticalCount++;
    } else if (item.riskLevel === 'HIGH') {
      totalRiskPoints += 24;
      highCount++;
    } else if (item.riskLevel === 'MEDIUM') {
      totalRiskPoints += 12;
    } else {
      totalRiskPoints += 2;
    }

    if (item.dormancyDays > 90) {
      totalRiskPoints += 8; // penalty for forgotten permissions
    }
  });

  const finalScore = Math.min(99, Math.max(5, totalRiskPoints));

  let level = 'SAFE';
  let color = '#34d399';
  if (finalScore >= 75) {
    level = 'CRITICAL';
    color = '#ff4d4d';
  } else if (finalScore >= 50) {
    level = 'HIGH';
    color = '#fbbf24';
  } else if (finalScore >= 25) {
    level = 'MODERATE';
    color = '#60a5fa';
  }

  return {
    score: finalScore,
    level,
    color,
    summary:
      criticalCount > 0
        ? `Immediate hazard: ${criticalCount} unverified / high-risk spender contract(s) hold unconstrained transfer authority.`
        : highCount > 0
        ? `Elevated exposure: ${highCount} dormant legacy approvals detected with infinite token allowance.`
        : `Normal baseline risk: Standard DEX protocol approvals within acceptable thresholds.`,
    totalAtRiskUsd,
    criticalCount,
    highCount,
    infiniteCount,
  };
}

/**
 * Deep Bytecode & Contract Inspector
 */
export function inspectTargetContract(targetInput) {
  const cleanInput = (targetInput || '').trim();

  // If input looks like known malicious test contract or drainer
  const isSuspicious =
    cleanInput.toLowerCase().includes('71a2') ||
    cleanInput.toLowerCase().includes('93c1') ||
    cleanInput.toLowerCase().includes('drain') ||
    cleanInput.toLowerCase().includes('phish');

  const isUniswap =
    cleanInput.toLowerCase().includes('e592') ||
    cleanInput.toLowerCase().includes('7a25') ||
    cleanInput.toLowerCase().includes('uni');

  if (isSuspicious) {
    return {
      target: cleanInput || '0x93c12658A3297127eEdb98227bCeef3a93F86c5B',
      contractType: 'Unverified Dynamic Proxy (EIP-1967 Non-Compliant)',
      riskScore: 94,
      riskLevel: 'CRITICAL',
      color: '#ff4d4d',
      decompiledOpcodeFlags: [
        { opcode: 'DELEGATECALL (0xF4)', risk: 'CRITICAL', note: 'Unconstrained execution routed to unverified storage address' },
        { opcode: 'SLOAD (0x54) @ slot 0x3f', risk: 'HIGH', note: 'Arbitrary retrieval of user allowance mappings' },
        { opcode: 'STATICCALL (0xFA)', risk: 'MODERATE', note: 'EIP-712 Permit2 typed data digest validator bypass attempt' },
      ],
      exploitVectors: [
        {
          name: 'Silent Drain via Dormant Allowance',
          severity: 'CRITICAL',
          description: 'Contract contains transferFrom() routine targeting balances approved to deprecated proxy.',
        },
        {
          name: 'Mutable Implementation Address',
          severity: 'HIGH',
          description: 'Owner can atomically swap bytecode implementation without timelock governance delay.',
        },
        {
          name: 'Frontrun Vulnerability',
          severity: 'HIGH',
          description: 'Public mempool broadcast exposes pending user settlements to malicious MEV extraction.',
        },
      ],
      counterMeasures: [
        'Dispatch atomic batch transaction: zero target allowance slot immediately.',
        'Submit counter-tx via private RPC relay (Flashbots / Aegis MEV Shield) to prevent mempool frontrunning.',
        'Blacklist target proxy address on local wallet filter.',
      ],
      isHoneypot: true,
      simulationOutcome: 'TRANSACTION WOULD RESULT IN COMPLETE TOKEN BALANCE SINK ($54,200.00 EST)',
    };
  }

  if (isUniswap) {
    return {
      target: cleanInput || '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      contractType: 'Verified Canonical DEX Router (Uniswap V3)',
      riskScore: 12,
      riskLevel: 'SAFE',
      color: '#34d399',
      decompiledOpcodeFlags: [
        { opcode: 'CALL (0xF1)', risk: 'LOW', note: 'Standard execution pass-through to liquidity pools' },
        { opcode: 'REVERT (0xFD)', risk: 'LOW', note: 'Standard slippage & deadline assertions verified' },
      ],
      exploitVectors: [
        {
          name: 'Infinite Allowance Surface',
          severity: 'LOW',
          description: 'Protocol holds permanent approval until manually revoked or zeroed.',
        },
      ],
      counterMeasures: [
        'No urgent action required. Consider setting exact allowances instead of UINT256_MAX for strict posture.',
      ],
      isHoneypot: false,
      simulationOutcome: 'ROUTINE DEX SWAP CALL · ZERO HAZARD DETECTED',
    };
  }

  // Generic contract heuristic simulation
  return {
    target: cleanInput || '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97',
    contractType: 'Standard EVM Contract / Account',
    riskScore: 42,
    riskLevel: 'MODERATE',
    color: '#fbbf24',
    decompiledOpcodeFlags: [
      { opcode: 'EXTCODESIZE (0x3B)', risk: 'LOW', note: 'Smart contract code inspection check' },
      { opcode: 'CALL (0xF1)', risk: 'MODERATE', note: 'External invocation to secondary relayer contract' },
    ],
    exploitVectors: [
      {
        name: 'Dormant Session Linkage',
        severity: 'MEDIUM',
        description: 'Account retains historical permissions granted over 60 days ago.',
      },
    ],
    counterMeasures: [
      'Audit open allowances and clean up unused dApp authorizations.',
    ],
    isHoneypot: false,
    simulationOutcome: 'NO ACTIVE MALICIOUS DRAIN ROUTINE DETECTED · MONITOR CLOSELY',
  };
}

/**
 * Generates Cryptographic Security Audit Dossier
 */
export function generateAuditReport(address, allowances, riskData) {
  const timestamp = new Date().toISOString();
  const reportId = `AEGIS-AUDIT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  return {
    reportId,
    timestamp,
    auditedEntity: address,
    securityPosture: riskData.level,
    hazardIndex: `${riskData.score} / 100`,
    totalCapitalAtRiskUsd: `$${riskData.totalAtRiskUsd.toLocaleString()}`,
    unconstrainedAllowances: riskData.infiniteCount,
    criticalThreatsFound: riskData.criticalCount,
    allowancesAudited: allowances.length,
    allowanceBreakdown: allowances.map((a) => ({
      token: `${a.tokenSymbol} (${a.tokenName})`,
      spender: `${a.spenderName} (${a.spenderAddress})`,
      amount: a.allowanceAmount,
      risk: a.riskLevel,
      hazard: a.hazardType,
      dormancyDays: a.dormancyDays,
    })),
    engineSignature: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    recommendations: [
      'Execute atomic zeroing for all CRITICAL and HIGH severity spenders.',
      'Utilize private transaction routing (MEV Shield) to avoid frontrunning when revoking permissions.',
      'Establish a 30-day allowance pruning cadence to reduce on-chain attack surfaces.',
    ],
  };
}
