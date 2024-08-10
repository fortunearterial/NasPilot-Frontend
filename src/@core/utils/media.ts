import type { MediaInfo, Subscribe } from '@/api/types'

export function getMediaid(media: MediaInfo | undefined) {
  let mediaid = ''
  if (media?.tmdb_id) mediaid = `tmdb:${media?.tmdb_id}`
  else if (media?.douban_id) mediaid = `douban:${media?.douban_id}`
  else if (media?.bangumi_id) mediaid = `bangumi:${media?.bangumi_id}`
  else if (media?.steam_id) mediaid = `steam:${media?.steam_id}`
  else if (media?.javdb_id) mediaid = `javdb:${media?.javdb_id}`

  return mediaid
}

export function getMediaid2(media: Subscribe | undefined) {
  let mediaid = ''
  if (media?.tmdbid) mediaid = `tmdb:${media?.tmdbid}`
  else if (media?.doubanid) mediaid = `douban:${media?.doubanid}`
  else if (media?.steamid) mediaid = `steam:${media?.steamid}`
  else if (media?.javdbid) mediaid = `javdb:${media?.javdbid}`

  return mediaid
}
