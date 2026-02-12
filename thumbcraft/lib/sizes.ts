export interface SizePreset {
  name: string
  width: number
  height: number
  icon: string
}

export const SIZE_PRESETS: SizePreset[] = [
  { name: 'YouTube Thumbnail', width: 1280, height: 720, icon: 'youtube' },
  { name: 'OG Image', width: 1200, height: 630, icon: 'globe' },
  { name: 'Instagram Post', width: 1080, height: 1080, icon: 'instagram' },
  { name: 'Instagram Story', width: 1080, height: 1920, icon: 'smartphone' },
  { name: 'Twitter/X Post', width: 1600, height: 900, icon: 'twitter' },
  { name: 'Facebook Cover', width: 820, height: 312, icon: 'facebook' },
  { name: 'LinkedIn Banner', width: 1584, height: 396, icon: 'linkedin' },
]
