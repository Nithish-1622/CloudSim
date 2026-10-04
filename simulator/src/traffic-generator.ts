import { TrafficPattern } from '@cloudsim/shared';

export interface TrafficState {
  currentRps: number;
  activeUsers: number;
}

export function calculateTrafficState(
  pattern: TrafficPattern,
  targetRps: number,
  maxVirtualUsers: number,
  elapsedSeconds: number,
  totalDurationSeconds: number
): TrafficState {
  const ratio = Math.min(Math.max(elapsedSeconds / totalDurationSeconds, 0), 1);
  let multiplier = 1.0;

  switch (pattern) {
    case 'NORMAL': {
      // 100% baseline with slight natural jitter (+/- 5%)
      const jitter = (Math.random() - 0.5) * 0.1;
      multiplier = 1.0 + jitter;
      break;
    }

    case 'RAMP_UP': {
      // Linear ramp from 10% to 100%
      multiplier = 0.1 + 0.9 * ratio;
      break;
    }

    case 'RAMP_DOWN': {
      // Linear decrease from 100% to 10%
      multiplier = 1.0 - 0.9 * ratio;
      break;
    }

    case 'SPIKE': {
      // Baseline 20%. Middle third (0.35 to 0.65) spikes to 250%
      if (ratio >= 0.35 && ratio <= 0.65) {
        multiplier = 2.5;
      } else if (ratio > 0.30 && ratio < 0.35) {
        // Sharp climb
        multiplier = 0.2 + (2.3 * (ratio - 0.30)) / 0.05;
      } else if (ratio > 0.65 && ratio < 0.70) {
        // Sharp drop
        multiplier = 2.5 - (2.3 * (ratio - 0.65)) / 0.05;
      } else {
        multiplier = 0.2;
      }
      break;
    }

    case 'BURST': {
      // Alternates between 160% (burst window) and 30% (trough window) every 5 seconds
      const cycle = Math.floor(elapsedSeconds / 5) % 2;
      multiplier = cycle === 0 ? 1.6 : 0.3;
      break;
    }

    case 'FLASH_SALE': {
      // Sudden surge to 300% in first 15% of duration, then decaying exponentially
      if (ratio < 0.15) {
        multiplier = 0.5 + (2.5 * ratio) / 0.15;
      } else {
        const decayProgress = (ratio - 0.15) / 0.85;
        multiplier = 3.0 * Math.exp(-2.5 * decayProgress);
      }
      break;
    }

    case 'CHAOS': {
      // Unpredictable wave combining sine oscillations and random noise
      const sineWave = Math.sin(ratio * Math.PI * 6);
      const noise = (Math.random() - 0.5) * 0.6;
      multiplier = Math.max(0.2, 1.2 + sineWave * 0.8 + noise);
      break;
    }

    default:
      multiplier = 1.0;
  }

  const currentRps = Math.max(1, Math.round(targetRps * multiplier));
  const activeUsers = Math.max(1, Math.round(maxVirtualUsers * Math.min(multiplier, 1.5)));

  return { currentRps, activeUsers };
}
