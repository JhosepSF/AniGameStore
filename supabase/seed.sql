-- Supabase Seed Data - AniGames Store
-- seed.sql: Realistic catalog entries for the 89 anime, gaming & Marvel items

-- 1. Insert Brands
INSERT INTO public.brands (id, name, slug, description, logo_url) VALUES
('b-1', 'Bandai Spirits', 'bandai-spirits', 'Figuras coleccionables oficiales de Japón.', '/Brands/bandai.png'),
('b-2', 'Funko Pop', 'funko-pop', 'Tus personajes favoritos en estilo chibi.', '/Brands/funko.png'),
('b-3', 'Nintendo', 'nintendo', 'Consolas y accesorios oficiales.', '/Brands/nintendo.png'),
('b-4', 'Razer', 'razer', 'Hardware gamer de alto rendimiento.', '/Brands/razer.png'),
('b-5', 'Sony PlayStation', 'sony-playstation', 'Consolas y controles originales.', '/Brands/sony.png'),
('b-6', 'Logitech G', 'logitech-g', 'Teclados y mousepads gaming.', '/Brands/logitech.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Insert Categories
INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
('cat-one-piece', 'One Piece', 'one-piece', 'Figuras, posters, mochilas y llaveros de One Piece.', '/Categories/one-piece.png'),
('cat-naruto', 'Naruto', 'naruto', 'Coleccionables de la Aldea de la Hoja y accesorios ninja.', '/Categories/naruto.png'),
('cat-dragon-ball', 'Dragon Ball', 'dragon-ball', 'Estatuas de Goku, villanos clásicos y esferas del dragón.', '/Categories/dragon-ball.png'),
('cat-demon-slayer', 'Demon Slayer', 'demon-slayer', 'Figuras y katanas de Kimetsu no Yaiba.', '/Categories/demon-slayer.png'),
('cat-pokemon', 'Pokémon', 'pokemon', 'Peluches e iluminación decorativa de Pokémon.', '/Categories/pokemon.png'),
('cat-genshin-impact', 'Genshin Impact', 'genshin-impact', 'Figuras oficiales de Teyvat.', '/Categories/genshin-impact.png'),
('cat-marvel', 'Marvel', 'marvel', 'Colección de superhéroes y figuras de Marvel.', '/Categories/marvel.png'),
('cat-adicionales', 'Adicionales', 'adicionales', 'Nintendo Switch y accesorios gamer.', '/Categories/adicionales.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Insert Products (89 items)
INSERT INTO public.products (id, sku, internal_code, name, slug, short_description, long_description, category_id, franchise, price_normal, price_offer, stock, status, rating_avg) VALUES
-- ONE PIECE (30 items)
('p-op-001', 'OP-001', 'AG-OP-001', 'Figura Barba Blanca 29cm', 'figura-barba-blanca-29cm-op-001', 'Figura Barba Blanca 29cm oficial e importada.', 'Figura premium de alta calidad.', 'cat-one-piece', 'One Piece', 150.00, 120.00, 8, 'active', 4.8),
('p-op-002', 'OP-002', 'AG-OP-002', 'Figura Monkey D. Luffy 24cm', 'figura-monkey-d-luffy-24cm-op-002', 'Figura Luffy 24cm oficial.', 'Figura de colección.', 'cat-one-piece', 'One Piece', 62.50, 50.00, 8, 'active', 4.9),
('p-op-003', 'OP-003', 'AG-OP-003', 'Figura Zoro Roronoa 20cm', 'figura-zoro-roronoa-20cm-op-003', 'Figura Zoro 20cm.', 'Figura de acción.', 'cat-one-piece', 'One Piece', 112.50, 90.00, 8, 'active', 4.7),
('p-op-004', 'OP-004', 'AG-OP-004', 'Figura Dracule Mihawk 15cm', 'figura-dracule-mihawk-15cm-op-004', 'Figura Mihawk 15cm.', 'Figura oficial.', 'cat-one-piece', 'One Piece', 87.50, 70.00, 8, 'active', 4.8),
('p-op-005', 'OP-005', 'AG-OP-005', 'Figura Seraphim Mihawk 16cm', 'figura-seraphim-mihawk-16cm-op-005', 'Figura Seraphim Mihawk.', 'Figura de colección.', 'cat-one-piece', 'One Piece', 75.00, 60.00, 8, 'active', 4.6),
('p-op-006', 'OP-006', 'AG-OP-006', 'Figura Charlotte Katakuri 23cm', 'figura-charlotte-katakuri-23cm-op-006', 'Figura Katakuri.', 'Figura importada.', 'cat-one-piece', 'One Piece', 100.00, 80.00, 8, 'active', 4.9),
('p-op-007', 'OP-007', 'AG-OP-007', 'LEGO Katana Wado Ichimonji', 'lego-katana-wado-ichimonji-op-007', 'LEGO Katana de Zoro.', 'Bloques de construcción.', 'cat-one-piece', 'One Piece', 81.25, 65.00, 8, 'active', 4.75),
('p-op-008', 'OP-008', 'AG-OP-008', 'Figura Sanji 30cm', 'figura-sanji-30cm-op-008', 'Figura Sanji 30cm.', 'Figura premium.', 'cat-one-piece', 'One Piece', 106.25, 85.00, 8, 'active', 4.8),
('p-op-009', 'OP-009', 'AG-OP-009', 'Figura Zoro 30cm', 'figura-zoro-30cm-op-009', 'Figura Zoro 30cm.', 'Bajo pedido especial.', 'cat-one-piece', 'One Piece', 106.25, 85.00, 0, 'out_of_stock', 4.9),
('p-op-010', 'OP-010', 'AG-OP-010', 'Figura Luffy niño y Shanks 18cm', 'figura-luffy-nino-y-shanks-18cm-op-010', 'Figura tierna de Luffy y Shanks.', 'Escena clásica.', 'cat-one-piece', 'One Piece', 100.00, 80.00, 0, 'out_of_stock', 4.95),
('p-op-011', 'OP-011', 'AG-OP-011', 'Mini Figura Luffy Gear5 10cm', 'mini-figura-luffy-gear5-10cm-op-011', 'Figura Chibi Gear 5.', 'Mini figura.', 'cat-one-piece', 'One Piece', 43.75, 35.00, 8, 'active', 4.8),
('p-op-012', 'OP-012', 'AG-OP-012', 'Mini Figura Zoro 10cm', 'mini-figura-zoro-10cm-op-012', 'Mini Zoro chibi.', 'Agotado.', 'cat-one-piece', 'One Piece', 43.75, 35.00, 0, 'out_of_stock', 4.7),
('p-op-013', 'OP-013', 'AG-OP-013', 'Mini Figura Luffy 10cm', 'mini-figura-luffy-10cm-op-013', 'Mini Luffy chibi.', 'Agotado.', 'cat-one-piece', 'One Piece', 43.75, 35.00, 0, 'out_of_stock', 4.75),
('p-op-014', 'OP-014', 'AG-OP-014', 'Mini Figura Sabot 10cm', 'mini-figura-sabot-10cm-op-014', 'Mini Sabo chibi.', 'Disponible.', 'cat-one-piece', 'One Piece', 43.75, 35.00, 8, 'active', 4.85),
('p-op-015', 'OP-015', 'AG-OP-015', 'Figura Barco Going Merry 8.5cm', 'figura-barco-going-merry-8-5cm-op-015', 'Going Merry miniatura.', 'Barco oficial.', 'cat-one-piece', 'One Piece', 43.75, 35.00, 8, 'active', 4.9),
('p-op-016', 'OP-016', 'AG-OP-016', 'Figura Ace 18cm', 'figura-ace-18cm-op-016', 'Figura de Portgas D. Ace.', 'Agotado.', 'cat-one-piece', 'One Piece', 75.00, 60.00, 0, 'out_of_stock', 4.8),
('p-op-017', 'OP-017', 'AG-OP-017', 'Figura Zoro tres hojas 18cm', 'figura-zoro-tres-hojas-18cm-op-017', 'Zoro en pose de ataque.', 'Tres espadas.', 'cat-one-piece', 'One Piece', 56.25, 45.00, 8, 'active', 4.75),
('p-op-018', 'OP-018', 'AG-OP-018', 'Figura Sun God Nika Luffy Gear 5 18cm', 'figura-sun-god-nika-luffy-gear-5-18cm-op-018', 'Luffy Gear 5 dios del sol.', 'Agotado.', 'cat-one-piece', 'One Piece', 93.75, 75.00, 0, 'out_of_stock', 4.9),
('p-op-019', 'OP-019', 'AG-OP-019', 'Llavero fruta del diablo metal', 'llavero-fruta-del-diablo-metal-op-019', 'Llavero de metal.', 'Gomu Gomu.', 'cat-one-piece', 'One Piece', 31.25, 25.00, 0, 'out_of_stock', 4.6),
('p-op-020', 'OP-020', 'AG-OP-020', 'Llavero fruta del diablo metal 2', 'llavero-fruta-del-diablo-metal-op-020', 'Llavero Ope Ope.', 'Disponible.', 'cat-one-piece', 'One Piece', 31.25, 25.00, 8, 'active', 4.7),
('p-op-021', 'OP-021', 'AG-OP-021', 'Llavero fruta del diablo metal 3', 'llavero-fruta-del-diablo-metal-op-021', 'Llavero Mera Mera.', 'Agotado.', 'cat-one-piece', 'One Piece', 31.25, 25.00, 0, 'out_of_stock', 4.8),
('p-op-022', 'OP-022', 'AG-OP-022', 'Llavero PVC Luffy', 'llavero-pvc-luffy-op-022', 'Llavero Luffy Chibi.', 'Disponible.', 'cat-one-piece', 'One Piece', 31.25, 25.00, 8, 'active', 4.85),
('p-op-023', 'OP-023', 'AG-OP-023', 'Llavero PVC Zoro', 'llavero-pvc-zoro-op-023', 'Llavero Zoro Chibi.', 'Agotado.', 'cat-one-piece', 'One Piece', 31.25, 25.00, 0, 'out_of_stock', 4.75),
('p-op-024', 'OP-024', 'AG-OP-024', 'Llavero Zoro Funko Pop', 'llavero-zoro-funko-pop-op-024', 'Llavero de vinilo.', 'Agotado.', 'cat-one-piece', 'One Piece', 43.75, 35.00, 0, 'out_of_stock', 4.8),
('p-op-025', 'OP-025', 'AG-OP-025', 'Poster Gear 5 Luffy Sun God 28.5x42cm', 'poster-gear-5-luffy-sun-god-28-5x42cm-op-025', 'Poster HQ Luffy.', 'Decoración.', 'cat-one-piece', 'One Piece', 25.00, 20.00, 8, 'active', 4.95),
('p-op-026', 'OP-026', 'AG-OP-026', 'Poster Gol D.Roger 28.5x42cm', 'poster-gol-d-roger-28-5x42cm-op-026', 'Poster Gol D Roger.', 'Decoración.', 'cat-one-piece', 'One Piece', 25.00, 20.00, 8, 'active', 4.9),
('p-op-027', 'OP-027', 'AG-OP-027', 'Poster Zoro Roronoa 28.5x42cm', 'poster-zoro-roronoa-28-5x42cm-op-027', 'Poster Zoro.', 'Decoración.', 'cat-one-piece', 'One Piece', 25.00, 20.00, 8, 'active', 4.85),
('p-op-028', 'OP-028', 'AG-OP-028', 'Poster Portgas D. Ace 28.5x42cm', 'poster-portgas-d-ace-28-5x42cm-op-028', 'Poster Ace.', 'Decoración.', 'cat-one-piece', 'One Piece', 25.00, 20.00, 8, 'active', 4.9),
('p-op-029', 'OP-029', 'AG-OP-029', 'Mochila One Piece lona', 'mochila-one-piece-lona-op-029', 'Mochila de lona.', 'Agotado.', 'cat-one-piece', 'One Piece', 350.00, 280.00, 0, 'out_of_stock', 4.75),
('p-op-030', 'OP-030', 'AG-OP-030', 'Figura Luffy Gear 5 dios del sol 28cm', 'figura-luffy-gear-5-dios-del-sol-28cm-op-030', 'Luffy Gear 5 grande.', 'Agotado.', 'cat-one-piece', 'One Piece', 150.00, 120.00, 0, 'out_of_stock', 4.9),

-- NARUTO (12 items)
('p-ns-001', 'NS-001', 'AG-NS-001', 'Figura Madara Uchiha 17cm', 'figura-madara-uchiha-17cm-ns-001', 'Figura Madara.', 'Disponible.', 'cat-naruto', 'Naruto', 62.50, 50.00, 8, 'active', 4.8),
('p-ns-002', 'NS-002', 'AG-NS-002', 'Figura Naruto Hokage 17cm', 'figura-naruto-hokage-17cm-ns-002', 'Figura Naruto Hokage.', 'Disponible.', 'cat-naruto', 'Naruto', 75.00, 60.00, 8, 'active', 4.85),
('p-ns-003', 'NS-003', 'AG-NS-003', 'Mini Figura Itachi y Obito 8cm', 'mini-figura-itachi-y-obito-8cm-ns-003', 'Figuras chibi Itachi/Obito.', 'Cada una.', 'cat-naruto', 'Naruto', 37.50, 30.00, 8, 'active', 4.9),
('p-ns-004', 'NS-004', 'AG-NS-004', 'Mini Figura Naruto 8cm', 'mini-figura-naruto-8cm-ns-004', 'Chibi Naruto.', 'Disponible.', 'cat-naruto', 'Naruto', 37.50, 30.00, 8, 'active', 4.75),
('p-ns-005', 'NS-005', 'AG-NS-005', 'Mini Figura Kakashi 8cm', 'mini-figura-kakashi-8cm-ns-005', 'Chibi Kakashi.', 'Disponible.', 'cat-naruto', 'Naruto', 37.50, 30.00, 8, 'active', 4.8),
('p-ns-006', 'NS-006', 'AG-NS-006', 'Mini Figura Sasuke Uchiha 8cm', 'mini-figura-sasuke-uchiha-8cm-ns-006', 'Chibi Sasuke.', 'Agotado.', 'cat-naruto', 'Naruto', 37.50, 30.00, 0, 'out_of_stock', 4.7),
('p-ns-007', 'NS-007', 'AG-NS-007', 'Lote 6 figuras Naruto 7-8cm', 'lote-6-figuras-naruto-7-8cm-ns-007', 'Pack de 6 mini figuras.', 'Lote.', 'cat-naruto', 'Naruto', 75.00, 60.00, 8, 'active', 4.85),
('p-ns-008', 'NS-008', 'AG-NS-008', 'Figuras rostros Naruto 14cm', 'figuras-rostros-naruto-14cm-ns-008', 'Bustos rostros Naruto.', 'Agotado.', 'cat-naruto', 'Naruto', 100.00, 80.00, 0, 'out_of_stock', 4.9),
('p-ns-009', 'NS-009', 'AG-NS-009', 'Figura Obito Uchiha 26cm', 'figura-obito-uchiha-26cm-ns-009', 'Obito Uchiha grande.', 'Agotado.', 'cat-naruto', 'Naruto', 162.50, 130.00, 0, 'out_of_stock', 4.95),
('p-ns-010', 'NS-010', 'AG-NS-010', 'Llavero PVC Kakashi Hatake', 'llavero-pvc-kakashi-hatake-ns-010', 'Llavero Kakashi.', 'Disponible.', 'cat-naruto', 'Naruto', 31.25, 25.00, 8, 'active', 4.8),
('p-ns-011', 'NS-011', 'AG-NS-011', 'Mochila Naruto lona', 'mochila-naruto-lona-ns-011', 'Mochila de lona.', 'Agotado.', 'cat-naruto', 'Naruto', 350.00, 280.00, 0, 'out_of_stock', 4.7),
('p-ns-012', 'NS-012', 'AG-NS-012', 'Mini Figura Sakura 8cm', 'mini-figura-sakura-8cm-ns-012', 'Chibi Sakura.', 'Agotado.', 'cat-naruto', 'Naruto', 37.50, 30.00, 0, 'out_of_stock', 4.6),

-- DRAGON BALL (9 items)
('p-db-001', 'DB-001', 'AG-DB-001', 'Lote 5 figuras Majin Buu ejercicio', 'lote-5-figuras-majin-buu-ejercicio-db-001', 'Majin Buu haciendo ejercicio.', 'Pack 5 figuras.', 'cat-dragon-ball', 'Dragon Ball', 100.00, 80.00, 8, 'active', 4.85),
('p-db-002', 'DB-002', 'AG-DB-002', 'Figura Goku Super Saiyajin 16cm', 'figura-goku-super-saiyajin-16cm-db-002', 'Goku SSJ.', 'Disponible.', 'cat-dragon-ball', 'Dragon Ball', 56.25, 45.00, 8, 'active', 4.8),
('p-db-003', 'DB-003', 'AG-DB-003', 'Figura Bills Dios de la Destrucción 30cm', 'figura-bills-dios-de-la-destruccion-30cm-db-003', 'Figura Bills Grande.', 'Disponible.', 'cat-dragon-ball', 'Dragon Ball', 137.50, 110.00, 8, 'active', 4.95),
('p-db-004', 'DB-004', 'AG-DB-004', 'Figura Broly 20cm', 'figura-broly-20cm-db-004', 'Broly figura.', 'Agotado.', 'cat-dragon-ball', 'Dragon Ball', 75.00, 60.00, 0, 'out_of_stock', 4.75),
('p-db-005', 'DB-005', 'AG-DB-005', 'Figura Goku niño nube voladora 11cm', 'figura-goku-nino-nube-voladora-11cm-db-005', 'Goku clásico en nube.', 'Agotado.', 'cat-dragon-ball', 'Dragon Ball', 50.00, 40.00, 0, 'out_of_stock', 4.9),
('p-db-006', 'DB-006', 'AG-DB-006', 'Figura Super Gohan 28cm', 'figura-super-gohan-28cm-db-006', 'Gohan adulto 28cm.', 'Disponible.', 'cat-dragon-ball', 'Dragon Ball', 112.50, 90.00, 8, 'active', 4.85),
('p-db-007', 'DB-007', 'AG-DB-007', 'Mini Figuras Goku y Vegeta 8cm', 'mini-figuras-goku-y-vegeta-8cm-db-007', 'Mini figuras Goku/Vegeta.', 'Agotado.', 'cat-dragon-ball', 'Dragon Ball', 62.50, 50.00, 0, 'out_of_stock', 4.8),
('p-db-008', 'DB-008', 'AG-DB-008', 'Llavero Maestro Roshi 8cm', 'llavero-maestro-roshi-8cm-db-008', 'Llavero Roshi.', 'Agotado.', 'cat-dragon-ball', 'Dragon Ball', 25.00, 20.00, 0, 'out_of_stock', 4.7),
('p-db-009', 'DB-009', 'AG-DB-009', 'Figuras Dragon Ball GT Goku/Vegeta/Gogeta 20cm', 'figuras-dragon-ball-gt-goku-vegeta-gogeta-20cm-db-009', 'Figuras GT.', 'Agotado.', 'cat-dragon-ball', 'Dragon Ball', 87.50, 70.00, 0, 'out_of_stock', 4.9),

-- DEMON SLAYER (9 items)
('p-ds-001', 'DS-001', 'AG-DS-001', 'Figura Nezuko 16cm', 'figura-nezuko-16cm-ds-001', 'Figura Nezuko.', 'Agotado.', 'cat-demon-slayer', 'Demon Slayer', 75.00, 60.00, 0, 'out_of_stock', 4.85),
('p-ds-002', 'DS-002', 'AG-DS-002', 'LEGO Rengoku 1383 piezas', 'lego-rengoku-1383-piezas-ds-002', 'LEGO Katana Rengoku.', 'Disponible.', 'cat-demon-slayer', 'Demon Slayer', 81.25, 65.00, 8, 'active', 4.9),
('p-ds-003', 'DS-003', 'AG-DS-003', 'Figura Shinobu 16cm', 'figura-shinobu-16cm-ds-003', 'Figura Shinobu.', 'Disponible.', 'cat-demon-slayer', 'Demon Slayer', 50.00, 40.00, 8, 'active', 4.8),
('p-ds-004', 'DS-004', 'AG-DS-004', 'Figura Hashibira Inosuke', 'figura-hashibira-inosuke-ds-004', 'Figura Inosuke.', 'Agotado.', 'cat-demon-slayer', 'Demon Slayer', 75.00, 60.00, 0, 'out_of_stock', 4.75),
('p-ds-005', 'DS-005', 'AG-DS-005', 'Figura Pikachu Zenitsu Agatsuma 15cm', 'figura-pikachu-zenitsu-agatsuma-15cm-ds-005', 'Pikachu Cosplay Zenitsu.', 'Agotado.', 'cat-demon-slayer', 'Demon Slayer', 75.00, 60.00, 0, 'out_of_stock', 4.95),
('p-ds-006', 'DS-006', 'AG-DS-006', 'Figura Rengoku 13cm premium', 'figura-rengoku-13cm-premium-ds-006', 'Rengoku Premium.', 'Agotado.', 'cat-demon-slayer', 'Demon Slayer', 150.00, 120.00, 0, 'out_of_stock', 4.95),
('p-ds-007', 'DS-007', 'AG-DS-007', 'Llavero Inosuke', 'llavero-inosuke-ds-007', 'Llavero Inosuke PVC.', 'Agotado.', 'cat-demon-slayer', 'Demon Slayer', 25.00, 20.00, 0, 'out_of_stock', 4.6),
('p-ds-008', 'DS-008', 'AG-DS-008', 'Lote 4 figuras Demon Slayer 6cm', 'lote-4-figuras-demon-slayer-6cm-ds-008', 'Pack mini figuras.', 'Agotado.', 'cat-demon-slayer', 'Demon Slayer', 43.75, 35.00, 0, 'out_of_stock', 4.7),
('p-ds-009', 'DS-009', 'AG-DS-009', 'Figura Rengoku 13cm', 'figura-rengoku-13cm-ds-009', 'Figura Rengoku standard.', 'Agotado.', 'cat-demon-slayer', 'Demon Slayer', 75.00, 60.00, 0, 'out_of_stock', 4.8),

-- POKÉMON (9 items)
('p-po-001', 'PO-001', 'AG-PO-001', 'Figura Pikachu X-men Deadpool 15cm', 'figura-pikachu-x-men-deadpool-15cm-po-001', 'Pikachu Cosplay Deadpool.', 'Disponible.', 'cat-pokemon', 'Pokémon', 75.00, 60.00, 8, 'active', 4.95),
('p-po-002', 'PO-002', 'AG-PO-002', 'Bola cristal 3D Gengar con LED', 'bola-cristal-3d-gengar-con-led-po-002', 'Esfera LED Gengar.', 'Disponible.', 'cat-pokemon', 'Pokémon', 100.00, 80.00, 8, 'active', 4.9),
('p-po-003', 'PO-003', 'AG-PO-003', 'Luz nocturna Pikachu', 'luz-nocturna-pikachu-po-003', 'Lámpara Pikachu.', 'Agotado.', 'cat-pokemon', 'Pokémon', 43.75, 35.00, 0, 'out_of_stock', 4.8),
('p-po-004', 'PO-004', 'AG-PO-004', 'Figura Greninja Ash 16cm', 'figura-greninja-ash-16cm-po-004', 'Greninja Ash.', 'Disponible.', 'cat-pokemon', 'Pokémon', 125.00, 100.00, 8, 'active', 4.85),
('p-po-005', 'PO-005', 'AG-PO-005', 'Figura Mega Charizard X 18cm', 'figura-mega-charizard-x-18cm-po-005', 'Charizard X.', 'Disponible.', 'cat-pokemon', 'Pokémon', 112.50, 90.00, 8, 'active', 4.9),
('p-po-006', 'PO-006', 'AG-PO-006', 'Figura Charizard 9cm', 'figura-charizard-9cm-po-006', 'Charizard pequeña.', 'Disponible.', 'cat-pokemon', 'Pokémon', 62.50, 50.00, 8, 'active', 4.75),
('p-po-007', 'PO-007', 'AG-PO-007', 'Humidificador Gastly luz RGB', 'humidificador-gastly-luz-rgb-po-007', 'Humidificador Gastly RGB.', 'Agotado.', 'cat-pokemon', 'Pokémon', 156.25, 125.00, 0, 'out_of_stock', 4.95),
('p-po-008', 'PO-008', 'AG-PO-008', 'Peluche Pikachu cosplay Garchomp 20cm', 'peluche-pikachu-cosplay-garchomp-20cm-po-008', 'Peluche Pikachu Garchomp.', 'Disponible.', 'cat-pokemon', 'Pokémon', 87.50, 70.00, 8, 'active', 4.9),
('p-po-009', 'PO-009', 'AG-PO-009', 'Peluche Pikachu cosplay Mega Charizard X 20cm', 'peluche-pikachu-cosplay-mega-charizard-x-20cm-po-009', 'Peluche Pikachu Charizard X.', 'Disponible.', 'cat-pokemon', 'Pokémon', 81.25, 65.00, 8, 'active', 4.85),

-- GENSHIN IMPACT (3 items)
('p-gi-001', 'GI-001', 'AG-GI-001', 'Figura Xiao 20cm', 'figura-xiao-20cm-gi-001', 'Figura Xiao.', 'Disponible.', 'cat-genshin-impact', 'Genshin Impact', 93.75, 75.00, 8, 'active', 4.8),
('p-gi-002', 'GI-002', 'AG-GI-002', 'Figura Hu Tao 10cm', 'figura-hu-tao-10cm-gi-002', 'Figura Hu Tao.', 'Disponible.', 'cat-genshin-impact', 'Genshin Impact', 68.75, 55.00, 8, 'active', 4.9),
('p-gi-003', 'GI-003', 'AG-GI-003', 'Mini figura Paimon 5cm', 'mini-figura-paimon-5cm-gi-003', 'Mini Paimon.', 'Disponible.', 'cat-genshin-impact', 'Genshin Impact', 18.75, 15.00, 8, 'active', 4.85),

-- MARVEL (6 items)
('p-ma-001', 'MA-001', 'AG-MA-001', 'Figura Venom 11cm con base', 'figura-venom-11cm-con-base-ma-001', 'Figura Venom con base.', 'Disponible.', 'cat-marvel', 'Marvel', 68.75, 55.00, 8, 'active', 4.9),
('p-ma-002', 'MA-002', 'AG-MA-002', 'Llavero Loki Funko Pop', 'llavero-loki-funko-pop-ma-002', 'Llavero Loki Pop.', 'Agotado.', 'cat-marvel', 'Marvel', 50.00, 40.00, 0, 'out_of_stock', 4.8),
('p-ma-003', 'MA-003', 'AG-MA-003', 'Llavero DeadPool', 'llavero-deadpool-ma-003', 'Llavero Deadpool PVC.', 'Agotado.', 'cat-marvel', 'Marvel', 31.25, 25.00, 0, 'out_of_stock', 4.75),
('p-ma-004', 'MA-004', 'AG-MA-004', 'Busto Pantera Negra / Iron Man 16cm', 'busto-pantera-negra-iron-man-16cm-ma-004', 'Busto coleccionable.', 'Agotado.', 'cat-marvel', 'Marvel', 75.00, 60.00, 0, 'out_of_stock', 4.9),
('p-ma-005', 'MA-005', 'AG-MA-005', 'Llavero Miles Morales', 'llavero-miles-morales-ma-005', 'Llavero Spider-Man.', 'Agotado.', 'cat-marvel', 'Marvel', 31.25, 25.00, 0, 'out_of_stock', 4.85),
('p-ma-006', 'MA-006', 'AG-MA-006', 'Figura Tony Stark Iron Man MK3 bailando', 'figura-tony-stark-iron-man-mk3-bailando-ma-006', 'Figura Iron Man.', 'Agotado.', 'cat-marvel', 'Marvel', 125.00, 100.00, 0, 'out_of_stock', 4.9),

-- ADICIONALES (11 items)
('p-aa-001', 'AA-001', 'AG-AA-001', 'Figura SPY×FAMILY Yor Forger 16cm', 'figura-spy-family-yor-forger-16cm-aa-001', 'Figura Yor Forger.', 'Disponible.', 'cat-adicionales', 'Adicionales', 62.50, 50.00, 8, 'active', 4.9),
('p-aa-002', 'AA-002', 'AG-AA-002', 'Karambit Reaver Valorant 16cm', 'karambit-reaver-valorant-16cm-aa-002', 'Karambit Reaver metal.', 'Disponible.', 'cat-adicionales', 'Adicionales', 75.00, 60.00, 8, 'active', 4.8),
('p-aa-003', 'AA-003', 'AG-AA-003', 'Dedo de Sukuna Jujutsu Kaisen', 'dedo-de-sukuna-jujutsu-kaisen-aa-003', 'Réplica dedo de Sukuna.', 'Disponible.', 'cat-adicionales', 'Adicionales', 56.25, 45.00, 8, 'active', 4.9),
('p-aa-004', 'AA-004', 'AG-AA-004', 'Llavero Chainsaw Man Pochita', 'llavero-chainsaw-man-pochita-aa-004', 'Llavero Pochita PVC.', 'Disponible.', 'cat-adicionales', 'Adicionales', 31.25, 25.00, 8, 'active', 4.85),
('p-aa-005', 'AA-005', 'AG-AA-005', 'Bolsa colgante Pochita 12cm', 'bolsa-colgante-pochita-12cm-aa-005', 'Mini monedero Pochita.', 'Disponible.', 'cat-adicionales', 'Adicionales', 25.00, 20.00, 8, 'active', 4.75),
('p-aa-006', 'AA-006', 'AG-AA-006', 'Luz nocturna capibara', 'luz-nocturna-capibara-aa-006', 'Lámpara Capibara LED.', 'Disponible.', 'cat-adicionales', 'Adicionales', 100.00, 80.00, 8, 'active', 4.95),
('p-aa-007', 'AA-007', 'AG-AA-007', 'Luz LED Super Mario pregunta', 'luz-led-super-mario-pregunta-aa-007', 'Luz bloque de interrogación.', 'Disponible.', 'cat-adicionales', 'Adicionales', 75.00, 60.00, 8, 'active', 4.9),
('p-aa-008', 'AA-008', 'AG-AA-008', 'Lámpara cristal 3D decoración', 'lampara-cristal-3d-decoracion-aa-008', 'Lámpara cristal 3D.', 'Disponible.', 'cat-adicionales', 'Adicionales', 75.00, 60.00, 8, 'active', 4.8),
('p-aa-009', 'AA-009', 'AG-AA-009', 'Nintendo Switch OLED', 'nintendo-switch-oled-aa-009', 'Consola Nintendo Switch OLED.', 'Disponible.', 'cat-adicionales', 'Adicionales', 1875.00, 1500.00, 8, 'active', 4.95),
('p-aa-010', 'AA-010', 'AG-AA-010', 'Juguete dinosaurio ZAZAZA', 'juguete-dinosaurio-zazaza-aa-010', 'Dinosaurio ZAZAZA articulado.', 'Disponible.', 'cat-adicionales', 'Adicionales', 43.75, 35.00, 8, 'active', 4.7),
('p-aa-011', 'AA-011', 'AG-AA-011', 'DualSense PS5 original Sony', 'dualsense-ps5-original-sony-aa-011', 'Control DualSense Blanco.', 'Disponible.', 'cat-adicionales', 'Adicionales', 400.00, 320.00, 8, 'active', 4.9)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
