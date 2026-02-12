export interface FontOption {
  name: string
  family: string
  category: 'display' | 'body' | 'handwriting'
  isPremium: boolean
  weights: number[]
}

export const FONTS: FontOption[] = [
  { name: 'Poppins', family: 'Poppins', category: 'body', isPremium: false, weights: [400, 600, 700, 800, 900] },
  { name: 'Montserrat', family: 'Montserrat', category: 'body', isPremium: false, weights: [400, 500, 600, 700, 800, 900] },
  { name: 'Oswald', family: 'Oswald', category: 'display', isPremium: false, weights: [400, 500, 600, 700] },
  { name: 'Playfair Display', family: 'Playfair Display', category: 'display', isPremium: false, weights: [400, 500, 600, 700, 800, 900] },
  { name: 'Bebas Neue', family: 'Bebas Neue', category: 'display', isPremium: false, weights: [400] },
  { name: 'Raleway', family: 'Raleway', category: 'body', isPremium: false, weights: [400, 500, 600, 700, 800] },
  { name: 'Lato', family: 'Lato', category: 'body', isPremium: false, weights: [400, 700, 900] },
  { name: 'Roboto Slab', family: 'Roboto Slab', category: 'body', isPremium: false, weights: [400, 500, 600, 700, 800, 900] },
  { name: 'Anton', family: 'Anton', category: 'display', isPremium: false, weights: [400] },
  { name: 'Righteous', family: 'Righteous', category: 'display', isPremium: false, weights: [400] },
  { name: 'Dancing Script', family: 'Dancing Script', category: 'handwriting', isPremium: true, weights: [400, 500, 600, 700] },
  { name: 'Permanent Marker', family: 'Permanent Marker', category: 'handwriting', isPremium: true, weights: [400] },
  { name: 'Archivo Black', family: 'Archivo Black', category: 'display', isPremium: true, weights: [400] },
  { name: 'Abril Fatface', family: 'Abril Fatface', category: 'display', isPremium: true, weights: [400] },
  { name: 'Bangers', family: 'Bangers', category: 'display', isPremium: true, weights: [400] },
]

export const GOOGLE_FONTS_URL = `https://fonts.googleapis.com/css2?${FONTS.map(
  (f) => `family=${f.family.replace(/ /g, '+')}:wght@${f.weights.join(';')}`
).join('&')}&display=swap`
