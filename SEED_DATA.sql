-- ========================================
-- TCG GOSSIP - SEED DATA
-- Realistic starter content for Pokemon TCG Forum
-- Date: December 30, 2025
-- ========================================

-- IMPORTANT: Run this AFTER the category migration (UPDATE_CATEGORIES_MIGRATION.sql)

-- ========================================
-- STEP 1: Create User Accounts
-- ========================================

-- IMPORTANT: Create your admin account FIRST through the UI or Supabase dashboard
-- Then this script will create the profile for it

-- Create profile for admin (assumes you've already signed up as admin@tcggossip.com)
INSERT INTO profiles (id, username, display_name, role, bio, post_count, reputation, created_at)
SELECT
  id,
  'TCGAdmin',
  'TCG Gossip Admin',
  'admin',
  'Welcome to TCG Gossip! The premier Pokemon TCG community.',
  0,
  1000,
  NOW()
FROM auth.users
WHERE email = 'admin@tcggossip.com'
ON CONFLICT (username) DO NOTHING;

-- Community members (link to auth accounts created via script)
INSERT INTO profiles (id, username, display_name, role, bio, post_count, reputation, created_at)
SELECT id, 'PikachuMaster', 'PikachuMaster', 'member', 'Collecting since Base Set! Love Pikachu cards and competitive play.', 156, 850, NOW() - INTERVAL '6 months'
FROM auth.users WHERE email = 'pikachumaster@tcggossip.com'
ON CONFLICT (username) DO NOTHING;

INSERT INTO profiles (id, username, display_name, role, bio, post_count, reputation, created_at)
SELECT id, 'CharizardFan99', 'CharizardFan99', 'member', 'Charizard collector and investor. Always hunting for that Rainbow Rare!', 243, 920, NOW() - INTERVAL '4 months'
FROM auth.users WHERE email = 'charizardfan99@tcggossip.com'
ON CONFLICT (username) DO NOTHING;

INSERT INTO profiles (id, username, display_name, role, bio, post_count, reputation, created_at)
SELECT id, 'CompetitiveAce', 'Alex "Ace" Chen', 'member', 'Tournament grinder | Top 8 Regionals 2024 | Deck building enthusiast', 189, 780, NOW() - INTERVAL '5 months'
FROM auth.users WHERE email = 'competitiveace@tcggossip.com'
ON CONFLICT (username) DO NOTHING;

INSERT INTO profiles (id, username, display_name, role, bio, post_count, reputation, created_at)
SELECT id, 'VintageCollector', 'Vintage Collector', 'vip', 'OG collector - Base Set to present. PSA grading expert.', 312, 1240, NOW() - INTERVAL '1 year'
FROM auth.users WHERE email = 'vintagecollector@tcggossip.com'
ON CONFLICT (username) DO NOTHING;

INSERT INTO profiles (id, username, display_name, role, bio, post_count, reputation, created_at)
SELECT id, 'PocketProPlayer', 'Sarah TCG', 'member', 'TCG Pocket competitive player | F2P strategies | Mobile gaming tips', 98, 540, NOW() - INTERVAL '2 months'
FROM auth.users WHERE email = 'pocketproplayer@tcggossip.com'
ON CONFLICT (username) DO NOTHING;

INSERT INTO profiles (id, username, display_name, role, bio, post_count, reputation, created_at)
SELECT id, 'GradeHunter', 'The Grade Hunter', 'member', 'PSA 10 or bust! Grading submissions and pop report analysis.', 167, 690, NOW() - INTERVAL '7 months'
FROM auth.users WHERE email = 'gradehunter@tcggossip.com'
ON CONFLICT (username) DO NOTHING;

INSERT INTO profiles (id, username, display_name, role, bio, post_count, reputation, created_at)
SELECT id, 'MarketWatch', 'Market Watch', 'member', 'Tracking Pokemon card market trends and investment opportunities.', 134, 620, NOW() - INTERVAL '5 months'
FROM auth.users WHERE email = 'marketwatch@tcggossip.com'
ON CONFLICT (username) DO NOTHING;

INSERT INTO profiles (id, username, display_name, role, bio, post_count, reputation, created_at)
SELECT id, 'PullMaster', 'Pull Master', 'member', 'Box opening addict 📦 Sharing my pulls and collection!', 221, 810, NOW() - INTERVAL '3 months'
FROM auth.users WHERE email = 'pullmaster@tcggossip.com'
ON CONFLICT (username) DO NOTHING;

INSERT INTO profiles (id, username, display_name, role, bio, post_count, reputation, created_at)
SELECT id, 'BeginnerTrainer', 'New Trainer', 'member', 'Just started collecting! Learning the ropes and loving this community.', 45, 230, NOW() - INTERVAL '1 month'
FROM auth.users WHERE email = 'beginnertrainer@tcggossip.com'
ON CONFLICT (username) DO NOTHING;

INSERT INTO profiles (id, username, display_name, role, bio, post_count, reputation, created_at)
SELECT id, 'FakeCardDetective', 'Authenticity Pro', 'moderator', 'Helping the community spot fake cards | 10+ years experience', 198, 1050, NOW() - INTERVAL '8 months'
FROM auth.users WHERE email = 'fakecarddetective@tcggossip.com'
ON CONFLICT (username) DO NOTHING;

-- ========================================
-- STEP 2: Create Threads with Real Content
-- ========================================

-- Competitive Play Category
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_pinned, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'charizard-ex-meta-discussion-2025',
  'Charizard ex Meta Discussion - Is it still Tier 1?',
  E'With the recent Prismatic Evolutions release, I wanted to discuss where Charizard ex stands in the current meta.\n\nIMO the deck is still incredibly strong, but faces more competition now with the new Eeveelutions hitting the scene. The consistency is there with Pidgeot ex, but I''m seeing more Mew VMAX in my local tournaments.\n\nWhat are your thoughts? Are you still running Charizard or have you switched to something else for Regionals?',
  'Discussion about Charizard ex''s position in the current competitive meta',
  (SELECT id FROM categories WHERE slug = 'competitive'),
  (SELECT id FROM profiles WHERE username = 'CompetitiveAce'),
  true,
  true,
  1247,
  23,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '3 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'charizard-ex-meta-discussion-2025');

INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'lost-zone-box-deck-build-help',
  'Lost Zone Box - Deck Build Help Needed',
  E'Hey everyone! I''m trying to optimize my Lost Zone Box deck for upcoming League Cups. Here''s my current list:\n\n**Pokemon (12)**\n- 4 Comfey (Lost Zone)\n- 2 Sableye (Lost Zone)\n- 2 Cramorant (Lost Zone)\n- 1 Radiant Greninja\n- 1 Manaphy\n- 2 Colress''s Experiment\n\n**Trainers (38)**\nStandard Lost Zone package but considering cutting a few cards for more disruption. Should I add Team Yell''s Cheer or stick with the standard build?\n\nAny suggestions from experienced Lost Zone players?',
  'Looking for deck optimization advice on Lost Zone Box',
  (SELECT id FROM categories WHERE slug = 'competitive'),
  (SELECT id FROM profiles WHERE username = 'BeginnerTrainer'),
  false,
  387,
  12,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '5 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'lost-zone-box-deck-build-help');

-- TCG Pocket Category
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_pinned, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'tcg-pocket-f2p-guide-2025',
  'Complete F2P Guide - How to Build Competitive Decks Without Spending',
  E'After 3 months of playing TCG Pocket completely F2P, I wanted to share my strategies for building competitive decks without spending a dime.\n\n**Daily Routine:**\n1. Complete all daily missions (3 Wonder Picks, 2 Battles)\n2. Open your free pack every 12 hours\n3. Use Wonder Pick strategically (explained below)\n\n**Pack Opening Strategy:**\nFocus on ONE set until you get your chase cards. I recommend Genetic Apex for Mewtwo ex or Charizard ex.\n\n**Wonder Pick Guide:**\n- Only use for 3★+ cards or specific deck needs\n- NEVER waste on packs you''ve already completed\n- Save pack points for crafting key cards\n\n**F2P Competitive Decks:**\n1. Pikachu ex (cheapest to build)\n2. Mewtwo ex Gardevoir\n3. Charizard ex Moltres\n\nHappy to answer questions!',
  'Complete guide for building competitive TCG Pocket decks as F2P player',
  (SELECT id FROM categories WHERE slug = 'tcg-pocket'),
  (SELECT id FROM profiles WHERE username = 'PocketProPlayer'),
  true,
  true,
  2134,
  45,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'tcg-pocket-f2p-guide-2025');

INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'tcg-pocket-vs-physical-which-better',
  'TCG Pocket vs Physical - Which do you prefer and why?',
  E'Curious to hear everyone''s thoughts on TCG Pocket vs collecting/playing physical cards.\n\n**My take:**\nPocket is amazing for quick games and doesn''t require shuffling or bringing a deck box everywhere. The animations are gorgeous and opening packs is satisfying.\n\nBUT nothing beats holding a real Charizard in your hands or the feeling of pulling that chase card from a physical booster.\n\nI''m doing both now - Pocket for daily play, physical for collecting and tournaments. What about you all?',
  'Discussion comparing TCG Pocket mobile game to physical cards',
  (SELECT id FROM categories WHERE slug = 'tcg-pocket'),
  (SELECT id FROM profiles WHERE username = 'CharizardFan99'),
  true,
  856,
  28,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'tcg-pocket-vs-physical-which-better');

-- Pulls & Showcases Category
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'insane-prismatic-evolutions-pull',
  '🔥 INSANE Prismatic Evolutions Pull - Double Illustration Rare!',
  E'I literally can''t believe this just happened...\n\nOpened my first Prismatic Evolutions booster box today and hit BOTH:\n- Eevee Illustration Rare (my chase card!)\n- Sylveon Illustration Rare\n\nIN THE SAME BOX! Back to back packs too!\n\nI''m shaking right now. This is the best pull session I''ve ever had in 15 years of collecting.\n\nPics coming soon once I get them in sleeves. Anyone else have similar crazy luck with this set?',
  'Incredible double Illustration Rare pull from Prismatic Evolutions',
  (SELECT id FROM categories WHERE slug = 'pulls'),
  (SELECT id FROM profiles WHERE username = 'PullMaster'),
  false,
  1893,
  67,
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '30 minutes'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'insane-prismatic-evolutions-pull');

INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'my-complete-pikachu-collection',
  'My Complete Pikachu Collection - 300+ Cards!',
  E'Finally completed my life goal - every English Pikachu card from Base Set to present!\n\n**Collection Stats:**\n- Total Pikachu cards: 327\n- Graded cards (PSA 9+): 45\n- Crown jewel: Base Set 1st Edition Pikachu PSA 10\n- Favorite card: Celebrations 25th Anniversary Pikachu\n\n**Sets completed:**\n✅ Base Set through Neo Destiny\n✅ All ex series  \n✅ All BW/XY/SM\n✅ SwSh era complete\n✅ Scarlet & Violet (ongoing)\n\nTook me 12 years but worth every penny! Photos in the Imgur album linked below.\n\nAny other Pikachu collectors here?',
  'Complete Pikachu collection showcase - 300+ cards across all eras',
  (SELECT id FROM categories WHERE slug = 'pulls'),
  (SELECT id FROM profiles WHERE username = 'PikachuMaster'),
  false,
  743,
  34,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '6 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'my-complete-pikachu-collection');

-- Authentication Category
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_pinned, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'how-to-spot-fake-pokemon-cards-2025',
  '🛡️ How to Spot Fake Pokemon Cards - Complete 2025 Guide',
  E'With counterfeits getting more sophisticated, here''s an updated guide on spotting fake Pokemon cards.\n\n**Quick Checks:**\n1. **Light Test** - Real cards let some light through, fakes are often too thick/thin\n2. **Rip Test** - ONLY if you''re sure it''s fake - real cards have a black layer\n3. **Font** - Fakes often have slight font differences in the HP or attack names\n4. **Holo Pattern** - Real cards have consistent holofoil patterns\n\n**Red Flags:**\n- Price too good to be true\n- Seller has many "mint" vintage cards\n- Colors look off (too bright or too dull)\n- Card feels wrong (texture, weight, thickness)\n\n**Advanced Checks:**\n- Compare to verified real card side-by-side\n- Check for copyright text clarity on bottom\n- Examine holo pattern under magnification\n- Feel the card stock quality\n\n**If unsure:** Post pics here! Our community can help verify before you buy.\n\nStay safe out there collectors!',
  'Comprehensive guide on identifying counterfeit Pokemon cards',
  (SELECT id FROM categories WHERE slug = 'authentication'),
  (SELECT id FROM profiles WHERE username = 'FakeCardDetective'),
  true,
  false,
  3421,
  89,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '4 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'how-to-spot-fake-pokemon-cards-2025');

INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'is-this-base-set-charizard-real',
  'Is this Base Set Charizard real? Bought on eBay',
  E'Hey everyone, just bought what was listed as a "near mint Base Set Charizard" on eBay for $800.\n\nNow that I have it in hand, something feels off. The holo pattern looks slightly different from my other WOTC cards.\n\nI''ve uploaded photos here: [link to photos]\n\n**What concerns me:**\n- Holo seems too "perfect" - no scratches at all\n- Font looks slightly thicker than my other Base Set cards\n- Back of card feels smoother than usual\n\nSeller has good feedback but I''m worried. Can someone with experience please take a look?\n\nShould I get this professionally authenticated? Any recommendations on authentication services?',
  'Authentication request for potentially fake Base Set Charizard',
  (SELECT id FROM categories WHERE slug = 'authentication'),
  (SELECT id FROM profiles WHERE username = 'BeginnerTrainer'),
  false,
  567,
  18,
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'is-this-base-set-charizard-real');

-- Beginner Zone Category
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_pinned, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'complete-beginners-guide-pokemon-tcg',
  '🌟 Complete Beginner''s Guide to Pokemon TCG Collecting',
  E'Welcome new trainers! This guide covers everything you need to start your Pokemon TCG journey.\n\n**Step 1: Choose Your Path**\n- **Player** - Focus on competitive decks\n- **Collector** - Chase cards you love\n- **Investor** - Long-term sealed product\n- **Mix** - Most of us do all three!\n\n**Step 2: What to Buy First**\nFor beginners, I recommend:\n1. Elite Trainer Box (current set) - $50\n2. Battle Academy - $20 (learn to play)\n3. Singles for specific cards you want\n\n**Avoid:**\n- Dollar store packs (usually resealed)\n- \"Mystery boxes\" on eBay\n- Paying grading fees on cheap cards\n\n**Step 3: Protect Your Collection**\n- Penny sleeves + top loaders for valuable cards\n- Binders with side-loading pages\n- Never store in direct sunlight\n\n**Step 4: Learn Card Values**\n- TCGPlayer for current prices\n- 130point.com for JP cards  \n- PSA for graded card sales data\n\n**Step 5: Join the Community**\nWelcome to TCG Gossip! Ask questions, share pulls, have fun!\n\nComments welcome - what would you add?',
  'Complete guide for newcomers to Pokemon TCG collecting and playing',
  (SELECT id FROM categories WHERE slug = 'beginners'),
  (SELECT id FROM profiles WHERE username = 'VintageCollector'),
  true,
  true,
  2876,
  142,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'complete-beginners-guide-pokemon-tcg');

INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'should-i-open-or-keep-sealed',
  'Should I open my booster boxes or keep them sealed?',
  E'Just got into Pokemon cards last month and I''ve bought 3 Prismatic Evolutions booster boxes.\n\nEveryone keeps telling me different things:\n- My friend says open them because that''s the fun\n- YouTube says keep sealed for investment\n- Reddit says open 2 and keep 1 sealed\n\nI''m so confused! I really want to pull an Umbreon ex but also don''t want to lose money.\n\nWhat would you experienced collectors do? I''m not rich so these were a significant purchase for me.\n\nHelp a newbie out please!',
  'New collector seeking advice on opening vs keeping booster boxes sealed',
  (SELECT id FROM categories WHERE slug = 'beginners'),
  (SELECT id FROM profiles WHERE username = 'BeginnerTrainer'),
  false,
  1234,
  56,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '5 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'should-i-open-or-keep-sealed');

-- Investment & Finance Category
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'pokemon-card-market-trends-2025',
  'Pokemon Card Market Trends 2025 - What''s Hot & What''s Not',
  E'Market analysis after tracking prices for 18 months straight.\n\n**📈 TRENDING UP:**\n- Vintage WOTC holos (Base-Neo) - Steady 10-15% annual growth\n- Illustration Rares (Eeveelutions especially) - Hot right now\n- Japanese exclusive promos - International demand increasing\n- PSA 10 modern cards - More collectors grading\n\n**📉 TRENDING DOWN:**\n- Most VMAX cards - Oversupply, rotation fears\n- Non-holo rares from recent sets - Too common\n- Ungraded damaged vintage - Grading costs make raw less appealing\n\n**💎 BEST LONG-TERM HOLDS (IMO):**\n1. Sealed vintage booster boxes (Neo sets)\n2. Pikachu/Charizard from any era (safe bets)\n3. Tournament winner promos (limited supply)\n4. First edition WOTC PSA 9+\n\n**⚠️ AVOID:**\n- Anything marketed as "investment grade"\n- Modern bulk (99% of cards)\n- Fake graded slabs (verify before buying)\n\nThoughts? What are you holding long-term?',
  'Comprehensive market analysis of Pokemon card investment trends',
  (SELECT id FROM categories WHERE slug = 'investment'),
  (SELECT id FROM profiles WHERE username = 'MarketWatch'),
  true,
  1567,
  78,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '3 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'pokemon-card-market-trends-2025');

-- General Discussion Category
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'whats-your-favorite-pokemon-set',
  'What''s your favorite Pokemon set of all time and why?',
  E'Simple question but I''m curious what the community thinks!\n\nMine is **Neo Destiny** hands down. The artwork was peak Pokemon TCG IMO - Light/Dark Pokemon concept was incredible, Shining cards were revolutionary, and pulling that Shining Charizard is still my best memory from childhood.\n\nRunner ups:\n- Base Set (nostalgia)\n- EX Dragon Frontiers (gold stars!)\n- Hidden Fates (shiny vault was crack)\n\nWhat about you all? And please share WHY it''s your favorite - not just the name!\n\nBonus: What set do you think is most OVERRATED? 👀',
  'Community discussion about favorite Pokemon TCG sets throughout history',
  (SELECT id FROM categories WHERE slug = 'general'),
  (SELECT id FROM profiles WHERE username = 'VintageCollector'),
  false,
  892,
  67,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '4 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'whats-your-favorite-pokemon-set');

-- Grading Category
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'psa-vs-cgc-vs-bgs-which-grading-company',
  'PSA vs CGC vs BGS - Which grading company should I use?',
  E'Preparing my first grading submission and overwhelmed by options. Here''s what I''m sending:\n- 5x Vintage WOTC holos (Base Set - Neo)\n- 3x Modern chase cards (Illustration Rares)\n- 2x Japanese exclusives\n\n**Questions:**\n1. Which company gets best resale premiums?\n2. Turnaround times currently?\n3. Is sub-grading worth it?\n4. Should I use different companies for different eras?\n\n**What I''ve researched:**\n- PSA seems to have best resale but expensive\n- CGC is cheaper, faster, but lower premiums\n- BGS has best presentation with sub-grades\n\nExperienced graders - please share your wisdom!',
  'Comparing major grading companies for Pokemon cards',
  (SELECT id FROM categories WHERE slug = 'grading'),
  (SELECT id FROM profiles WHERE username = 'GradeHunter'),
  false,
  678,
  34,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '7 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'psa-vs-cgc-vs-bgs-which-grading-company');

-- Collecting Category
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'master-set-collecting-worth-it',
  'Is Master Set Collecting still worth it in 2025?',
  E'Thinking about starting a master set collection for Scarlet & Violet era.\n\nFor those who don''t know, a "master set" means:\n- Every card from main set\n- Every card from subsets\n- Every secret rare, full art, alt art, etc.\n- Reverse holos of everything\n\nWith modern sets having 200+ cards plus 60+ secrets, is this even realistic anymore?\n\n**Costs for recent sets:**\n- Prismatic Evolutions master set: $3,000-$4,000\n- Temporal Forces master: $1,200-$1,500\n- Paldean Fates: $800-$1,000\n\nAm I crazy or is focusing on favorite Pokemon/types more reasonable?\n\nMaster set collectors - talk me into or out of this!',
  'Discussion on the feasibility of modern master set collecting',
  (SELECT id FROM categories WHERE slug = 'collecting'),
  (SELECT id FROM profiles WHERE username = 'PikachuMaster'),
  false,
  445,
  23,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '8 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'master-set-collecting-worth-it');

-- Market & Prices Category
INSERT INTO threads (slug, title, content, excerpt, category_id, author_id, is_hot, view_count, post_count, created_at, updated_at)
SELECT
  'umbreon-vmax-alt-art-price-check',
  'Price Check - Umbreon VMAX Alt Art (Evolving Skies)',
  E'Looking to sell my Umbreon VMAX Alternate Art from Evolving Skies.\n\n**Condition:** Near Mint (pack fresh, immediately sleeved)\n- No whitening on corners\n- Perfect centering\n- No scratches on holo\n\n**Comps I''ve seen:**\n- TCGPlayer: $320-$380\n- eBay sold: $340-$400\n- Card shop offered me $280\n\nIs $360 a fair asking price? Or should I hold longer? Seems like prices have stabilized recently.\n\nAlso - better to sell raw or get it graded first? PSA costs $50-75 so would need PSA 9+ to make it worth it.\n\nAdvice appreciated!',
  'Price check and selling advice for Umbreon VMAX Alt Art',
  (SELECT id FROM categories WHERE slug = 'market'),
  (SELECT id FROM profiles WHERE username = 'CharizardFan99'),
  false,
  234,
  15,
  NOW() - INTERVAL '8 hours',
  NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM threads WHERE slug = 'umbreon-vmax-alt-art-price-check');

-- ========================================
-- STEP 3: Add Popular Tags
-- ========================================

-- Get some thread IDs for tagging
DO $$
DECLARE
  thread_charizard UUID;
  thread_pocket UUID;
  thread_fake UUID;
  thread_beginner UUID;
  thread_market UUID;
BEGIN
  -- Get thread IDs
  SELECT id INTO thread_charizard FROM threads WHERE slug = 'charizard-ex-meta-discussion-2025';
  SELECT id INTO thread_pocket FROM threads WHERE slug = 'tcg-pocket-f2p-guide-2025';
  SELECT id INTO thread_fake FROM threads WHERE slug = 'how-to-spot-fake-pokemon-cards-2025';
  SELECT id INTO thread_beginner FROM threads WHERE slug = 'complete-beginners-guide-pokemon-tcg';
  SELECT id INTO thread_market FROM threads WHERE slug = 'pokemon-card-market-trends-2025';

  -- Add tags if threads exist
  IF thread_charizard IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_charizard, 'competitive'),
      (thread_charizard, 'meta'),
      (thread_charizard, 'charizard'),
      (thread_charizard, 'deck-building')
    ON CONFLICT DO NOTHING;
  END IF;

  IF thread_pocket IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_pocket, 'tcg-pocket'),
      (thread_pocket, 'f2p'),
      (thread_pocket, 'guide'),
      (thread_pocket, 'mobile')
    ON CONFLICT DO NOTHING;
  END IF;

  IF thread_fake IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_fake, 'authentication'),
      (thread_fake, 'fake-cards'),
      (thread_fake, 'guide'),
      (thread_fake, 'beginner-friendly')
    ON CONFLICT DO NOTHING;
  END IF;

  IF thread_beginner IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_beginner, 'beginner'),
      (thread_beginner, 'guide'),
      (thread_beginner, 'collecting'),
      (thread_beginner, 'how-to')
    ON CONFLICT DO NOTHING;
  END IF;

  IF thread_market IS NOT NULL THEN
    INSERT INTO thread_tags (thread_id, tag) VALUES
      (thread_market, 'investment'),
      (thread_market, 'market-analysis'),
      (thread_market, 'trends'),
      (thread_market, 'sealed-product')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ========================================
-- STEP 4: Add Sample Replies
-- ========================================

-- Replies to Charizard ex meta thread
INSERT INTO replies (thread_id, author_id, content, created_at, updated_at)
SELECT
  (SELECT id FROM threads WHERE slug = 'charizard-ex-meta-discussion-2025'),
  (SELECT id FROM profiles WHERE username = 'VintageCollector'),
  E'Still running it at my local league and consistently placing top 4. The Pidgeot ex engine is just too good to give up. Only struggle is against Lost Zone Box honestly.',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
WHERE EXISTS (SELECT 1 FROM threads WHERE slug = 'charizard-ex-meta-discussion-2025');

INSERT INTO replies (thread_id, author_id, content, created_at, updated_at)
SELECT
  (SELECT id FROM threads WHERE slug = 'charizard-ex-meta-discussion-2025'),
  (SELECT id FROM profiles WHERE username = 'PocketProPlayer'),
  E'I switched to Mew VMAX and haven''t looked back. Charizard is good but feels like everyone has the perfect counter now. Just my experience though!',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
WHERE EXISTS (SELECT 1 FROM threads WHERE slug = 'charizard-ex-meta-discussion-2025');

-- Replies to TCG Pocket F2P guide
INSERT INTO replies (thread_id, author_id, content, created_at, updated_at)
SELECT
  (SELECT id FROM threads WHERE slug = 'tcg-pocket-f2p-guide-2025'),
  (SELECT id FROM profiles WHERE username = 'BeginnerTrainer'),
  E'This is EXACTLY what I needed! Been making so many mistakes with Wonder Picks. Thanks for this guide!',
  NOW() - INTERVAL '45 minutes',
  NOW() - INTERVAL '45 minutes'
WHERE EXISTS (SELECT 1 FROM threads WHERE slug = 'tcg-pocket-f2p-guide-2025');

INSERT INTO replies (thread_id, author_id, content, created_at, updated_at)
SELECT
  (SELECT id FROM threads WHERE slug = 'tcg-pocket-f2p-guide-2025'),
  (SELECT id FROM profiles WHERE username = 'CompetitiveAce'),
  E'Great guide! I''d add that saving hourglasses for new set releases is key. You can bulk open on day 1 and get ahead of the meta.',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
WHERE EXISTS (SELECT 1 FROM threads WHERE slug = 'tcg-pocket-f2p-guide-2025');

-- Replies to fake card authentication
INSERT INTO replies (thread_id, author_id, content, created_at, updated_at)
SELECT
  (SELECT id FROM threads WHERE slug = 'is-this-base-set-charizard-real'),
  (SELECT id FROM profiles WHERE username = 'FakeCardDetective'),
  E'From the photos, this looks suspicious. The holo pattern is the wrong type for Base Set. That''s a common tell on Chinese counterfeits. I''d request a refund ASAP and report the seller to eBay.',
  NOW() - INTERVAL '50 minutes',
  NOW() - INTERVAL '50 minutes'
WHERE EXISTS (SELECT 1 FROM threads WHERE slug = 'is-this-base-set-charizard-real');

INSERT INTO replies (thread_id, author_id, content, created_at, updated_at)
SELECT
  (SELECT id FROM threads WHERE slug = 'is-this-base-set-charizard-real'),
  (SELECT id FROM profiles WHERE username = 'VintageCollector'),
  E'Yeah that''s fake unfortunately. The back has the wrong shade of blue. Real WOTC backs have a specific Pantone blue that fakes never get right. File a claim with eBay - they''re usually good about refunding fake cards.',
  NOW() - INTERVAL '40 minutes',
  NOW() - INTERVAL '40 minutes'
WHERE EXISTS (SELECT 1 FROM threads WHERE slug = 'is-this-base-set-charizard-real');

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check what was created
SELECT 'Users created:' as info, COUNT(*) as count FROM profiles;
SELECT 'Threads created:' as info, COUNT(*) as count FROM threads;
SELECT 'Replies created:' as info, COUNT(*) as count FROM replies;
SELECT 'Tags created:' as info, COUNT(*) as count FROM thread_tags;

-- Show threads by category
SELECT
  c.name as category,
  COUNT(t.id) as thread_count
FROM categories c
LEFT JOIN threads t ON c.id = t.category_id
GROUP BY c.name, c.sort_order
ORDER BY c.sort_order;

-- ========================================
-- SEED DATA COMPLETE!
-- ========================================
-- Your forum now has realistic content to launch with
-- Next steps:
-- 1. Log in as admin@tcggossip.com (password: ChangeThisPassword123!)
-- 2. Change your admin password immediately
-- 3. Customize your profile
-- 4. Invite beta testers
-- ========================================
