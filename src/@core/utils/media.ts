import type { MediaInfo } from '@/api/types'

export function getMediaId(media: MediaInfo | undefined) {
  let mediaid = ''
  if (media?.tmdb_id) mediaid = `tmdb:${media?.tmdb_id}`
  else if (media?.douban_id) mediaid = `douban:${media?.douban_id}`
  else if (media?.bangumi_id) mediaid = `bangumi:${media?.bangumi_id}`
  else if (media?.steam_id) mediaid = `steam:${media?.steam_id}`
  else if (media?.javdb_id) mediaid = `javdb:${media?.javdb_id}`

  return mediaid
}
