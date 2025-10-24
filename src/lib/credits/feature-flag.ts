export function areCreditsEnabled(): boolean {
  const raw = process.env.CREDITS_ENABLED

  if (typeof raw === 'undefined' || raw === null) {
    return true
  }

  const normalized = raw.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false
  }

  return true
}

export function areCreditsDisabled(): boolean {
  return !areCreditsEnabled()
}

export function logCreditsDisabled(context: Record<string, unknown>) {
  console.info('Credits module disabled — skipping operation', context)
}

export const UNLIMITED_CREDITS = Number.POSITIVE_INFINITY
