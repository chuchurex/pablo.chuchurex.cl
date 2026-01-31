import { client } from './client'

// In next-sanity v11, we use the client directly for fetching
// SanityLive is not available - we use ISR + on-demand revalidation instead
export const sanityFetch = async <T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> => {
  return client.fetch<T>(query, params, {
    next: {
      revalidate: 60, // ISR: revalidate every 60 seconds
    },
  })
}
