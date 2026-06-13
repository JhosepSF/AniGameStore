import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  is_primary: boolean
}

export interface ProductVariant {
  id: string
  product_id: string
  sku_variant: string
  variant_type: string
  variant_value: string
  price_adjustment: number
  stock: number
}

export interface Product {
  id: string
  sku: string
  internal_code: string
  name: string
  slug: string
  short_description: string
  long_description: string
  category_id: string
  subcategory_id?: string
  brand_id?: string
  franchise: string
  price_normal: number
  price_offer?: number
  price_wholesale?: number
  discount_percentage: number
  stock: number
  stock_reserved: number
  status: 'active' | 'inactive' | 'archived' | 'out_of_stock'
  rating_avg: number
  views_count: number
  sales_count: number
  created_at: string
  images: string[]
  videos?: string[]
  variants: ProductVariant[]
  tags: string[]
  category_name?: string
  brand_name?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url?: string
}

export interface Review {
  id: string
  product_id: string
  user_name: string
  user_avatar?: string
  rating: number
  comment: string
  is_verified_purchase: boolean
  created_at: string
}

export interface Question {
  id: string
  product_id: string
  user_name: string
  question: string
  created_at: string
  answer?: string
}

// ----------------------------------------------------
// Mock Categories (Matching the core franchises)
// ----------------------------------------------------
export const MOCK_CATEGORIES: Category[] = [
  { id: 'c0c0c0c0-c0c0-c0c0-c0c0-000000000001', name: 'One Piece', slug: 'one-piece', description: 'Figuras, posters, mochilas y llaveros de la tripulación Sombrero de Paja.' },
  { id: 'c0c0c0c0-c0c0-c0c0-c0c0-000000000002', name: 'Naruto', slug: 'naruto', description: 'Coleccionables de la Aldea de la Hoja, figuras escala y accesorios ninja.' },
  { id: 'c0c0c0c0-c0c0-c0c0-c0c0-000000000003', name: 'Dragon Ball', slug: 'dragon-ball', description: 'Estatuas de Goku, villanos clásicos y esferas del dragón de colección.' },
  { id: 'c0c0c0c0-c0c0-c0c0-c0c0-000000000004', name: 'Demon Slayer', slug: 'demon-slayer', description: 'Katanas LEGO, figuras de pilares y peluches oficiales de Kimetsu no Yaiba.' },
  { id: 'c0c0c0c0-c0c0-c0c0-c0c0-000000000005', name: 'Pokémon', slug: 'pokemon', description: 'Pokébolas LED, peluches cosplay e iluminación decorativa de Pikachu.' },
  { id: 'c0c0c0c0-c0c0-c0c0-c0c0-000000000006', name: 'Genshin Impact', slug: 'genshin-impact', description: 'Figuras oficiales a escala de Teyvat, Xiao, Hu Tao y Paimon.' },
  { id: 'c0c0c0c0-c0c0-c0c0-c0c0-000000000007', name: 'Marvel', slug: 'marvel', description: 'Colección de superhéroes, figuras de Venom, Iron Man y bustos.' },
  { id: 'c0c0c0c0-c0c0-c0c0-c0c0-000000000008', name: 'Adicionales', slug: 'adicionales', description: 'Nintendo Switch OLED, accesorios gamer, mandos PS5 y gadgets geek.' }
]

export const MOCK_BRANDS: Brand[] = [
  { id: 'b0b0b0b0-b0b0-b0b0-b0b0-000000000001', name: 'Bandai Spirits', slug: 'bandai-spirits' },
  { id: 'b0b0b0b0-b0b0-b0b0-b0b0-000000000002', name: 'Funko Pop', slug: 'funko-pop' },
  { id: 'b0b0b0b0-b0b0-b0b0-b0b0-000000000003', name: 'Nintendo', slug: 'nintendo' },
  { id: 'b0b0b0b0-b0b0-b0b0-b0b0-000000000004', name: 'Razer', slug: 'razer' },
  { id: 'b0b0b0b0-b0b0-b0b0-b0b0-000000000005', name: 'Sony PlayStation', slug: 'sony-playstation' },
  { id: 'b0b0b0b0-b0b0-b0b0-b0b0-000000000006', name: 'Logitech G', slug: 'logitech-g' }
]

export const categoryUuidMap: Record<string, string> = {
  'cat-one-piece': 'c0c0c0c0-c0c0-c0c0-c0c0-000000000001',
  'cat-naruto': 'c0c0c0c0-c0c0-c0c0-c0c0-000000000002',
  'cat-dragon-ball': 'c0c0c0c0-c0c0-c0c0-c0c0-000000000003',
  'cat-demon-slayer': 'c0c0c0c0-c0c0-c0c0-c0c0-000000000004',
  'cat-pokemon': 'c0c0c0c0-c0c0-c0c0-c0c0-000000000005',
  'cat-genshin-impact': 'c0c0c0c0-c0c0-c0c0-c0c0-000000000006',
  'cat-marvel': 'c0c0c0c0-c0c0-c0c0-c0c0-000000000007',
  'cat-adicionales': 'c0c0c0c0-c0c0-c0c0-c0c0-000000000008'
}

const skuPrefixMap: Record<string, string> = {
  'OP': '1111',
  'NS': '2222',
  'DB': '3333',
  'DS': '4444',
  'PO': '5555',
  'GI': '6666',
  'MA': '7777',
  'AA': '8888'
}

export function getProductUuidFromSku(sku: string): string {
  const parts = sku.split('-')
  const prefix = parts[0]
  const numPart = parts[1] || '000'
  const code = skuPrefixMap[prefix] || '0000'
  const paddedNum = numPart.padStart(8, '0')
  return `d0d0d0d0-d0d0-d0d0-d0d0-${code}${paddedNum}`
}


// Raw products list input from the user
const rawProductsData = [
  // ONE PIECE
  { sku: 'OP-001', name: 'Figura Barba Blanca 29cm', price: 120, available: true, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-002', name: 'Figura Monkey D. Luffy 24cm', price: 50, available: true, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-003', name: 'Figura Zoro Roronoa 20cm', price: 90, available: true, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-004', name: 'Figura Dracule Mihawk 15cm', price: 70, available: true, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-005', name: 'Figura Seraphim Mihawk 16cm', price: 60, available: true, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-006', name: 'Figura Charlotte Katakuri 23cm', price: 80, available: true, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-007', name: 'LEGO Katana Wado Ichimonji', price: 65, available: true, type: 'lego', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-008', name: 'Figura Sanji 30cm', price: 85, available: true, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-009', name: 'Figura Zoro 30cm', price: 85, available: false, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' }, // pedido
  { sku: 'OP-010', name: 'Figura Luffy niño y Shanks 18cm', price: 80, available: false, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-011', name: 'Mini Figura Luffy Gear5 10cm', price: 35, available: true, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-012', name: 'Mini Figura Zoro 10cm', price: 35, available: false, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-013', name: 'Mini Figura Luffy 10cm', price: 35, available: false, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-014', name: 'Mini Figura Sabot 10cm', price: 35, available: true, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-015', name: 'Figura Barco Going Merry 8.5cm', price: 35, available: true, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-016', name: 'Figura Ace 18cm', price: 60, available: false, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-017', name: 'Figura Zoro tres hojas 18cm', price: 45, available: true, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-018', name: 'Figura Sun God Nika Luffy Gear 5 18cm', price: 75, available: false, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-019', name: 'Llavero fruta del diablo metal', price: 25, available: false, type: 'llavero', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-020', name: 'Llavero fruta del diablo metal', price: 25, available: true, type: 'llavero', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-021', name: 'Llavero fruta del diablo metal', price: 25, available: false, type: 'llavero', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-022', name: 'Llavero PVC Luffy', price: 25, available: true, type: 'llavero', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-023', name: 'Llavero PVC Zoro', price: 25, available: false, type: 'llavero', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-024', name: 'Llavero Zoro Funko Pop', price: 35, available: false, type: 'llavero', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-025', name: 'Poster Gear 5 Luffy Sun God 28.5x42cm', price: 20, available: true, type: 'poster', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-026', name: 'Poster Gol D.Roger 28.5x42cm', price: 20, available: true, type: 'poster', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-027', name: 'Poster Zoro Roronoa 28.5x42cm', price: 20, available: true, type: 'poster', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-028', name: 'Poster Portgas D. Ace 28.5x42cm', price: 20, available: true, type: 'poster', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-029', name: 'Mochila One Piece lona', price: 280, available: false, type: 'mochila', catId: 'cat-one-piece', franchise: 'One Piece' },
  { sku: 'OP-030', name: 'Figura Luffy Gear 5 dios del sol 28cm', price: 120, available: false, type: 'figura', catId: 'cat-one-piece', franchise: 'One Piece' },

  // NARUTO
  { sku: 'NS-001', name: 'Figura Madara Uchiha 17cm', price: 50, available: true, type: 'figura', catId: 'cat-naruto', franchise: 'Naruto' },
  { sku: 'NS-002', name: 'Figura Naruto Hokage 17cm', price: 60, available: true, type: 'figura', catId: 'cat-naruto', franchise: 'Naruto' },
  { sku: 'NS-003', name: 'Mini Figura Itachi y Obito 8cm', price: 30, available: true, type: 'figura', catId: 'cat-naruto', franchise: 'Naruto' },
  { sku: 'NS-004', name: 'Mini Figura Naruto 8cm', price: 30, available: true, type: 'figura', catId: 'cat-naruto', franchise: 'Naruto' },
  { sku: 'NS-005', name: 'Mini Figura Kakashi 8cm', price: 30, available: true, type: 'figura', catId: 'cat-naruto', franchise: 'Naruto' },
  { sku: 'NS-006', name: 'Mini Figura Sasuke Uchiha 8cm', price: 30, available: false, type: 'figura', catId: 'cat-naruto', franchise: 'Naruto' },
  { sku: 'NS-007', name: 'Lote 6 figuras Naruto 7-8cm', price: 60, available: true, type: 'figura', catId: 'cat-naruto', franchise: 'Naruto' },
  { sku: 'NS-008', name: 'Figuras rostros Naruto 14cm', price: 80, available: false, type: 'figura', catId: 'cat-naruto', franchise: 'Naruto' },
  { sku: 'NS-009', name: 'Figura Obito Uchiha 26cm', price: 130, available: false, type: 'figura', catId: 'cat-naruto', franchise: 'Naruto' },
  { sku: 'NS-010', name: 'Llavero PVC Kakashi Hatake', price: 25, available: true, type: 'llavero', catId: 'cat-naruto', franchise: 'Naruto' },
  { sku: 'NS-011', name: 'Mochila Naruto lona', price: 280, available: false, type: 'mochila', catId: 'cat-naruto', franchise: 'Naruto' },
  { sku: 'NS-012', name: 'Mini Figura Sakura 8cm', price: 30, available: false, type: 'figura', catId: 'cat-naruto', franchise: 'Naruto' },

  // DRAGON BALL
  { sku: 'DB-001', name: 'Lote 5 figuras Majin Buu ejercicio', price: 80, available: true, type: 'figura', catId: 'cat-dragon-ball', franchise: 'Dragon Ball' },
  { sku: 'DB-002', name: 'Figura Goku Super Saiyajin 16cm', price: 45, available: true, type: 'figura', catId: 'cat-dragon-ball', franchise: 'Dragon Ball' },
  { sku: 'DB-003', name: 'Figura Bills Dios de la Destrucción 30cm', price: 110, available: true, type: 'figura', catId: 'cat-dragon-ball', franchise: 'Dragon Ball' },
  { sku: 'DB-004', name: 'Figura Broly 20cm', price: 60, available: false, type: 'figura', catId: 'cat-dragon-ball', franchise: 'Dragon Ball' },
  { sku: 'DB-005', name: 'Figura Goku niño nube voladora 11cm', price: 40, available: false, type: 'figura', catId: 'cat-dragon-ball', franchise: 'Dragon Ball' },
  { sku: 'DB-006', name: 'Figura Super Gohan 28cm', price: 90, available: true, type: 'figura', catId: 'cat-dragon-ball', franchise: 'Dragon Ball' },
  { sku: 'DB-007', name: 'Mini Figuras Goku y Vegeta 8cm', price: 50, available: false, type: 'figura', catId: 'cat-dragon-ball', franchise: 'Dragon Ball' },
  { sku: 'DB-008', name: 'Llavero Maestro Roshi 8cm', price: 20, available: false, type: 'llavero', catId: 'cat-dragon-ball', franchise: 'Dragon Ball' },
  { sku: 'DB-009', name: 'Figuras Dragon Ball GT Goku/Vegeta/Gogeta 20cm', price: 70, available: false, type: 'figura', catId: 'cat-dragon-ball', franchise: 'Dragon Ball' },

  // DEMON SLAYER
  { sku: 'DS-001', name: 'Figura Nezuko 16cm', price: 60, available: false, type: 'figura', catId: 'cat-demon-slayer', franchise: 'Demon Slayer' },
  { sku: 'DS-002', name: 'LEGO Rengoku 1383 piezas', price: 65, available: true, type: 'lego', catId: 'cat-demon-slayer', franchise: 'Demon Slayer' },
  { sku: 'DS-003', name: 'Figura Shinobu 16cm', price: 40, available: true, type: 'figura', catId: 'cat-demon-slayer', franchise: 'Demon Slayer' },
  { sku: 'DS-004', name: 'Figura Hashibira Inosuke', price: 60, available: false, type: 'figura', catId: 'cat-demon-slayer', franchise: 'Demon Slayer' },
  { sku: 'DS-005', name: 'Figura Pikachu Zenitsu Agatsuma 15cm', price: 60, available: false, type: 'figura', catId: 'cat-demon-slayer', franchise: 'Demon Slayer' },
  { sku: 'DS-006', name: 'Figura Rengoku 13cm premium', price: 120, available: false, type: 'figura', catId: 'cat-demon-slayer', franchise: 'Demon Slayer' },
  { sku: 'DS-007', name: 'Llavero Inosuke', price: 20, available: false, type: 'llavero', catId: 'cat-demon-slayer', franchise: 'Demon Slayer' },
  { sku: 'DS-008', name: 'Lote 4 figuras Demon Slayer 6cm', price: 35, available: false, type: 'figura', catId: 'cat-demon-slayer', franchise: 'Demon Slayer' },
  { sku: 'DS-009', name: 'Figura Rengoku 13cm', price: 60, available: false, type: 'figura', catId: 'cat-demon-slayer', franchise: 'Demon Slayer' },

  // POKÉMON
  { sku: 'PO-001', name: 'Figura Pikachu X-men Deadpool 15cm', price: 60, available: true, type: 'figura', catId: 'cat-pokemon', franchise: 'Pokémon' },
  { sku: 'PO-002', name: 'Bola cristal 3D Gengar con LED', price: 80, available: true, type: 'lámpara', catId: 'cat-pokemon', franchise: 'Pokémon' },
  { sku: 'PO-003', name: 'Luz nocturna Pikachu', price: 35, available: false, type: 'lámpara', catId: 'cat-pokemon', franchise: 'Pokémon' },
  { sku: 'PO-004', name: 'Figura Greninja Ash 16cm', price: 100, available: true, type: 'figura', catId: 'cat-pokemon', franchise: 'Pokémon' },
  { sku: 'PO-005', name: 'Figura Mega Charizard X 18cm', price: 90, available: true, type: 'figura', catId: 'cat-pokemon', franchise: 'Pokémon' },
  { sku: 'PO-006', name: 'Figura Charizard 9cm', price: 50, available: true, type: 'figura', catId: 'cat-pokemon', franchise: 'Pokémon' },
  { sku: 'PO-007', name: 'Humidificador Gastly luz RGB', price: 125, available: false, type: 'lámpara', catId: 'cat-pokemon', franchise: 'Pokémon' },
  { sku: 'PO-008', name: 'Peluche Pikachu cosplay Garchomp 20cm', price: 70, available: true, type: 'peluche', catId: 'cat-pokemon', franchise: 'Pokémon' },
  { sku: 'PO-009', name: 'Peluche Pikachu cosplay Mega Charizard X 20cm', price: 65, available: true, type: 'peluche', catId: 'cat-pokemon', franchise: 'Pokémon' },

  // GENSHIN IMPACT
  { sku: 'GI-001', name: 'Figura Xiao 20cm', price: 75, available: true, type: 'figura', catId: 'cat-genshin-impact', franchise: 'Genshin Impact' },
  { sku: 'GI-002', name: 'Figura Hu Tao 10cm', price: 55, available: true, type: 'figura', catId: 'cat-genshin-impact', franchise: 'Genshin Impact' },
  { sku: 'GI-003', name: 'Mini figura Paimon 5cm', price: 15, available: true, type: 'figura', catId: 'cat-genshin-impact', franchise: 'Genshin Impact' },

  // MARVEL
  { sku: 'MA-001', name: 'Figura Venom 11cm con base', price: 55, available: true, type: 'figura', catId: 'cat-marvel', franchise: 'Marvel' },
  { sku: 'MA-002', name: 'Llavero Loki Funko Pop', price: 40, available: false, type: 'llavero', catId: 'cat-marvel', franchise: 'Marvel' },
  { sku: 'MA-003', name: 'Llavero DeadPool', price: 25, available: false, type: 'llavero', catId: 'cat-marvel', franchise: 'Marvel' },
  { sku: 'MA-004', name: 'Busto Pantera Negra / Iron Man 16cm', price: 60, available: false, type: 'figura', catId: 'cat-marvel', franchise: 'Marvel' },
  { sku: 'MA-005', name: 'Llavero Miles Morales', price: 25, available: false, type: 'llavero', catId: 'cat-marvel', franchise: 'Marvel' },
  { sku: 'MA-006', name: 'Figura Tony Stark Iron Man MK3 bailando', price: 100, available: false, type: 'figura', catId: 'cat-marvel', franchise: 'Marvel' },

  // ADICIONALES
  { sku: 'AA-001', name: 'Figura SPY×FAMILY Yor Forger 16cm', price: 50, available: true, type: 'figura', catId: 'cat-adicionales', franchise: 'Adicionales' },
  { sku: 'AA-002', name: 'Karambit Reaver Valorant 16cm', price: 60, available: true, type: 'figura', catId: 'cat-adicionales', franchise: 'Adicionales' },
  { sku: 'AA-003', name: 'Dedo de Sukuna Jujutsu Kaisen', price: 45, available: true, type: 'figura', catId: 'cat-adicionales', franchise: 'Adicionales' },
  { sku: 'AA-004', name: 'Llavero Chainsaw Man Pochita', price: 25, available: true, type: 'llavero', catId: 'cat-adicionales', franchise: 'Adicionales' },
  { sku: 'AA-005', name: 'Bolsa colgante Pochita 12cm', price: 20, available: true, type: 'bolsa', catId: 'cat-adicionales', franchise: 'Adicionales' },
  { sku: 'AA-006', name: 'Luz nocturna capibara', price: 80, available: true, type: 'lámpara', catId: 'cat-adicionales', franchise: 'Adicionales' },
  { sku: 'AA-007', name: 'Luz LED Super Mario pregunta', price: 60, available: true, type: 'lámpara', catId: 'cat-adicionales', franchise: 'Adicionales' },
  { sku: 'AA-008', name: 'Lámpara cristal 3D decoración', price: 60, available: true, type: 'lámpara', catId: 'cat-adicionales', franchise: 'Adicionales' },
  { sku: 'AA-009', name: 'Nintendo Switch OLED', price: 1500, available: true, type: 'consola', catId: 'cat-adicionales', franchise: 'Adicionales' },
  { sku: 'AA-010', name: 'Juguete dinosaurio ZAZAZA', price: 35, available: true, type: 'figura', catId: 'cat-adicionales', franchise: 'Adicionales' },
  { sku: 'AA-011', name: 'DualSense PS5 original Sony', price: 320, available: true, type: 'consola', catId: 'cat-adicionales', franchise: 'Adicionales' }
]

const typeImages: Record<string, string[]> = {
  figura: [
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=60'
  ],
  llavero: [
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=60'
  ],
  poster: [
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=60'
  ],
  mochila: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60'
  ],
  lego: [
    'https://images.unsplash.com/photo-1585366119957-e5730f3d6fcd?w=600&auto=format&fit=crop&q=60'
  ],
  lámpara: [
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=60'
  ],
  peluche: [
    'https://images.unsplash.com/photo-1559251606-c623743a6d76?w=600&auto=format&fit=crop&q=60'
  ],
  consola: [
    'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600&auto=format&fit=crop&q=60'
  ],
  bolsa: [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=60'
  ],
  general: [
    'https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=600&auto=format&fit=crop&q=60'
  ]
}

// Generate full products data dynamically
export const MOCK_PRODUCTS: Product[] = rawProductsData.map((raw, i) => {
  const images = typeImages[raw.type] || typeImages['general']
  const slug = raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + raw.sku.toLowerCase()
  const realCatId = categoryUuidMap[raw.catId] || raw.catId
  return {
    id: getProductUuidFromSku(raw.sku),
    sku: raw.sku,
    internal_code: `AG-${raw.sku}`,
    name: raw.name,
    slug: slug,
    short_description: `${raw.name} oficial e importado de alta calidad. Perfecto para fanáticos y coleccionistas.`,
    long_description: `${raw.name} cuenta con excelentes acabados y detalles de pintura fieles al diseño original. Ideal para coleccionar y decorar tu espacio geek.`,
    category_id: realCatId,
    category_name: MOCK_CATEGORIES.find(c => c.id === realCatId)?.name || 'Adicionales',
    franchise: raw.franchise,
    price_normal: Math.round(raw.price * 1.25 * 10) / 10, // normal is 25% higher for fake discount
    price_offer: raw.price,
    discount_percentage: 20,
    stock: raw.available ? 8 : 0,
    stock_reserved: 0,
    status: raw.available ? 'active' as const : 'out_of_stock' as const,
    rating_avg: Number((4.6 + (i % 5) * 0.1).toFixed(2)),
    views_count: 120 + (i * 12),
    sales_count: 5 + (i * 2),
    created_at: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(),
    images: images,
    variants: [],
    tags: raw.available ? (i % 3 === 0 ? ['Mejor Vendido'] : i % 3 === 1 ? ['Nuevo Ingreso'] : ['Premium']) : ['Agotado']
  }
})

export const MOCK_REVIEWS: Record<string, Review[]> = {}
export const MOCK_QUESTIONS: Record<string, Question[]> = {}

// ----------------------------------------------------
// Service Methods
// ----------------------------------------------------
export const productService = {
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('categories').select('*').eq('is_active', true)
      if (!error && data) return data
    }
    return MOCK_CATEGORIES
  },

  async getBrands(): Promise<Brand[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('brands').select('*')
      if (!error && data) return data
    }
    return MOCK_BRANDS
  },

  async getProducts(filters?: {
    category?: string
    brand?: string
    franchise?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
  }): Promise<Product[]> {
    let products = [...MOCK_PRODUCTS]

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('products').select(`
          *,
          categories(name),
          brands(name),
          product_variants(*)
        `).eq('status', 'active')

        if (filters?.category) {
          // Check if category is a UUID, otherwise resolve slug
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.category)
          if (isUuid) {
            query = query.eq('category_id', filters.category)
          } else {
            const { data: catData } = await supabase
              .from('categories')
              .select('id')
              .eq('slug', filters.category)
              .maybeSingle()
            if (catData) {
              query = query.eq('category_id', catData.id)
            } else {
              // Category slug doesn't exist, return empty array
              return []
            }
          }
        }
        if (filters?.brand) {
          query = query.eq('brand_id', filters.brand)
        }
        if (filters?.franchise) {
          query = query.eq('franchise', filters.franchise)
        }
        if (filters?.search) {
          query = query.ilike('name', `%${filters.search}%`)
        }

        const { data, error } = await query
        if (!error && data) {
          let dbProducts = data.map((item: any) => ({
            ...item,
            category_name: item.categories?.name,
            brand_name: item.brands?.name,
            images: item.images || ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60'],
            variants: item.product_variants || [],
            tags: item.tags || []
          }))

          // Exact price range filtering in memory using actual selling price (normal or offer)
          if (filters?.minPrice !== undefined) {
            dbProducts = dbProducts.filter((p: any) => (p.price_offer || p.price_normal) >= filters.minPrice!)
          }
          if (filters?.maxPrice !== undefined) {
            dbProducts = dbProducts.filter((p: any) => (p.price_offer || p.price_normal) <= filters.maxPrice!)
          }

          // Sorting
          if (filters?.sortBy === 'price_asc') {
            dbProducts.sort((a: any, b: any) => (a.price_offer || a.price_normal) - (b.price_offer || b.price_normal))
          } else if (filters?.sortBy === 'price_desc') {
            dbProducts.sort((a: any, b: any) => (b.price_offer || b.price_normal) - (a.price_offer || a.price_normal))
          } else if (filters?.sortBy === 'rating') {
            dbProducts.sort((a: any, b: any) => b.rating_avg - a.rating_avg)
          } else if (filters?.sortBy === 'sales') {
            dbProducts.sort((a: any, b: any) => b.sales_count - a.sales_count)
          }
          return dbProducts
        }
      } catch (err) {
        console.error('Database fetch failed, falling back to mock products.', err)
      }
    }

    // Local JS filtering
    if (filters?.category) {
      const cat = MOCK_CATEGORIES.find(c => c.slug === filters.category || c.id === filters.category)
      if (cat) {
        products = products.filter(p => p.category_id === cat.id)
      }
    }
    if (filters?.brand) {
      products = products.filter(p => p.brand_id === filters.brand)
    }
    if (filters?.franchise) {
      products = products.filter(p => p.franchise.toLowerCase() === filters.franchise?.toLowerCase())
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.short_description.toLowerCase().includes(q) ||
        p.franchise.toLowerCase().includes(q)
      )
    }
    if (filters?.minPrice !== undefined) {
      products = products.filter(p => (p.price_offer || p.price_normal) >= filters.minPrice!)
    }
    if (filters?.maxPrice !== undefined) {
      products = products.filter(p => (p.price_offer || p.price_normal) <= filters.maxPrice!)
    }

    // Sorting
    if (filters?.sortBy === 'price_asc') {
      products.sort((a, b) => (a.price_offer || a.price_normal) - (b.price_offer || b.price_normal))
    } else if (filters?.sortBy === 'price_desc') {
      products.sort((a, b) => (b.price_offer || b.price_normal) - (a.price_offer || a.price_normal))
    } else if (filters?.sortBy === 'rating') {
      products.sort((a, b) => b.rating_avg - a.rating_avg)
    } else if (filters?.sortBy === 'sales') {
      products.sort((a, b) => b.sales_count - a.sales_count)
    } else {
      products.sort((a, b) => b.created_at.localeCompare(a.created_at))
    }

    return products
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').select(`
        *,
        categories(name),
        brands(name),
        product_variants(*)
      `).eq('slug', slug).single()
      
      if (!error && data) {
        return {
          ...data,
          category_name: data.categories?.name,
          brand_name: data.brands?.name,
          images: data.images || ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60'],
          variants: data.product_variants || [],
          tags: data.tags || []
        }
      }
    }
    const found = MOCK_PRODUCTS.find(p => p.slug === slug || p.id === slug)
    return found || null
  },

  async getReviews(productId: string): Promise<Review[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('reviews').select(`
        id,
        rating,
        comment,
        is_verified_purchase,
        created_at,
        profiles(first_name, last_name, avatar_url)
      `).eq('product_id', productId).eq('is_approved', true)

      if (!error && data) {
        return data.map((item: any) => ({
          id: item.id,
          product_id: productId,
          user_name: `${item.profiles?.first_name || ''} ${item.profiles?.last_name || ''}`.trim() || 'Comprador Anónimo',
          user_avatar: item.profiles?.avatar_url,
          rating: item.rating,
          comment: item.comment,
          is_verified_purchase: item.is_verified_purchase,
          created_at: item.created_at
        }))
      }
    }
    return MOCK_REVIEWS[productId] || []
  },

  async getQuestions(productId: string): Promise<Question[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('questions').select(`
        id,
        question,
        created_at,
        profiles(first_name),
        answers(answer, created_at, profiles(first_name))
      `).eq('product_id', productId).eq('is_active', true)

      if (!error && data) {
        return data.map((item: any) => ({
          id: item.id,
          product_id: productId,
          user_name: item.profiles?.first_name || 'Usuario',
          question: item.question,
          created_at: item.created_at,
          answer: item.answers?.[0]?.answer
        }))
      }
    }
    return MOCK_QUESTIONS[productId] || []
  },

  async addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    if (isSupabaseConfigured) {
      const { data: profile } = await supabase.from('profiles').select('first_name, last_name, avatar_url').single()
      const { data, error } = await supabase.from('reviews').insert({
        product_id: review.product_id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        rating: review.rating,
        comment: review.comment,
        is_verified_purchase: true,
        is_approved: true
      }).select().single()

      if (!error && data) {
        return {
          id: data.id,
          product_id: review.product_id,
          user_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Tú',
          user_avatar: profile?.avatar_url,
          rating: data.rating,
          comment: data.comment,
          is_verified_purchase: data.is_verified_purchase,
          created_at: data.created_at
        }
      }
    }

    const newReview: Review = {
      id: Math.random().toString(),
      ...review,
      created_at: new Date().toISOString()
    }
    if (!MOCK_REVIEWS[review.product_id]) MOCK_REVIEWS[review.product_id] = []
    MOCK_REVIEWS[review.product_id].unshift(newReview)
    return newReview
  },

  async addQuestion(productId: string, questionText: string, userName: string): Promise<Question> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('questions').insert({
        product_id: productId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        question: questionText
      }).select().single()

      if (!error && data) {
        return {
          id: data.id,
          product_id: productId,
          user_name: userName,
          question: data.question,
          created_at: data.created_at
        }
      }
    }

    const newQ: Question = {
      id: Math.random().toString(),
      product_id: productId,
      user_name: userName,
      question: questionText,
      created_at: new Date().toISOString()
    }
    if (!MOCK_QUESTIONS[productId]) MOCK_QUESTIONS[productId] = []
    MOCK_QUESTIONS[productId].unshift(newQ)
    return newQ
  },

  // ADMIN ENDPOINTS
  async createProduct(product: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').insert({
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        short_description: product.short_description,
        long_description: product.long_description,
        category_id: product.category_id,
        brand_id: product.brand_id,
        franchise: product.franchise,
        price_normal: product.price_normal,
        price_offer: product.price_offer,
        discount_percentage: product.discount_percentage,
        stock: product.stock,
        status: 'active'
      }).select().single()
      if (!error && data) {
        return { ...data, images: [], variants: [], tags: [] }
      }
    }

    const newProduct: Product = {
      id: 'p-' + Math.random().toString(36).substr(2, 9),
      sku: product.sku || '',
      internal_code: 'AG-F-' + Math.floor(100 + Math.random() * 900),
      name: product.name || '',
      slug: product.slug || '',
      short_description: product.short_description || '',
      long_description: product.long_description || '',
      category_id: product.category_id || 'cat-adicionales',
      franchise: product.franchise || 'General',
      price_normal: product.price_normal || 0.00,
      price_offer: product.price_offer,
      discount_percentage: product.discount_percentage || 0,
      stock: product.stock || 0,
      stock_reserved: 0,
      status: 'active',
      rating_avg: 5.0,
      views_count: 0,
      sales_count: 0,
      created_at: new Date().toISOString(),
      images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60'],
      variants: [],
      tags: ['Nuevo Ingreso']
    }
    MOCK_PRODUCTS.unshift(newProduct)
    return newProduct
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').update({
        name: product.name,
        price_normal: product.price_normal,
        price_offer: product.price_offer,
        discount_percentage: product.discount_percentage,
        stock: product.stock,
        status: product.status
      }).eq('id', id).select().single()
      if (!error && data) return data
    }

    const index = MOCK_PRODUCTS.findIndex(p => p.id === id)
    if (index !== -1) {
      MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...product } as Product
      return MOCK_PRODUCTS[index]
    }
    throw new Error('Producto no encontrado')
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      return !error
    }
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id)
    if (index !== -1) {
      MOCK_PRODUCTS.splice(index, 1)
      return true
    }
    return false
  }
}
