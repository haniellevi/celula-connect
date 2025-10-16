"use server";

import { revalidatePath } from 'next/cache'

const PATHS_TO_REVALIDATE = ['/', '/api/public/landing-preview', '/api/public/plans'] as const

export async function revalidateMarketingSnapshots() {
  for (const path of PATHS_TO_REVALIDATE) {
    try {
      await revalidatePath(path)
    } catch (error) {
      console.error(`[revalidateMarketingSnapshots] Failed to revalidate ${path}`, error)
    }
  }
}
