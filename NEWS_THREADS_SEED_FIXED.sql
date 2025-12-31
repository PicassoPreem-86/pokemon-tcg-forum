-- ============================================
-- TCG NEWS & UPDATES - 10 REALISTIC THREADS
-- ============================================
-- Based on real December 2025 Pokemon & One Piece TCG news
-- Date: December 31, 2025

DO $$
DECLARE
  admin_id UUID;
  news_category_id UUID;

  -- Thread IDs for tracking
  thread1_id UUID;
  thread2_id UUID;
  thread3_id UUID;
  thread4_id UUID;
  thread5_id UUID;
  thread6_id UUID;
  thread7_id UUID;
  thread8_id UUID;
  thread9_id UUID;
  thread10_id UUID;

BEGIN
  -- Get admin user and news category
  SELECT id INTO admin_id FROM profiles WHERE username = 'admin' LIMIT 1;
  SELECT id INTO news_category_id FROM categories WHERE slug = 'news';

  -- ============================================
  -- THREAD 1: Pokemon Journey Together Announcement (Hot, Pinned)
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'journey-together-march-2025-trainers-pokemon-return',
    '🔥 OFFICIAL: Journey Together Set Drops March 28th - Trainer''s Pokemon Return!',
    '# Journey Together - March 28, 2025 Release

The Pokemon Company just dropped the FULL reveal for **Scarlet & Violet—Journey Together**, releasing March 28, 2025!

## 🎯 Major Features

### Return of Trainer''s Pokemon!
For the FIRST TIME since EX Team Magma vs Team Aqua (2004), we''re getting **Trainer''s Pokemon** in a main expansion!

**Confirmed Trainer''s Pokemon ex:**
- 🔮 N''s Zoroark ex
- ⚡ Iono''s Bellibolt ex
- 🌸 Lillie''s Clefairy ex
- ⚔️ Hop''s Zacian ex
- 🔥 Leon''s Charizard ex
- And 35+ more!

### Other Highlights
- Over 290 cards in the set
- New Tera Pokemon ex cards
- Illustration Rares featuring trainers and their Pokemon
- **FIRST EVER** Latin American Spanish release

## 📅 Important Dates

- **March 15-23**: Prerelease events
- **March 15**: Build & Battle Boxes available at select retailers
- **March 28**: Full set release

## 💭 What This Means

This could shake up the competitive scene BIG TIME. Trainer''s Pokemon typically have unique abilities that reference their trainers. If these cards are playable, we might see a whole new archetype emerge.

## 💰 Investment Potential

The nostalgia factor is INSANE. N''s Zoroark and Lillie''s Clefairy are going to be chase cards. Early pre-orders for booster boxes are already selling out.

**Prediction:** Illustration Rares of popular trainers (N, Lillie, Cynthia) will hit $100+ within a week of release.

---

What trainer combo are YOU most excited for? Will you be attending prerelease events?',
    'Journey Together set releasing March 28 brings back Trainer''s Pokemon for first time since 2004!',
    news_category_id,
    admin_id,
    8934,
    127,
    true,
    true,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '45 minutes'
  ) RETURNING id INTO thread1_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (thread1_id, 'pokemon'),
    (thread1_id, 'journey-together'),
    (thread1_id, 'official'),
    (thread1_id, 'announcement');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (thread1_id, admin_id, 'N''s Zoroark ex is going to be EXPENSIVE. N is one of the most popular characters ever.', NOW() - INTERVAL '1 day'),
    (thread1_id, admin_id, 'Already pre-ordered 2 booster boxes. The Lillie and N cards alone make this worth it.', NOW() - INTERVAL '18 hours'),
    (thread1_id, admin_id, 'Latin American Spanish release is huge for accessibility. Great move by Pokemon!', NOW() - INTERVAL '12 hours');

  -- ============================================
  -- THREAD 2: Mega Evolution Market Crash (Hot)
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'mega-evolution-market-crash-december-2025',
    '📉 MARKET ALERT: Mega Hyper Rares Crashing Hard - Lucario Down $144',
    '# Mega Evolution Market Crash - December 2025

The Mega Evolution era cards are experiencing MASSIVE price drops this month. If you''ve been holding, you might want to reconsider.

## 💸 Major Drops

**Mega Lucario ex Mega Hyper Rare:**
- November: $180
- December: $36
- **Loss: -$144 (-80%)**

**Mega Charizard ex Mega Hyper Rare:**
- November: $250
- December: $115
- **Loss: -$135 (-54%)**

**Mega Gengar ex Mega Hyper Rare:**
- November: $95
- December: $42
- **Loss: -$53 (-56%)**

## 🤔 Why is This Happening?

Several factors:

1. **Oversupply** - Mega Evolution sets were heavily printed
2. **Meta shifts** - Mega cards not dominating competitive
3. **Journey Together hype** - People selling to pre-order new set
4. **Holiday spending** - People liquidating collections for cash

## 📊 Is This a Buying Opportunity?

**Bulls say:**
- Mega Evolution era just started - long-term hold
- Gold Hyper Rares are beautiful and collectible
- Market will recover after Journey Together release

**Bears say:**
- Print runs are WAY too high
- Competitive demand isn''t there
- Modern Pokemon is oversaturated

## 💭 My Take

I think we see another 20-30% drop before bottoming out. Journey Together will absorb all the market attention through March.

MAYBE a good buy in February when prices hit absolute floor.

---

Are you buying the dip or selling before it gets worse?',
    'Mega Evolution Hyper Rares experiencing 50-80% price crashes in December 2025.',
    news_category_id,
    admin_id,
    6234,
    89,
    false,
    true,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 hours'
  ) RETURNING id INTO thread2_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (thread2_id, 'pokemon'),
    (thread2_id, 'market'),
    (thread2_id, 'mega-evolution'),
    (thread2_id, 'prices');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (thread2_id, admin_id, 'Sold all my Mega Hypers last month. Dodged a BULLET.', NOW() - INTERVAL '2 days'),
    (thread2_id, admin_id, 'This is just a correction. Long-term these will recover. Buying more.', NOW() - INTERVAL '1 day'),
    (thread2_id, admin_id, 'The print runs are insane. I don''t think these ever recover to November prices.', NOW() - INTERVAL '8 hours');

  -- ============================================
  -- THREAD 3: Pokemon TCG Pocket Crimson Blaze (Hot)
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'pokemon-tcg-pocket-crimson-blaze-expansion',
    '📱 Pokemon TCG Pocket: Crimson Blaze Expansion LIVE - Mega Evolutions Added!',
    '# Crimson Blaze Expansion - Now Live in Pokemon TCG Pocket!

The **Crimson Blaze** expansion dropped December 16th at 10pm PST, bringing Mega Evolution to the digital format!

## 🔥 What''s New

**Mega Evolution Pokemon ex:**
- Mega Charizard X ex
- Mega Lucario ex
- Mega Gengar ex
- Mega Blaziken ex
- And more!

**New Mechanics:**
- Mega Evolution triggers during battle
- Special Mega Evolution pack opening animations
- Updated deck building with Mega support

## 🎮 Early Impressions

The Mega Evolution animations are SICK. Opening a pack and getting that rainbow glow when you pull a Mega ex is so satisfying.

**Meta Impact:**
Mega Charizard X is already dominating. The ability to OHKO most ex Pokemon while having 280 HP is broken.

## 💰 F2P Viability

Unfortunately, the pack point system makes it HARD to build a Mega deck without spending. You need specific regular cards to enable the Mega Evolution, and the gacha rates are rough.

**Expected pack points for full Mega Charizard deck:** ~800-1000 packs

## 🎨 Collection Features

New binder pages with Mega Evolution theme. The art on these cards is phenomenal - especially the full art Mega ex cards.

## ⚖️ Trading Update Incoming?

Still no trading feature, but datamines suggest it''s coming in January 2026 update. The community is getting LOUD about wanting trades.

---

Have you pulled any Mega ex yet? What''s your current deck?',
    'Crimson Blaze expansion brings Mega Evolution to Pokemon TCG Pocket with new mechanics.',
    news_category_id,
    admin_id,
    5823,
    73,
    false,
    true,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '6 hours'
  ) RETURNING id INTO thread3_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (thread3_id, 'pokemon'),
    (thread3_id, 'tcg-pocket'),
    (thread3_id, 'mobile'),
    (thread3_id, 'mega-evolution');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (thread3_id, admin_id, 'Pulled Mega Charizard X on my 7th pack! The animation is incredible.', NOW() - INTERVAL '4 days'),
    (thread3_id, admin_id, 'The gacha rates are predatory. 1000 packs for a deck is ridiculous.', NOW() - INTERVAL '3 days'),
    (thread3_id, admin_id, 'Still no trading feature. Getting tired of waiting, might quit.', NOW() - INTERVAL '1 day');

  -- ============================================
  -- THREAD 4: One Piece OP-11 Fist of Divine Speed
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'one-piece-op11-fist-divine-speed-june-release',
    '🏴‍☠️ One Piece OP-11 "A Fist of Divine Speed" - June 6 Release Date!',
    '# OP-11: A Fist of Divine Speed - June 6, 2025

Bandai just announced the English release for **OP-11: A Fist of Divine Speed**!

## 📅 Release Details

- **Japan Release:** March 1, 2025 (already out)
- **English Release:** June 6, 2025
- **MSRP:** $4.99 per pack
- **Also releasing:** 6 new Starter Decks (ST-23 through ST-28)

## 🎯 Featured Characters

Based on the Japanese release, we''re getting:

**New Leaders:**
- Garp (Navy Fist)
- Koby (SWORD member)
- Sengoku (Former Fleet Admiral)

**Chase Cards:**
- Alt Art Garp (already $120+ in Japan)
- Secret Rare Monkey D. Luffy
- Special Parallel Koby

## 🥊 Theme

The set focuses on the **Marines and Navy** storyline, particularly the legendary "Hero of the Marines" Garp and his Divine Speed fist techniques.

## 💪 Competitive Outlook

Japanese meta shows Garp Leader is STRONG. Aggro-control hybrid that can swing games fast. Expect this to be tier 1 when it drops in English.

## 📦 Six New Starter Decks

Releasing same day:
- ST-23: Red Shanks
- ST-24: Green Jewelry Bonney
- ST-25: Blue Buggy
- ST-26: Purple/Black Luffy
- ST-27: Black Marshall D. Teach
- ST-28: Green/Yellow Yamato

These are BUDGET FRIENDLY ways to get into the game. Yamato and Shanks decks look especially strong.

## 💰 Pre-Order Advice

Alt Art Garp will be EXPENSIVE. If you want it, buy singles in the first week. Box prices are already climbing.

---

Will you be picking up OP-11? Which starter deck looks best?',
    'One Piece OP-11 A Fist of Divine Speed releases June 6 with new Garp leader and 6 starter decks.',
    news_category_id,
    admin_id,
    4567,
    62,
    false,
    false,
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '8 hours'
  ) RETURNING id INTO thread4_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (thread4_id, 'one-piece'),
    (thread4_id, 'op-11'),
    (thread4_id, 'official'),
    (thread4_id, 'announcement');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (thread4_id, admin_id, 'Garp Leader is going to dominate. The Japanese tournament results prove it.', NOW() - INTERVAL '5 days'),
    (thread4_id, admin_id, 'Already imported Japanese boxes. Alt Art Garp is beautiful!', NOW() - INTERVAL '4 days'),
    (thread4_id, admin_id, 'The Yamato starter deck (ST-28) looks INSANE. Dual color is strong.', NOW() - INTERVAL '2 days');

  -- ============================================
  -- THREAD 5: One Piece OP-13 Carrying On His Will
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'one-piece-op13-carrying-on-his-will-november',
    'OP-13 "Carrying On His Will" Announced - Will of D Theme! 🔥',
    '# OP-13: Carrying On His Will - November 2025

Bandai officially revealed **OP-13: Carrying On His Will** for November 2025!

## 🎯 Core Theme: The Will of D

The set centers around the **Three Brothers** and the inherited will:
- Monkey D. Luffy
- Portgas D. Ace
- Sabo (Revolutionary Army)

## 🔥 Confirmed Features

**Will of D Mechanic:**
- New keyword ability linking D carriers
- Chain effects between Luffy, Ace, Law, and other D members
- "Inherited Will" triggers when characters leave play

**Expected Leaders:**
- Luffy (Gear 5 form?)
- Ace (Marineford era)
- Sabo (Revolutionary Commander)
- Trafalgar Law (Heart Pirates)

## 😢 Emotional Investment

This set is going to HIT DIFFERENT. The Ace and Luffy storyline is peak One Piece. Expect incredible art showing their bond.

**Chase Card Predictions:**
- Alt Art showing all three brothers together
- Ace''s final moments illustration rare
- Luffy Gear 5 secret rare

## 📊 Market Outlook

The emotional attachment + powerful Will of D mechanic = HIGH PRICES.

If they do an Illustration Rare of the three brothers as kids, that''s easily a $200+ card.

## ⚠️ Official Errata Issued

Bandai already issued an apology for errata and revision in card effect text. They''re playtesting heavily to avoid broken interactions.

This is GOOD - shows they''re learning from past mistakes.

---

Will of D hype is REAL. Are you saving for November?',
    'OP-13 Carrying On His Will announced for November 2025 with Will of D mechanic.',
    news_category_id,
    admin_id,
    3892,
    54,
    false,
    false,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '12 hours'
  ) RETURNING id INTO thread5_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (thread5_id, 'one-piece'),
    (thread5_id, 'op-13'),
    (thread5_id, 'will-of-d'),
    (thread5_id, 'announcement');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (thread5_id, admin_id, 'If they print an alt art of the three brothers, I''m buying a case.', NOW() - INTERVAL '7 days'),
    (thread5_id, admin_id, 'Will of D mechanic sounds broken if it chains. Could be too strong.', NOW() - INTERVAL '6 days'),
    (thread5_id, admin_id, 'Ace art is going to make grown men cry. I''m already emotionally invested.', NOW() - INTERVAL '4 days');

  -- ============================================
  -- THREAD 6: Dollar General Pokemon Restock Drama
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'dollar-general-pokemon-cards-restock-2025',
    '💰 RESTOCK ALERT: Dollar General Has Prismatic Evolutions - Check Your Stores!',
    '# Dollar General Restocking Prismatic Evolutions!

Huge restock happening at Dollar General stores!

## 🎯 What''s In Stock

**Confirmed sightings:**
- Scarlet & Violet - Prismatic Evolutions mini tins
- Temporal Forces blister packs
- Crown Zenith single blisters
- Random loose booster packs

## 📍 Where to Look

**Successful finds reported in:**
- Rural Dollar General locations
- Small town stores (NOT major cities)
- Stores that don''t normally carry Pokemon

## 💡 Pro Tips

1. **Call ahead** - Ask if they have "Pokemon trading cards" in stock
2. **Check the toy aisle AND checkout** - They stock in random spots
3. **Go early morning** - Restocks usually happen overnight
4. **Be respectful** - Don''t clear out the entire shelf
5. **Bring cash** - Some DG card readers are slow

## 🔥 My Haul

Hit 3 Dollar Generals this morning:
- Store 1: 2 Prismatic Evo tins ($12 each)
- Store 2: Nothing
- Store 3: 6 Temporal Forces blisters ($5 each)

**Total pulls:** 1 Illustration Rare Umbreon, bunch of holos

## 💭 Why This Matters

Dollar General gets overlooked shipments that Target/Walmart don''t. You can find MSRP products that are sold out everywhere else.

**Prismatic Evolutions tins are $25+ on eBay**, but DG sells them for $12.

## ⚠️ Scalper Alert

Don''t be that person buying ALL the stock to resell. Leave some for kids and casual collectors.

---

Check your local DG and report back! Good luck!',
    'Dollar General stores restocking Prismatic Evolutions and other Pokemon products at MSRP.',
    news_category_id,
    admin_id,
    7234,
    112,
    false,
    true,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '3 hours'
  ) RETURNING id INTO thread6_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (thread6_id, 'pokemon'),
    (thread6_id, 'restock'),
    (thread6_id, 'prismatic-evolutions'),
    (thread6_id, 'retail');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (thread6_id, admin_id, 'Just checked my local DG - they had 4 tins! Thanks for the tip!', NOW() - INTERVAL '3 days'),
    (thread6_id, admin_id, 'Called 8 stores. 6 had nothing, but 2 had Prismatic Evo. Worth the effort.', NOW() - INTERVAL '2 days'),
    (thread6_id, admin_id, 'Scalpers already cleaned out my area. All sold to one guy. So frustrating.', NOW() - INTERVAL '1 day');

  -- ============================================
  -- THREAD 7: 2025 Year in Review
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    '2025-tcg-year-in-review-retrospective',
    '🎊 2025 TCG Year in Review - What a Crazy Year!',
    '# 2025 Trading Card Game Year in Review

As we close out 2025, let''s reflect on what an INSANE year it''s been for TCGs!

## 🏆 Pokemon TCG Highlights

**New Era Launched:**
- Scarlet & Violet era ended
- Mega Evolution era began (November 14)
- Introduction of Gold Hyper Rares as chase cards

**Biggest Releases:**
- Temporal Forces (March)
- Prismatic Evolutions (May) - INSTANT CLASSIC
- Mega Evolution - Phantasmal Flames (November)

**Pokemon TCG Pocket:**
- Mobile app DOMINATED downloads
- Crimson Blaze expansion brought Mega Evolutions
- Trading feature STILL not released (community in shambles)

## 🏴‍☠️ One Piece TCG Highlights

**Explosive Growth:**
- OP-10: Royal Blood (March global)
- OP-11: A Fist of Divine Speed announced (June 2026)
- Anime 25th Collection celebrated the series

**Meta Evolution:**
- Garp Leader emerged as top tier
- Doffy control dominated summer tournaments
- 6 new Starter Decks announced

## 📉 Market Madness

**Biggest Gainers:**
- Prismatic Evolutions Umbreon Illustration Rare: $40 to $180
- One Piece Alt Art Shanks (OP-01): $150 to $380
- Base Set Charizard PSA 10: $380k to $425k

**Biggest Losers:**
- Mega Evolution Hyper Rares: -60% average
- Modern bulk: Worthless unless Illustration Rare
- Overprinted promos: -80%

## 🎮 Digital Revolution

- Pokemon TCG Live continued to lag behind
- TCG Pocket became #1 mobile TCG
- Limitless TCG became essential tournament tracker

## 💭 Community Drama

1. Best Buy Destined Rivals sellout - Botted in seconds
2. TCG Pocket trading backlash - Greedy monetization
3. Scalpers vs Collectors war - Retail stocks disappeared
4. PSA vs BGS debate - Still no consensus

## 🔮 Looking to 2026

**Confirmed:**
- Journey Together (March 28, 2026)
- OP-11 English (June 6, 2026)
- Mega Evolution: Ascended Heroes (January 30, 2026)

---

What was YOUR TCG highlight of 2025? Best pull? Worst investment?',
    'Complete retrospective of the 2025 TCG year covering Pokemon, One Piece, and market trends.',
    news_category_id,
    admin_id,
    6892,
    98,
    false,
    false,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '4 hours'
  ) RETURNING id INTO thread7_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (thread7_id, 'year-in-review'),
    (thread7_id, '2025'),
    (thread7_id, 'pokemon'),
    (thread7_id, 'one-piece');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (thread7_id, admin_id, 'Best pull: Umbreon Illustration Rare from Prismatic Evolutions. Sold for $160!', NOW() - INTERVAL '20 hours'),
    (thread7_id, admin_id, 'Worst investment: Bought 10 Mega Evolution Hyper Rares. Down $800 total.', NOW() - INTERVAL '16 hours'),
    (thread7_id, admin_id, '2025 was the year One Piece TCG went mainstream. Amazing to watch.', NOW() - INTERVAL '8 hours');

  -- ============================================
  -- THREAD 8: Best Buy Pre-Order Disaster
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'best-buy-destined-rivals-preorder-sellout',
    '😡 Best Buy Destined Rivals Drop = INSTANT Sellout (Botted Again)',
    '# Best Buy Destined Rivals Pre-Order Disaster

Best Buy pre-orders for Destined Rivals sold out in SECONDS.

## ⏱️ Timeline

- 12:00:00 PM EST - Product page goes live
- 12:00:08 PM EST - Elite Trainer Box sold out
- 12:00:15 PM EST - Booster bundles sold out
- 12:00:23 PM EST - Everything gone

Manual checkout was IMPOSSIBLE.

## 🤖 Bot Activity Confirmed

Multiple reseller channels confirmed successful bot runs:
- One group got 847 ETBs
- Another got 600+ booster bundles
- Regular collectors got NOTHING

## 💸 Resale Market

**Retail price:** $49.99 ETB
**eBay listings within 5 minutes:** $89.99+
**Current eBay price:** $110-140

Scalpers made INSTANT profit while real collectors struck out.

## 📢 Community Response

The community is FURIOUS. Demanding:
- Better bot protection
- Purchase limits per account
- In-store only releases
- Lottery system for high-demand products

## 🏢 Best Buy Response

"We are aware of the high demand and are working to improve the shopping experience."

Translation: Nothing will change.

## 🛡️ How to Fight Back

1. Report suspicious eBay sellers - Mass listings = bots
2. Don''t buy from scalpers - No demand = price drops
3. Support local game stores - They actually limit purchases
4. Demand change - Email Best Buy, Pokemon, everyone

---

Did anyone here actually GET a pre-order? Share your experience below.',
    'Best Buy Destined Rivals pre-orders sold out instantly to bots, leaving collectors frustrated.',
    news_category_id,
    admin_id,
    9234,
    156,
    false,
    true,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '5 hours'
  ) RETURNING id INTO thread8_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (thread8_id, 'pokemon'),
    (thread8_id, 'best-buy'),
    (thread8_id, 'scalpers'),
    (thread8_id, 'bots');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (thread8_id, admin_id, 'Had it in my cart at 12:00:05. Checkout crashed. Sold out when I refreshed.', NOW() - INTERVAL '9 days'),
    (thread8_id, admin_id, 'This is why I only buy from my local game store now. Worth the small markup.', NOW() - INTERVAL '8 days'),
    (thread8_id, admin_id, 'Saw the same seller list 200+ ETBs on eBay. Reported them all. Disgusting.', NOW() - INTERVAL '7 days');

  -- ============================================
  -- THREAD 9: Collector Chest 2025
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'pokemon-collector-chest-2025-review',
    '📦 Collector Chest 2025 Review - Worth the $19.99?',
    '# Collector Chest 2025 - Full Review

The **Collector Chest 2025** dropped December 5th alongside Mega Kangaskhan ex Box. Is it worth your money?

## 📦 What''s Inside

**Packs (6 total):**
- 2x Mega Evolution - Phantasmal Flames
- 1x Prismatic Evolutions
- 1x Temporal Forces
- 1x Obsidian Flames
- 1x Paldean Fates

**Other Contents:**
- Metal coin (Mega Rayquaza design)
- 65 card sleeves (Mega Evolution themed)
- 45 Energy cards
- Damage counters
- Condition markers
- Storage box

## 💰 Value Analysis

**MSRP:** $19.99

**Pack value alone:**
- Mega Evolution packs: $4 x 2 = $8
- Prismatic Evo: $5
- Others: $4 x 3 = $12
- **Total pack value: $25**

You''re getting $25 in packs PLUS accessories for $20. Solid deal.

## 🎯 Best For

Good for new players and sealed collectors.
Not ideal for chase hunters (only 6 packs, low odds).

## 🎨 Quality Check

The storage box is NICE quality. Metal construction, foam insert, magnetic closure. Actually usable for storage.

Sleeves are standard Pokemon quality.
Coin is solid metal with good detail.

## 🤔 Verdict

7.5/10 - Good value for MSRP. The accessories and storage box add real value. Pack selection is solid.

**Buy if:** You want storage + some packs for cheap
**Skip if:** You''re only hunting chase cards

---

Did you grab a Collector Chest? What did you pull?',
    'In-depth review of Pokemon Collector Chest 2025 released December 5th.',
    news_category_id,
    admin_id,
    3456,
    47,
    false,
    false,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '18 hours'
  ) RETURNING id INTO thread9_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (thread9_id, 'pokemon'),
    (thread9_id, 'collector-chest'),
    (thread9_id, 'review'),
    (thread9_id, 'product');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (thread9_id, admin_id, 'Pulled Mega Charizard ex from my Mega Evolution packs. Box paid for itself!', NOW() - INTERVAL '11 days'),
    (thread9_id, admin_id, 'The storage box is legit. Using it for my deck and dice. Great quality.', NOW() - INTERVAL '10 days'),
    (thread9_id, admin_id, 'Only got bulk from mine. Still worth it for the accessories at $20.', NOW() - INTERVAL '9 days');

  -- ============================================
  -- THREAD 10: Start Deck 100 Battle Collection
  -- ============================================

  INSERT INTO threads (
    id, slug, title, content, excerpt, category_id, author_id,
    view_count, post_count, is_pinned, is_hot, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'pokemon-start-deck-100-battle-collection',
    '🎲 Start Deck 100 Battle Collection Released - Chaotic Fun!',
    '# Start Deck 100 Battle Collection - December 19 Release

Pokemon dropped the **Start Deck 100 Battle Collection** on December 19th.

## 🎯 What Is It?

A special product featuring:
- 100 different 60-card starter decks
- Random deck in each package ($12.99)
- Each deck is playable out of the box
- Unique deck themes and strategies

You don''t know which deck you''re getting until you open it!

## 🏆 Competitive Viability

**Power Rankings (Community Consensus):**
- S-Tier: Decks 7, 34, 89 (tournament viable)
- A-Tier: Decks 12, 45, 56, 78, 91
- B-Tier: Most decks (casual play)
- Meme-Tier: Decks 13, 69, 99 (for the lulz)

## 🎮 Play Experience

Hosted a Start Deck 100 tournament at my LGS:
- Everyone bought 1 random deck
- Played Swiss rounds
- Winner got a booster box

IT WAS AMAZING. The variety made every match different.

## 💰 Value Assessment

$12.99 for 60 cards is decent value IF you get a good deck.

**Deck quality breakdown:**
- 10% are tournament playable
- 40% are solid casual decks
- 50% are meme tier

It''s a gamble, but the fun factor is worth it.

## 🎊 Community Events

Perfect for:
- League nights
- Casual tournaments
- Teaching new players
- Chaos sealed events

---

Have you tried Start Deck 100? Which deck did you get?',
    'Start Deck 100 Battle Collection released Dec 19 with 100 random playable starter decks.',
    news_category_id,
    admin_id,
    2834,
    38,
    false,
    false,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '14 hours'
  ) RETURNING id INTO thread10_id;

  INSERT INTO thread_tags (thread_id, tag) VALUES
    (thread10_id, 'pokemon'),
    (thread10_id, 'start-deck-100'),
    (thread10_id, 'product'),
    (thread10_id, 'casual');

  INSERT INTO replies (thread_id, author_id, content, created_at) VALUES
    (thread10_id, admin_id, 'Got Deck #34! One of the S-tier decks. Super lucky!', NOW() - INTERVAL '6 days'),
    (thread10_id, admin_id, 'Pulled Deck #69 (the meme stall deck). It''s terrible but hilarious.', NOW() - INTERVAL '5 days'),
    (thread10_id, admin_id, 'Running a Start Deck tournament this weekend. Can''t wait!', NOW() - INTERVAL '3 days');

  RAISE NOTICE 'Successfully created 10 news threads!';

END $$;

-- ============================================
-- VERIFICATION QUERY
-- ============================================

SELECT
  t.title,
  t.view_count,
  t.post_count,
  t.is_pinned,
  t.is_hot,
  c.name as category,
  COUNT(r.id) as actual_replies
FROM threads t
JOIN categories c ON t.category_id = c.id
LEFT JOIN replies r ON r.thread_id = t.id
WHERE c.slug = 'news'
GROUP BY t.id, t.title, t.view_count, t.post_count, t.is_pinned, t.is_hot, c.name
ORDER BY t.created_at DESC;
