-- ============================================
-- CONSOLIDATED SEED DATA
-- ============================================
-- Realistic threads for the new 9-category structure
-- 5 universal + 2 Pokemon + 2 One Piece

-- ============================================
-- STEP 1: Get Category and User IDs
-- ============================================

-- Get the System Admin user ID (for welcome post)
DO $$
DECLARE
  admin_id UUID;

  -- Universal categories
  collecting_id UUID;
  market_id UUID;
  grading_id UUID;
  pulls_id UUID;
  news_id UUID;

  -- Pokemon categories
  pokemon_general_id UUID;
  pokemon_competitive_id UUID;

  -- One Piece categories
  op_general_id UUID;
  op_deck_building_id UUID;

  -- Thread IDs
  welcome_thread_id UUID;
  charizard_thread_id UUID;
  grading_guide_id UUID;
  pokemon_pull_id UUID;
  market_trends_id UUID;
  luffy_deck_id UUID;
  op_pull_id UUID;

BEGIN
  -- Get admin user
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@tcggossip.com' LIMIT 1;

  -- Get category IDs
  SELECT id INTO collecting_id FROM categories WHERE slug = 'collecting';
  SELECT id INTO market_id FROM categories WHERE slug = 'market';
  SELECT id INTO grading_id FROM categories WHERE slug = 'grading';
  SELECT id INTO pulls_id FROM categories WHERE slug = 'pulls';
  SELECT id INTO news_id FROM categories WHERE slug = 'news';
  SELECT id INTO pokemon_general_id FROM categories WHERE slug = 'pokemon-general';
  SELECT id INTO pokemon_competitive_id FROM categories WHERE slug = 'pokemon-competitive';
  SELECT id INTO op_general_id FROM categories WHERE slug = 'op-general';
  SELECT id INTO op_deck_building_id FROM categories WHERE slug = 'op-deck-building';

  -- ============================================
  -- THREAD 1: Welcome (Pokemon General - Pinned)
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'welcome-to-tcg-gossip',
    'Welcome to TCG Gossip! 🎴',
    E'# Welcome to TCG Gossip!\n\nWelcome to your new home for Pokemon TCG and One Piece TCG discussion!\n\n## What is TCG Gossip?\n\nTCG Gossip is a community forum dedicated to trading card game collectors and players. We focus on:\n\n⚡ **Pokemon TCG** - Competitive play, collecting, market discussion\n🏴‍☠️ **One Piece TCG** - Deck building, strategies, collection showcases\n\n## Community Guidelines\n\n1. **Be respectful** - Treat everyone with kindness\n2. **No trading/selling** - This is a discussion forum, not a marketplace\n3. **Stay on topic** - Keep posts relevant to TCGs\n4. **Share knowledge** - Help others learn and grow\n5. **Have fun!** - Celebrate pulls, share strategies, discuss the meta\n\n## Forum Categories\n\n### Universal Categories (Both Games)\n- 💎 **Collecting & Showcases** - Show off your collection\n- 📈 **Market & Prices** - Discuss market trends and prices\n- 🏅 **Grading & Authentication** - PSA, BGS, CGC help\n- 📦 **Pulls & Pack Openings** - Share your best pulls\n- 📰 **TCG News & Updates** - Latest announcements\n\n### Pokemon TCG\n- 💬 **General Discussion** - All things Pokemon TCG\n- 🏆 **Competitive Play** - Deck building and meta discussion\n\n### One Piece TCG\n- 💬 **General Discussion** - All things One Piece TCG\n- 🃏 **Deck Building** - Leader strategies and deck lists\n\n---\n\nJoin the conversation and let''s build an amazing TCG community together! 🚀',
    'Welcome to TCG Gossip! Your community for Pokemon and One Piece TCG discussion.',
    pokemon_general_id,
    admin_id,
    1247,
    8,
    true,
    false,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '2 days'
  ) RETURNING id INTO welcome_thread_id;

  -- Add tags
  INSERT INTO thread_tags (thread_id, tag) VALUES
    (welcome_thread_id, 'welcome'),
    (welcome_thread_id, 'rules'),
    (welcome_thread_id, 'community');

  -- Add some replies
  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (welcome_thread_id, admin_id, 'Thanks for joining! Feel free to introduce yourself and what games you collect/play!', NOW() - INTERVAL '14 days'),
    (welcome_thread_id, admin_id, 'Don''t forget to check out the Market & Prices category for investment discussion!', NOW() - INTERVAL '12 days'),
    (welcome_thread_id, admin_id, 'New members: Start by browsing the pinned guides in each category!', NOW() - INTERVAL '8 days');

  -- ============================================
  -- THREAD 2: Charizard Meta (Pokemon Competitive - Hot)
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'charizard-ex-meta-discussion',
    'Charizard ex Meta Discussion - Is it Tier 1?',
    E'# Charizard ex Meta Analysis\n\nWith the new set release, Charizard ex has been dominating tournaments. Let''s break down why it''s so strong and what beats it.\n\n## Deck Core\n\n**Pokemon (12)**\n- 3 Charizard ex\n- 2 Charmander\n- 2 Charmeleon\n- 2 Pidgeot ex\n- 2 Pidgey\n- 1 Pidgeotto\n\n**Trainers (32)**\n- 4 Rare Candy\n- 4 Ultra Ball\n- 3 Boss''s Orders\n- 3 Professor''s Research\n- 2 Iono\n- 2 Battle VIP Pass\n- And more...\n\n## Why It''s Strong\n\n1. **Consistent setup** - Pidgeot ex engine finds what you need\n2. **High damage output** - 330 damage OHKO''s everything\n3. **Energy acceleration** - Gets going by turn 2-3\n4. **Good matchup spread** - Beats most of the meta\n\n## Counter Strategies\n\n- **Water decks** - Weakness advantage\n- **Mill strategies** - Disrupts setup\n- **Path to the Peak** - Shuts down Pidgeot ex\n\nWhat are your thoughts? Is Charizard overrated or justified as Tier 1?',
    'Deep dive into Charizard ex viability in the current competitive meta.',
    pokemon_competitive_id,
    admin_id,
    2891,
    34,
    false,
    true,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '3 hours'
  ) RETURNING id INTO charizard_thread_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (charizard_thread_id, 'meta'),
    (charizard_thread_id, 'competitive'),
    (charizard_thread_id, 'deck-building'),
    (charizard_thread_id, 'charizard');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (charizard_thread_id, admin_id, 'The Pidgeot engine makes this deck incredibly consistent. You almost always get what you need.', NOW() - INTERVAL '3 days'),
    (charizard_thread_id, admin_id, 'I''ve been testing with 2 Manaphy to prevent bench snipe. Really helps against Lugia.', NOW() - INTERVAL '2 days'),
    (charizard_thread_id, admin_id, 'Water decks are the main problem. If the meta shifts to Greninja ex, Charizard will struggle.', NOW() - INTERVAL '1 day');

  -- ============================================
  -- THREAD 3: PSA vs BGS Guide (Grading - Pinned, Guide)
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'psa-vs-bgs-vs-cgc-grading-guide',
    '📘 GUIDE: PSA vs BGS vs CGC for Pokemon & One Piece Cards',
    E'# Complete Grading Service Comparison\n\nChoosing the right grading service can significantly impact your card''s value. Here''s everything you need to know.\n\n## PSA (Professional Sports Authenticator)\n\n### Pros\n- ✅ Highest premiums for Pokemon cards\n- ✅ Most recognizable slabs\n- ✅ Largest population reports\n- ✅ Best for resale value\n\n### Cons\n- ❌ No subgrades\n- ❌ Can be inconsistent\n- ❌ Slower turnaround times\n\n### Best For\n- Vintage Pokemon cards\n- High-value modern Pokemon\n- Cards you plan to sell\n\n---\n\n## BGS (Beckett Grading Services)\n\n### Pros\n- ✅ Subgrades (Centering, Corners, Edges, Surface)\n- ✅ Black Label 10 is prestigious\n- ✅ More detailed analysis\n\n### Cons\n- ❌ Lower premiums than PSA\n- ❌ More expensive\n- ❌ Harder to achieve high grades\n\n### Best For\n- Modern Pokemon cards\n- Cards with perfect centering\n- Personal collection (subgrades help identify flaws)\n\n---\n\n## CGC (Certified Guaranty Company)\n\n### Pros\n- ✅ Competitive pricing\n- ✅ Fast turnaround\n- ✅ Great for One Piece TCG\n- ✅ Subgrades available\n\n### Cons\n- ❌ Less market recognition\n- ❌ Lower premiums\n- ❌ Smaller population data\n\n### Best For\n- Budget submissions\n- One Piece TCG cards\n- Newer TCGs\n\n---\n\n## Pricing Comparison\n\n| Service | Base Price | Declared Value | Turnaround |\n|---------|-----------|----------------|------------|\n| PSA Value | $25 | Up to $499 | 30-45 days |\n| PSA Regular | $40 | Up to $1,499 | 20-30 days |\n| BGS Base | $30 | Up to $500 | 25-35 days |\n| BGS Premium | $50 | Up to $2,500 | 15-25 days |\n| CGC Standard | $20 | Up to $250 | 15-25 days |\n| CGC Express | $35 | Up to $1,000 | 10-15 days |\n\n---\n\n## My Recommendations\n\n**For Pokemon:**\n- Vintage cards → PSA\n- Modern high-end → PSA or BGS\n- Mid-range modern → CGC\n\n**For One Piece:**\n- Alt arts → CGC or PSA\n- Regular cards → CGC\n- High-value leaders → PSA\n\nWhat has your experience been? Share your grading results below!',
    'Comprehensive guide comparing PSA, BGS, and CGC grading services for TCG cards.',
    grading_id,
    admin_id,
    5234,
    67,
    true,
    false,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '5 days'
  ) RETURNING id INTO grading_guide_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (grading_guide_id, 'guide'),
    (grading_guide_id, 'grading'),
    (grading_guide_id, 'psa'),
    (grading_guide_id, 'bgs'),
    (grading_guide_id, 'cgc');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (grading_guide_id, admin_id, 'Great guide! I''ve had good luck with CGC for One Piece cards. Their turnaround time is excellent.', NOW() - INTERVAL '28 days'),
    (grading_guide_id, admin_id, 'PSA 10 Charizards sell for 2-3x more than CGC 10. The premium is real.', NOW() - INTERVAL '20 days'),
    (grading_guide_id, admin_id, 'BGS Black Label 10 is impossible to get, but when you do, it''s worth 5-10x a regular 10.', NOW() - INTERVAL '15 days');

  -- ============================================
  -- THREAD 4: Pokemon Pull (Pulls - Hot)
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'pulled-illustration-rare-charizard',
    'PULLED ILLUSTRATION RARE CHARIZARD! 🔥',
    E'# I FINALLY PULLED IT!\n\n![Charizard Illustration Rare](https://via.placeholder.com/600x400/FF6B35/FFFFFF?text=Charizard+Illustration+Rare)\n\nAfter 47 booster boxes, I FINALLY pulled the Illustration Rare Charizard from Obsidian Flames!\n\n## The Journey\n\n- Started opening day 1 of release\n- Opened 47 boxes over 3 months\n- Spent approximately $6,580 on boxes\n- Got 3 other Illustration Rares\n- Finally got the Zard today!\n\n## Card Condition\n\nLooks pretty clean to me:\n- ✅ Centering looks 50/50 or close\n- ✅ No visible scratches on holo\n- ✅ Corners look sharp\n- ⚠️ Tiny white speck on bottom edge (might affect PSA grade)\n\n## What Should I Do?\n\nShould I:\n1. Grade it immediately (PSA or BGS?)\n2. Hold raw and wait for prices to go up\n3. Sell now while hype is high\n\nCurrent market is around $800-1200 raw. PSA 10 is $2000-2500.\n\nWhat would you do?',
    'Epic Illustration Rare Charizard pull after 47 booster boxes!',
    pulls_id,
    admin_id,
    3456,
    89,
    false,
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '2 hours'
  ) RETURNING id INTO pokemon_pull_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (pokemon_pull_id, 'pull'),
    (pokemon_pull_id, 'charizard'),
    (pokemon_pull_id, 'illustration-rare'),
    (pokemon_pull_id, 'obsidian-flames');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (pokemon_pull_id, admin_id, 'CONGRATS! That''s the chase card! I''d get it graded ASAP while the set is still hot.', NOW() - INTERVAL '20 hours'),
    (pokemon_pull_id, admin_id, 'Centering looks great from the photo! Could be a PSA 10 candidate.', NOW() - INTERVAL '18 hours'),
    (pokemon_pull_id, admin_id, 'I''d grade with PSA. BGS is too harsh on modern cards. PSA 10 will get you $2500+', NOW() - INTERVAL '12 hours');

  -- ============================================
  -- THREAD 5: Market Trends (Market - Hot)
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'pokemon-market-trends-2025',
    'Pokemon TCG Market Trends 2025 - What to Watch',
    E'# Pokemon TCG Market Analysis - 2025\n\nLet''s discuss where the Pokemon TCG market is heading in 2025.\n\n## Vintage Market (Pre-2010)\n\n### Strong Growth\n- **Base Set Charizard** - Still climbing, PSA 10 at $400k+\n- **Gold Stars** - Up 40% YoY, very limited supply\n- **Crystals** - Steady growth, PSA 10 rare\n\n### Cooling Off\n- **Neo Genesis holos** - Plateaued after 2023 spike\n- **EX era cards** - Some correction after 2024 highs\n\n---\n\n## Modern Market (2020-2024)\n\n### Hot Right Now\n- **Illustration Rares** - Still climbing\n- **Special Illustration Rares** - Premium increasing\n- **Alt Arts** - Stable to growing\n\n### Watch Out\n- **Regular V/VMAX** - Declining fast\n- **Trainer Gallery cards** - Oversupplied\n- **Most GX cards** - Bottomed out\n\n---\n\n## 2025 Predictions\n\n1. **Vintage continues to appreciate** - 10-20% gains\n2. **Illustration Rares peak mid-2025** - Then slow correction\n3. **151 set holds value** - Nostalgia factor\n4. **Scarlet & Violet SIRs stabilize** - Supply catching up\n5. **Japanese exclusives gain traction** - International interest growing\n\n## Investment Strategies\n\n### Conservative\n- Buy PSA 9/10 WOTC holos\n- Focus on Charizard, Blastoise, Venusaur\n- Hold 5+ years\n\n### Moderate\n- Buy modern SIRs under $100\n- Grade promising pulls\n- Flip 1-2 year hold\n\n### Aggressive\n- Spec on new set releases\n- Buy Japanese exclusives\n- Short-term flips (risky!)\n\nWhat are your thoughts on the market? What are you buying/selling?',
    'Market analysis and predictions for Pokemon TCG in 2025.',
    market_id,
    admin_id,
    4123,
    56,
    false,
    true,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '6 hours'
  ) RETURNING id INTO market_trends_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (market_trends_id, 'market'),
    (market_trends_id, 'investing'),
    (market_trends_id, 'prices'),
    (market_trends_id, '2025');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (market_trends_id, admin_id, 'I think vintage is the safest bet. Modern is too volatile for my taste.', NOW() - INTERVAL '6 days'),
    (market_trends_id, admin_id, 'Illustration Rares are going to crash when people realize how many were printed.', NOW() - INTERVAL '5 days'),
    (market_trends_id, admin_id, 'Japanese cards are undervalued IMO. I''m buying everything I can find.', NOW() - INTERVAL '4 days');

  -- ============================================
  -- THREAD 6: Luffy Deck Guide (One Piece Deck Building - Hot)
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'monkey-d-luffy-deck-guide-2025',
    'Monkey D. Luffy Leader Deck Guide - Budget to Competitive',
    E'# Monkey D. Luffy (ST-01) Deck Building Guide\n\nLuffy is one of the most popular and versatile leaders in One Piece TCG. Here''s how to build him at every budget level.\n\n---\n\n## Budget Build ($50-100)\n\n### Leader\n- Monkey D. Luffy (ST-01)\n\n### Key Cards\n- 4x Roronoa Zoro (Common searcher)\n- 4x Nami (Card draw)\n- 4x Usopp (Don!! acceleration)\n- 3x Sanji (Removal)\n- 3x Trafalgar Law (Blocker)\n- 2x Portgas D. Ace (Finisher)\n\n### Events\n- 4x Gum-Gum Red Hawk\n- 3x Gomu Gomu no Jet Pistol\n\n**Total Cost: ~$75**\n\n---\n\n## Mid-Range Build ($200-400)\n\nUpgrade the budget version with:\n\n### Premium Additions\n- 2x Roronoa Zoro (Alt Art searcher) - $40 each\n- 2x Eustass Kid (Removal + pressure) - $25 each\n- 1x Sabo (Revolutionary Army) - $30\n- 2x Jinbe (Draw + blocker) - $15 each\n\n### Better Events\n- 2x Radical Beam! (Board clear) - $20 each\n\n**Additional Cost: ~$250**\n\n---\n\n## Competitive Build ($600-1000)\n\nFull optimization:\n\n### Top-Tier Cards\n- 4x Roronoa Zoro (Alt Art) - $160 total\n- 3x Eustass Kid - $75 total\n- 2x Yamato (Game ender) - $120 total\n- 2x Donquixote Doflamingo (Alt Art) - $200 total\n- 1x Shanks (Leader killer) - $80\n\n**Total Deck Cost: ~$900**\n\n---\n\n## Strategy Guide\n\n### Early Game (Turns 1-3)\n- Search for Zoro to thin deck\n- Build Don!! advantage with Usopp\n- Protect leader with blockers\n\n### Mid Game (Turns 4-6)\n- Start pressuring opponent''s leader\n- Use Sanji/Kid for removal\n- Maintain card advantage with Nami\n\n### Late Game (Turns 7+)\n- Drop Yamato or Ace for finisher\n- Use events to clear blockers\n- Close out with leader attacks\n\n## Matchup Guide\n\n**Favored:**\n- Kaido decks (out-tempo them)\n- Big Mom (better early game)\n\n**Even:**\n- Other Luffy decks (mirror)\n- Law decks (skill-based)\n\n**Unfavored:**\n- Whitebeard (too much removal)\n- Katakuri (hand disruption hurts)\n\nWhat''s your Luffy build? Share your deck lists below!',
    'Complete deck building guide for Monkey D. Luffy from budget to competitive.',
    op_deck_building_id,
    admin_id,
    2678,
    43,
    false,
    true,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '8 hours'
  ) RETURNING id INTO luffy_deck_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (luffy_deck_id, 'deck-guide'),
    (luffy_deck_id, 'luffy'),
    (luffy_deck_id, 'budget'),
    (luffy_deck_id, 'competitive');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (luffy_deck_id, admin_id, 'Great guide! I''m running the mid-range build and it''s very competitive at locals.', NOW() - INTERVAL '4 days'),
    (luffy_deck_id, admin_id, 'Don''t sleep on Jinbe! Card draw + blocker is insane value.', NOW() - INTERVAL '3 days'),
    (luffy_deck_id, admin_id, 'The alt art Zoro is actually not necessary. Regular version works fine.', NOW() - INTERVAL '2 days');

  -- ============================================
  -- THREAD 7: One Piece Pull (Pulls - Hot)
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'pulled-alt-art-shanks',
    'PULLED ALT ART SHANKS! 🏴‍☠️',
    E'# First Booster Box and I Got the Chase Card!\n\n![Shanks Alt Art](https://via.placeholder.com/600x400/4ECDC4/FFFFFF?text=Shanks+Alt+Art)\n\nI can''t believe it! My first One Piece booster box and I pulled the alt art Shanks!\n\n## The Pull\n\nOpening OP-01 box:\n- Pack 1-10: Nothing special\n- Pack 11: SECRET RARE!\n- Pack 12-24: Some good holos\n\nTotal box value probably $180-200 with the Shanks alone!\n\n## Card Condition\n\nCard came pack fresh:\n- ✅ Perfect centering (rare for One Piece)\n- ✅ Clean surface, no print lines\n- ✅ Sharp corners\n- ✅ No edge wear\n\nLooks like a PSA 10 candidate to me!\n\n## Should I Grade or Sell?\n\nCurrent prices:\n- Raw: $150-180\n- CGC 10: $280-320\n- PSA 10: $350-400\n\nShould I:\n1. Send to CGC (faster, cheaper)\n2. Send to PSA (higher value)\n3. Sell raw now\n4. Hold long-term\n\nWhat would you do? This is my first big One Piece pull!',
    'Incredible alt art Shanks pull from first One Piece booster box!',
    pulls_id,
    admin_id,
    1834,
    38,
    false,
    true,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '4 hours'
  ) RETURNING id INTO op_pull_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (op_pull_id, 'pull'),
    (op_pull_id, 'shanks'),
    (op_pull_id, 'alt-art'),
    (op_pull_id, 'op-01');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (op_pull_id, admin_id, 'Congrats on the pull! I''d go with CGC for One Piece cards. Faster turnaround.', NOW() - INTERVAL '1 day'),
    (op_pull_id, admin_id, 'That centering is CLEAN. Definitely grade it!', NOW() - INTERVAL '18 hours'),
    (op_pull_id, admin_id, 'OP-01 Shanks is a long-term hold. One Piece TCG is still growing!', NOW() - INTERVAL '12 hours');

END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Show thread counts by category
SELECT
  c.name as category,
  c.game,
  COUNT(t.id) as thread_count,
  SUM(t.view_count) as total_views,
  SUM(t.post_count) as total_posts
FROM categories c
LEFT JOIN threads t ON c.id = t.category_id
GROUP BY c.id, c.name, c.game
ORDER BY c.sort_order;

-- Show all threads with engagement
SELECT
  t.title,
  c.name as category,
  c.game,
  t.view_count,
  t.post_count,
  t.is_pinned,
  t.is_hot,
  CASE
    WHEN t.created_at > NOW() - INTERVAL '7 days' THEN 'New'
    WHEN t.updated_at > NOW() - INTERVAL '24 hours' THEN 'Active'
    ELSE 'Normal'
  END as status
FROM threads t
JOIN categories c ON t.category_id = c.id
ORDER BY t.is_pinned DESC, t.updated_at DESC;

-- Show tag popularity
SELECT tag, COUNT(*) as usage_count
FROM thread_tags
GROUP BY tag
ORDER BY usage_count DESC;
