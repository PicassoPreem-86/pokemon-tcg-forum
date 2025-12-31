-- ============================================
-- POKEMON + ONE PIECE SEED DATA (NO TRADING)
-- ============================================
-- Realistic community content WITHOUT marketplace threads
-- Run AFTER POKEMON_ONEPIECE_NO_TRADING.sql

-- ============================================
-- POKEMON TCG THREADS
-- ============================================

-- Pokemon Thread 1: Welcome (Pinned)
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_pinned, view_count, post_count, created_at, updated_at)
SELECT
  'welcome-to-tcg-gossip-pokemon-community',
  '👋 Welcome to TCG Gossip! Pokemon & One Piece Community',
  E'Welcome to the premier Pokemon and One Piece TCG community!\n\n**WHAT IS TCG GOSSIP?**\n\nTCG Gossip is your home for Pokemon TCG and One Piece TCG discussion, collecting, and community.\n\n**WHAT WE OFFER:**\n\n⚡ **Pokemon TCG**\n• Competitive deck discussion\n• Collection showcases\n• Market analysis\n• Grading help\n• Pull celebrations\n\n🏴‍☠️ **One Piece TCG**\n• Leader deck strategies\n• Collection building\n• Market trends\n• Best pulls\n• Set discussions\n\n**COMMUNITY GUIDELINES:**\n\n✅ Share your knowledge and collections\n✅ Discuss strategies and market trends\n✅ Celebrate amazing pulls\n✅ Help authenticate cards\n\n❌ No buying, selling, or trading (discussion only)\n❌ No spam or self-promotion\n❌ Be respectful to all members\n\n**GET STARTED:**\n\n1. Browse categories for your game\n2. Share your collection\n3. Join discussions\n4. Show off your best pulls!\n\nIntroduce yourself below! 👇',
  'Welcome guide for the Pokemon and One Piece TCG community',
  (SELECT id FROM categories WHERE slug = 'general'),
  (SELECT id FROM profiles WHERE username = 'TCGAdmin'),
  true,
  4521,
  156,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '3 hours'
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'general')
  AND EXISTS (SELECT 1 FROM profiles WHERE username = 'TCGAdmin');

-- Pokemon Thread 2: Competitive Discussion
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'charizard-ex-meta-discussion-2025',
  '🔥 Charizard ex Meta Discussion - Is it still Tier 1?',
  E'With the recent Prismatic Evolutions release, let''s discuss where Charizard ex stands in the current meta.\n\n**CURRENT POSITION:**\n\nIMO the deck is still incredibly strong, but faces more competition now with the new Eeveelutions hitting the scene. The consistency is there with Pidgeot ex, but I''m seeing more Mew VMAX in my local tournaments.\n\n**CORE STRENGTHS:**\n\n✅ Pidgeot ex for consistency\n✅ 330 damage ceiling with Tera\n✅ Favorable matchups vs most meta decks\n✅ Multiple win conditions\n\n**WEAKNESSES:**\n\n❌ Slow setup vs aggro\n❌ Struggles against spread decks\n❌ Item lock can be devastating\n❌ Prize trade inefficient sometimes\n\n**TECH CHOICES:**\n\n• Prime Catcher vs Boss''s Orders?\n• Counter Catcher worth it?\n• Forest Seal Stone or not?\n• How many Energy Retrieval?\n\n**MATCHUP SPREAD:**\n\n🟢 Good: Lugia (60-40), Lost Zone (65-35)\n🟡 Even: Gardevoir (50-50), Miraidon (50-50)\n🔴 Bad: Snorlax Stall (35-65)\n\n**MY CURRENT LIST:**\n\n- 4 Charmander\n- 2 Charmeleon \n- 3 Charizard ex\n- 2 Pidgey\n- 2 Pidgeot ex\n- [Rest of competitive list...]\n\nWhat are your thoughts? Are you still running Charizard or have you switched to something else for Regionals?',
  'Discussion about Charizard ex position in the current competitive meta',
  (SELECT id FROM categories WHERE slug = 'competitive'),
  (SELECT id FROM profiles WHERE username = 'CompetitiveAce'),
  true,
  3247,
  89,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 hours'
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'competitive')
  AND EXISTS (SELECT 1 FROM profiles WHERE username = 'CompetitiveAce');

-- Pokemon Thread 3: Grading Guide
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_pinned, view_count, post_count, created_at, updated_at)
SELECT
  'psa-vs-bgs-vs-cgc-pokemon-cards',
  '🏆 PSA vs BGS vs CGC for Pokemon Cards - Complete 2025 Guide',
  E'Comprehensive breakdown of which grading service to use for your Pokemon cards.\n\n**PSA (Professional Sports Authenticator)**\n\n✅ Pros:\n• Highest resale premiums\n• Industry standard\n• Simple 1-10 scale\n• Best for vintage Pokemon\n• Fastest turnaround currently\n\n❌ Cons:\n• More expensive than CGC\n• No sub-grades\n• Plain label design\n\n**BGS (Beckett Grading Services)**\n\n✅ Pros:\n• Sub-grades (centering, edges, corners, surface)\n• Black Label 10 = holy grail\n• Beautiful labels\n• Great for modern chase cards\n\n❌ Cons:\n• Most expensive\n• Harder to grade 10\n• Slower turnaround\n\n**CGC (Certified Guaranty Company)**\n\n✅ Pros:\n• Most affordable\n• Sub-grades available\n• Great customer service\n• Good for bulk\n\n❌ Cons:\n• Lower resale premiums (for now)\n• Still building market acceptance\n\n**MY RECOMMENDATIONS:**\n\n💎 **Base Set Charizard**: PSA\n🌈 **Modern Alt Arts**: BGS (chase Black Label)\n📦 **Bulk modern pulls**: CGC\n💰 **Investment holds**: PSA\n🎯 **Personal collection**: Whatever you prefer!\n\n**COST COMPARISON (2025):**\n\n- PSA Value: $25/card\n- BGS Standard: $40/card\n- CGC Bulk: $14/card\n\n**TURNAROUND TIMES:**\n\n- PSA: 15-30 days\n- BGS: 30-60 days\n- CGC: 10-20 days\n\nWhat are you using? Share your grading experiences!',
  'Complete guide to choosing between PSA, BGS, and CGC for Pokemon cards',
  (SELECT id FROM categories WHERE slug = 'grading'),
  (SELECT id FROM profiles WHERE username = 'GradeHunter'),
  true,
  5234,
  134,
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'grading')
  AND EXISTS (SELECT 1 FROM profiles WHERE username = 'GradeHunter');

-- Pokemon Thread 4: Pull Celebration
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'pulled-illustration-rare-charizard',
  '🌟 PULLED ILLUSTRATION RARE CHARIZARD! My Chase Card!',
  E'I''VE BEEN HUNTING THIS CARD FOR MONTHS!!!\n\n**THE PULL:**\n\nDecided to grab one last Obsidian Flames booster box before the price went up. Got absolutely nothing in the first 35 packs... then pack 36:\n\n**ILLUSTRATION RARE CHARIZARD** 🔥🔥🔥\n\nThe artwork is STUNNING in person. The texture, the colors, everything. Already in a perfect fit + top loader, heading to PSA next month.\n\n**MARKET VALUE:**\n\nCurrently around $180-220 raw\nPSA 10: $450-500\nThinking it''s a strong 9.5 candidate\n\n**MY REACTION:**\n\nLiterally screamed. My wife came running thinking something was wrong 😂\n\nThis card has been my white whale since Obsidian Flames dropped. Can''t believe I finally got it from a pack instead of buying singles.\n\n**THE QUESTION:**\n\nDo I:\n1. Grade it and keep forever\n2. Grade it and potentially sell at peak\n3. Keep raw in PC\n\nHonestly leaning toward option 1. This stays in the collection.\n\nAnyone else pull their chase card recently? What''s your white whale?',
  'Celebration of pulling the illustration rare Charizard chase card',
  (SELECT id FROM categories WHERE slug = 'pulls'),
  (SELECT id FROM profiles WHERE username = 'PullMaster'),
  true,
  2847,
  67,
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '45 minutes'
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'pulls')
  AND EXISTS (SELECT 1 FROM profiles WHERE username = 'PullMaster');

-- Pokemon Thread 5: Market Analysis
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'pokemon-market-trends-2025-analysis',
  '📈 Pokemon TCG Market Trends 2025 - What''s Hot, What''s Not',
  E'Let''s analyze the current Pokemon card market and discuss trends.\n\n**WHAT''S RISING:**\n\n📈 Illustration Rares (+45% avg)\n📈 Vintage WOTC PSA 10s (+30%)\n📈 151 Master Set cards (+25%)\n📈 Japanese exclusive promos (+40%)\n\n**WHAT''S FALLING:**\n\n📉 Modern V/VMAX (-15%)\n📉 Bulk GX era cards (-20%)\n📉 Graded commons (-30%)\n📉 Sealed XY boxes (-10%)\n\n**KEY OBSERVATIONS:**\n\n1. **Alt Arts Dominate**\n   - Still the chase cards\n   - Holding value incredibly well\n   - Some even increasing\n\n2. **Vintage Comeback**\n   - Base Set demand surging\n   - Jungle/Fossil appreciating\n   - PSA 10 premiums expanding\n\n3. **Japanese Premium Shrinking**\n   - Used to be 60% premium\n   - Now only 20-30% over English\n   - Quality gap closing\n\n4. **Modern Saturation**\n   - Print runs are HUGE\n   - Too much supply\n   - Only chase cards hold value\n\n**MY PREDICTIONS (6-12 months):**\n\n• Alt Arts will be $300+ average\n• Base Set PSA 10s continue climbing\n• Modern bulk continues falling\n• 151 set holds strong\n• Japanese cards stabilize\n\n**INVESTMENT STRATEGY:**\n\n✅ Buy: Vintage PSA 9/10, Modern Alt Arts\n❌ Avoid: Bulk moderns, Non-holo GX era\n\nWhat are you seeing in your local markets? Are you buying or holding?',
  'Comprehensive analysis of 2025 Pokemon TCG market trends and predictions',
  (SELECT id FROM categories WHERE slug = 'market'),
  (SELECT id FROM profiles WHERE username = 'MarketWatch'),
  true,
  1923,
  56,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '8 hours'
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'market')
  AND EXISTS (SELECT 1 FROM profiles WHERE username = 'MarketWatch');

-- ============================================
-- ONE PIECE TCG THREADS
-- ============================================

-- One Piece Thread 1: Deck Guide
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'monkey-d-luffy-leader-deck-guide',
  '🔥 Monkey D. Luffy Leader Deck Guide - Budget to Competitive',
  E'Complete guide for building Luffy leader decks in 2025.\n\n**CORE STRATEGY:**\n\nLuffy''s Rush ability is perfect for aggressive plays. Balance early pressure with mid-game card advantage. Straw Hat synergies are KEY!\n\n**BUDGET BUILD ($50-75):**\n\n- 4x Roronoa Zoro (ST01-013)\n- 4x Nami (ST01-007)\n- 4x Sanji (ST01-011)\n- 2x Trafalgar Law (OP01-047)\n- Plus starter deck cards\n\n**COMPETITIVE BUILD ($200-300):**\n\n- 4x Eustass Kid (OP01-051) - Game changer\n- 2x Portgas D. Ace (OP02-013) - Closer\n- 3x Donquixote Doflamingo (OP01-073)\n- Full playset of Radical Beam\n\n**TECH CHOICES:**\n\n• How many DON!! accelerators?\n• Counter card ratio?\n• Event vs Character balance?\n\n**MATCHUP GUIDE:**\n\n🟢 Good vs: Kaido (60-40), Crocodile (65-35)\n🟡 Even vs: Whitebeard (50-50)\n🔴 Bad vs: Control decks (40-60)\n\n**SIDEBOARD OPTIONS:**\n\n- Anti-control tech\n- Mirror match cards\n- Aggro counters\n\nWhat Luffy builds are you running? Share your lists!',
  'Comprehensive Monkey D. Luffy leader deck building guide from budget to competitive',
  (SELECT id FROM categories WHERE slug = 'op-deck-building'),
  (SELECT id FROM profiles WHERE username = 'CompetitiveAce'),
  true,
  1456,
  42,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '5 hours'
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'op-deck-building')
  AND EXISTS (SELECT 1 FROM profiles WHERE username = 'CompetitiveAce');

-- One Piece Thread 2: Pull Celebration
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'pulled-alt-art-shanks-celebration',
  '🌟 PULLED ALT ART SHANKS! Best Pull Ever!',
  E'FINALLY GOT MY CHASE CARD!\n\n**THE PULL:**\n\nAt my local shop today, decided to grab one more Romance Dawn booster box. Got nothing in the first 23 packs... then pack 24:\n\n**ALTERNATE ART SHANKS (OP01-120)** 🔥\n\nThe artwork is even more stunning in person. The foiling, the detail, absolutely gorgeous.\n\n**THE STORY:**\n\nI''ve been hunting this card for 6 months. Every shop I visit, every box I open, always hoping. Today it finally happened!\n\n**MARKET VALUE:**\n\nCurrently around $280-320\nThinking about grading but honestly might just keep it raw in my PC\n\n**MY DECISION:**\n\nThis is a KEEPER. Not selling, not trading (well, we don''t do that here anyway 😄). Going straight into my collection binder.\n\nAnyone else pull their One Piece chase card? What''s your white whale?',
  'Celebration of pulling the alternate art Shanks chase card from Romance Dawn',
  (SELECT id FROM categories WHERE slug = 'op-pulls'),
  (SELECT id FROM profiles WHERE username = 'VintageCollector'),
  true,
  1834,
  52,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '2 hours'
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'op-pulls')
  AND EXISTS (SELECT 1 FROM profiles WHERE username = 'VintageCollector');

-- ============================================
-- THREAD TAGS
-- ============================================

DO $$
DECLARE
  thread_id UUID;
BEGIN
  -- Tags for Welcome thread
  SELECT id INTO thread_id FROM threads WHERE slug = 'welcome-to-tcg-gossip-pokemon-community';
  IF thread_id IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_id, 'welcome'),
      (thread_id, 'guide'),
      (thread_id, 'community')
    ON CONFLICT (thread_id, tag) DO NOTHING;
  END IF;

  -- Tags for Charizard thread
  SELECT id INTO thread_id FROM threads WHERE slug = 'charizard-ex-meta-discussion-2025';
  IF thread_id IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_id, 'competitive'),
      (thread_id, 'charizard'),
      (thread_id, 'meta'),
      (thread_id, 'deck-building')
    ON CONFLICT (thread_id, tag) DO NOTHING;
  END IF;

  -- Tags for Grading thread
  SELECT id INTO thread_id FROM threads WHERE slug = 'psa-vs-bgs-vs-cgc-pokemon-cards';
  IF thread_id IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_id, 'grading'),
      (thread_id, 'psa'),
      (thread_id, 'bgs'),
      (thread_id, 'cgc'),
      (thread_id, 'guide')
    ON CONFLICT (thread_id, tag) DO NOTHING;
  END IF;

  -- Tags for Pokemon Pull thread
  SELECT id INTO thread_id FROM threads WHERE slug = 'pulled-illustration-rare-charizard';
  IF thread_id IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_id, 'pulls'),
      (thread_id, 'charizard'),
      (thread_id, 'illustration-rare'),
      (thread_id, 'chase-card')
    ON CONFLICT (thread_id, tag) DO NOTHING;
  END IF;

  -- Tags for Market thread
  SELECT id INTO thread_id FROM threads WHERE slug = 'pokemon-market-trends-2025-analysis';
  IF thread_id IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_id, 'market'),
      (thread_id, 'investing'),
      (thread_id, 'prices'),
      (thread_id, 'analysis')
    ON CONFLICT (thread_id, tag) DO NOTHING;
  END IF;

  -- Tags for Luffy deck thread
  SELECT id INTO thread_id FROM threads WHERE slug = 'monkey-d-luffy-leader-deck-guide';
  IF thread_id IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_id, 'deck-building'),
      (thread_id, 'luffy'),
      (thread_id, 'competitive'),
      (thread_id, 'guide')
    ON CONFLICT (thread_id, tag) DO NOTHING;
  END IF;

  -- Tags for Shanks pull thread
  SELECT id INTO thread_id FROM threads WHERE slug = 'pulled-alt-art-shanks-celebration';
  IF thread_id IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_id, 'pulls'),
      (thread_id, 'shanks'),
      (thread_id, 'alt-art'),
      (thread_id, 'romance-dawn')
    ON CONFLICT (thread_id, tag) DO NOTHING;
  END IF;
END $$;

-- ============================================
-- SAMPLE REPLIES
-- ============================================

-- Reply to Charizard thread
INSERT INTO replies (thread_id, author_id, content, created_at)
SELECT
  (SELECT id FROM threads WHERE slug = 'charizard-ex-meta-discussion-2025'),
  (SELECT id FROM profiles WHERE username = 'PikachuMaster'),
  E'Great analysis! I''ve been testing Charizard vs the new Eeveelution decks and it''s closer than I expected. Definitely still viable but you need to tech for the matchup.',
  NOW() - INTERVAL '1 hour'
WHERE EXISTS (SELECT 1 FROM threads WHERE slug = 'charizard-ex-meta-discussion-2025')
  AND EXISTS (SELECT 1 FROM profiles WHERE username = 'PikachuMaster');

-- Reply to Grading thread
INSERT INTO replies (thread_id, author_id, content, created_at)
SELECT
  (SELECT id FROM threads WHERE slug = 'psa-vs-bgs-vs-cgc-pokemon-cards'),
  (SELECT id FROM profiles WHERE username = 'BeginnerTrainer'),
  E'This is super helpful! I have a bunch of modern hits I want to grade. Sounds like CGC is the way to go for bulk. Thanks!',
  NOW() - INTERVAL '18 hours'
WHERE EXISTS (SELECT 1 FROM threads WHERE slug = 'psa-vs-bgs-vs-cgc-pokemon-cards')
  AND EXISTS (SELECT 1 FROM profiles WHERE username = 'BeginnerTrainer');

-- Reply to Luffy thread
INSERT INTO replies (thread_id, author_id, content, created_at)
SELECT
  (SELECT id FROM threads WHERE slug = 'monkey-d-luffy-leader-deck-guide'),
  (SELECT id FROM profiles WHERE username = 'PullMaster'),
  E'Your budget build looks solid! I started with something similar and it was competitive at locals. Eustass Kid is definitely worth saving up for though - changes the whole deck.',
  NOW() - INTERVAL '4 hours'
WHERE EXISTS (SELECT 1 FROM threads WHERE slug = 'monkey-d-luffy-leader-deck-guide')
  AND EXISTS (SELECT 1 FROM profiles WHERE username = 'PullMaster');

-- ============================================
-- VERIFICATION
-- ============================================

-- Show all threads by game
SELECT
  c.game,
  COUNT(t.id) as thread_count,
  SUM(t.view_count) as total_views,
  SUM(t.post_count) as total_posts
FROM threads t
JOIN categories c ON t.category_id = c.id
GROUP BY c.game;

-- Show threads by category
SELECT c.name as category, t.title, t.view_count, t.is_hot, t.is_pinned
FROM threads t
JOIN categories c ON t.category_id = c.id
ORDER BY c.game, t.created_at DESC;

-- Show stats
SELECT
  (SELECT COUNT(*) FROM categories WHERE game = 'pokemon') as pokemon_categories,
  (SELECT COUNT(*) FROM categories WHERE game = 'onepiece') as onepiece_categories,
  (SELECT COUNT(*) FROM threads) as total_threads,
  (SELECT COUNT(*) FROM thread_tags) as total_tags,
  (SELECT COUNT(*) FROM replies) as total_replies;
