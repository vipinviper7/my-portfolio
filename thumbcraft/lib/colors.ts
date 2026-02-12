export const SOLID_COLORS = [
  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd',
  '#868e96', '#495057', '#343a40', '#212529', '#000000',
  '#ff6b6b', '#f06595', '#cc5de8', '#845ef7', '#5c7cfa',
  '#339af0', '#22b8cf', '#20c997', '#51cf66', '#94d82d',
  '#fcc419', '#ff922b', '#ff6b6b', '#e64980', '#be4bdb',
  '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886',
  '#40c057', '#82c91e', '#fab005', '#fd7e14',
]

export interface GradientPreset {
  name: string
  colors: [string, string]
  angle: number
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { name: 'Sunset', colors: ['#ff6b6b', '#feca57'], angle: 135 },
  { name: 'Ocean', colors: ['#0652DD', '#1289A7'], angle: 135 },
  { name: 'Purple Haze', colors: ['#7c3aed', '#db2777'], angle: 135 },
  { name: 'Fresh Mint', colors: ['#0cebeb', '#20e3b2'], angle: 135 },
  { name: 'Warm Flame', colors: ['#ff9a9e', '#fad0c4'], angle: 135 },
  { name: 'Night Sky', colors: ['#0f0c29', '#302b63'], angle: 135 },
  { name: 'Electric', colors: ['#4776E6', '#8E54E9'], angle: 135 },
  { name: 'Peach', colors: ['#ffecd2', '#fcb69f'], angle: 135 },
  { name: 'Cosmic', colors: ['#ff00cc', '#333399'], angle: 135 },
  { name: 'Forest', colors: ['#134E5E', '#71B280'], angle: 135 },
  { name: 'Cherry', colors: ['#EB3349', '#F45C43'], angle: 135 },
  { name: 'Aqua', colors: ['#13547a', '#80d0c7'], angle: 135 },
  { name: 'Candy', colors: ['#fc5c7d', '#6a82fb'], angle: 135 },
  { name: 'Midnight', colors: ['#232526', '#414345'], angle: 135 },
  { name: 'Neon', colors: ['#00f260', '#0575e6'], angle: 135 },
  { name: 'Royal', colors: ['#141e30', '#243b55'], angle: 135 },
]
