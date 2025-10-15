import type { ClerkPlanFeature, ClerkPlanMoney, ClerkPlanNormalized } from './commerce-plan-types'

const CLERK_PLAN_ENDPOINTS = ['https://api.clerk.com/v1/commerce/plans']

function parseCurrency(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed.toLowerCase() : null
}

function parseCurrencySymbol(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function parseAmountValue(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null
    return Number.isInteger(value) ? value : Math.round(value * 100)
  }
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '.').replace(/[^0-9.\-]/g, '')
    if (!normalized) return null
    const parsed = Number(normalized)
    if (!Number.isFinite(parsed)) return null
    return Number.isInteger(parsed) ? parsed : Math.round(parsed * 100)
  }
  return null
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toUnknownArray = (value: unknown): unknown[] | null => (Array.isArray(value) ? value : null)

function parseMoney(
  raw: unknown,
  fallbackCurrency: string | null,
  fallbackCurrencySymbol: string | null,
  fallbackFormatted?: string | null,
): ClerkPlanMoney | null {
  if (raw == null) {
    if (fallbackFormatted) {
      return {
        amount: null,
        currency: fallbackCurrency,
        currencySymbol: fallbackCurrencySymbol,
        formatted: fallbackFormatted,
      }
    }
    return null
  }
  if (typeof raw === 'number' || typeof raw === 'string') {
    const amount = parseAmountValue(raw)
    if (amount == null) return null
    return {
      amount,
      currency: fallbackCurrency,
      currencySymbol: fallbackCurrencySymbol,
      formatted: fallbackFormatted ?? null,
    }
  }
  if (!isPlainObject(raw)) return null
  const amount = parseAmountValue(raw.amount ?? raw.value)
  if (amount == null && !fallbackFormatted && typeof raw.amount_formatted !== 'string') return null
  const currency = parseCurrency(raw.currency) ?? fallbackCurrency
  const currencySymbol = parseCurrencySymbol(raw.currency_symbol) ?? fallbackCurrencySymbol
  const formatted = typeof raw.amount_formatted === 'string'
    ? raw.amount_formatted
    : fallbackFormatted ?? null
  return {
    amount,
    currency,
    currencySymbol,
    formatted,
  }
}

function safeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function safeBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lowered = value.toLowerCase()
    if (['true', '1', 'yes'].includes(lowered)) return true
    if (['false', '0', 'no'].includes(lowered)) return false
  }
  return null
}

function safeNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function normalizePlan(raw: unknown): ClerkPlanNormalized | null {
  if (!isPlainObject(raw)) return null

  const id = safeString(raw.id ?? raw.plan_id ?? raw.key ?? raw.slug)
  if (!id) return null

  const baseCurrency = parseCurrency(raw.currency)
    ?? (isPlainObject(raw.fee) ? parseCurrency(raw.fee.currency) : null)
    ?? (isPlainObject(raw.annual_fee) ? parseCurrency(raw.annual_fee.currency) : null)
    ?? null
  const baseSymbol = parseCurrencySymbol(raw.currency_symbol)
    ?? (isPlainObject(raw.fee) ? parseCurrencySymbol(raw.fee.currency_symbol) : null)
    ?? (isPlainObject(raw.annual_fee) ? parseCurrencySymbol(raw.annual_fee.currency_symbol) : null)
    ?? null

  const monthlyPrice = parseMoney(
    raw.amount,
    baseCurrency,
    baseSymbol,
    typeof raw.amount_formatted === 'string' ? raw.amount_formatted : null,
  )
  const annualMonthlyPrice = parseMoney(
    raw.annual_monthly_amount,
    monthlyPrice?.currency ?? baseCurrency,
    monthlyPrice?.currencySymbol ?? baseSymbol,
    typeof raw.annual_monthly_amount_formatted === 'string'
      ? raw.annual_monthly_amount_formatted
      : null,
  )
  const annualPrice = parseMoney(
    raw.annual_amount,
    monthlyPrice?.currency ?? baseCurrency,
    monthlyPrice?.currencySymbol ?? baseSymbol,
    typeof raw.annual_amount_formatted === 'string'
      ? raw.annual_amount_formatted
      : null,
  )

  const setupFee = parseMoney(raw.fee, baseCurrency, baseSymbol)
  const annualMonthlySetupFee = parseMoney(raw.annual_monthly_fee, baseCurrency, baseSymbol)
  const annualSetupFee = parseMoney(raw.annual_fee, baseCurrency, baseSymbol)

  const currency = monthlyPrice?.currency ?? annualPrice?.currency ?? baseCurrency
  const currencySymbol = monthlyPrice?.currencySymbol ?? annualPrice?.currencySymbol ?? baseSymbol

  const features: ClerkPlanFeature[] = Array.isArray(raw.features)
    ? raw.features
        .filter(isPlainObject)
        .map((feature) => ({
          id: safeString(feature.id),
          name: safeString(feature.name),
          description: safeString(feature.description),
          slug: safeString(feature.slug),
          avatarUrl: safeString(feature.avatar_url),
        }))
    : []

  const payerTypeRaw = raw.payer_type

  return {
    id,
    name: safeString(raw.name),
    description: safeString(raw.description),
    slug: safeString(raw.slug),
    productId: safeString(raw.product_id),
    currency,
    currencySymbol,
    period: safeString(raw.period),
    interval: safeNumber(raw.interval),
    isDefault: safeBoolean(raw.is_default),
    isRecurring: safeBoolean(raw.is_recurring),
    publiclyVisible: safeBoolean(raw.publicly_visible),
    hasBaseFee: safeBoolean(raw.has_base_fee),
    payerType: Array.isArray(payerTypeRaw)
      ? payerTypeRaw.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      : [],
    forPayerType: safeString(raw.for_payer_type),
    avatarUrl: safeString(raw.avatar_url),
    freeTrialEnabled: safeBoolean(raw.free_trial_enabled),
    freeTrialDays: safeNumber(raw.free_trial_days),
    prices: {
      ...(monthlyPrice ? { month: monthlyPrice } : {}),
      ...(annualPrice ? { year: annualPrice } : {}),
      ...(annualMonthlyPrice ? { annualMonthly: annualMonthlyPrice } : {}),
      ...(setupFee ? { setupFee } : {}),
      ...(annualSetupFee ? { annualSetupFee } : {}),
      ...(annualMonthlySetupFee ? { annualMonthlySetupFee } : {}),
    },
    features,
  }
}

export async function fetchCommercePlans(): Promise<ClerkPlanNormalized[]> {
  const token = process.env.CLERK_BILLING_API_KEY || process.env.CLERK_SECRET_KEY
  if (!token) {
    throw new Error('CLERK_SECRET_KEY not configured')
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const errors: Array<{ url: string; status?: number; message?: string }> = []

  for (const url of CLERK_PLAN_ENDPOINTS) {
    try {
      const response = await fetch(url, { method: 'GET', headers, cache: 'no-store' })
      const text = await response.text()
      if (!response.ok) {
        errors.push({ url, status: response.status, message: text?.slice(0, 500) })
        continue
      }
      let payload: unknown = null
      try {
        payload = text ? JSON.parse(text) : null
      } catch {
        payload = null
      }
      const payloadRecord = isPlainObject(payload) ? payload : null
      const collection =
        toUnknownArray(payload) ??
        (payloadRecord && toUnknownArray(payloadRecord.plans)) ??
        (payloadRecord && toUnknownArray(payloadRecord.data)) ??
        (payloadRecord && toUnknownArray(payloadRecord.items)) ??
        (payloadRecord && toUnknownArray(payloadRecord.products)) ??
        []

      const normalized = collection
        .map((item) => normalizePlan(item))
        .filter((plan): plan is ClerkPlanNormalized => plan !== null)

      if (normalized.length > 0) {
        return normalized
      }
      errors.push({ url, message: 'No plans found in response' })
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : isPlainObject(error) && typeof error.message === 'string'
            ? error.message
            : String(error)
      errors.push({ url, message })
    }
  }

  throw new Error(`Failed to fetch Clerk plans: ${JSON.stringify(errors)}`)
}
