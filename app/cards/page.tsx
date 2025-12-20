'use client';

import React, { useState, useMemo } from 'react';
import { Search, Layers, Sparkles } from 'lucide-react';

// Mock card data
const MOCK_CARDS = [
  { id: 1, name: 'Charizard', set: 'Base Set', number: '4/102', rarity: 'holo', price: 350.00, image: '/images/cards/charizard.png' },
  { id: 2, name: 'Pikachu', set: 'Base Set', number: '58/102', rarity: 'common', price: 5.00, image: '/images/cards/pikachu.png' },
  { id: 3, name: 'Blastoise', set: 'Base Set', number: '2/102', rarity: 'holo', price: 120.00, image: '/images/cards/blastoise.png' },
  { id: 4, name: 'Venusaur', set: 'Base Set', number: '15/102', rarity: 'holo', price: 95.00, image: '/images/cards/venusaur.png' },
  { id: 5, name: 'Mewtwo', set: 'Base Set', number: '10/102', rarity: 'holo', price: 85.00, image: '/images/cards/mewtwo.png' },
  { id: 6, name: 'Mew', set: 'Fossil', number: '8/62', rarity: 'holo', price: 75.00, image: '/images/cards/mew.png' },
  { id: 7, name: 'Umbreon VMAX', set: 'Evolving Skies', number: '215/203', rarity: 'secret', price: 200.00, image: '/images/cards/umbreon-vmax.png' },
  { id: 8, name: 'Rayquaza VMAX', set: 'Evolving Skies', number: '218/203', rarity: 'secret', price: 180.00, image: '/images/cards/rayquaza-vmax.png' },
  { id: 9, name: 'Lugia V', set: 'Silver Tempest', number: '186/195', rarity: 'ultra', price: 45.00, image: '/images/cards/lugia-v.png' },
  { id: 10, name: 'Giratina V', set: 'Lost Origin', number: '186/196', rarity: 'ultra', price: 35.00, image: '/images/cards/giratina-v.png' },
  { id: 11, name: 'Gengar VMAX', set: 'Fusion Strike', number: '271/264', rarity: 'secret', price: 120.00, image: '/images/cards/gengar-vmax.png' },
  { id: 12, name: 'Dragonite V', set: 'Evolving Skies', number: '192/203', rarity: 'ultra', price: 28.00, image: '/images/cards/dragonite-v.png' },
  { id: 13, name: 'Sylveon VMAX', set: 'Evolving Skies', number: '212/203', rarity: 'secret', price: 85.00, image: '/images/cards/sylveon-vmax.png' },
  { id: 14, name: 'Espeon VMAX', set: 'Evolving Skies', number: '214/203', rarity: 'secret', price: 75.00, image: '/images/cards/espeon-vmax.png' },
  { id: 15, name: 'Alakazam', set: 'Base Set', number: '1/102', rarity: 'holo', price: 45.00, image: '/images/cards/alakazam.png' },
  { id: 16, name: 'Gyarados', set: 'Base Set', number: '6/102', rarity: 'holo', price: 55.00, image: '/images/cards/gyarados.png' },
  { id: 17, name: 'Magikarp', set: 'Base Set', number: '35/102', rarity: 'uncommon', price: 3.00, image: '/images/cards/magikarp.png' },
  { id: 18, name: 'Eevee', set: 'Jungle', number: '51/64', rarity: 'common', price: 8.00, image: '/images/cards/eevee.png' },
  { id: 19, name: 'Snorlax', set: 'Jungle', number: '11/64', rarity: 'holo', price: 35.00, image: '/images/cards/snorlax.png' },
  { id: 20, name: 'Machamp', set: 'Base Set', number: '8/102', rarity: 'holo', price: 25.00, image: '/images/cards/machamp.png' },
];

const SET_CATEGORIES = [
  { id: 'all', name: 'All Sets' },
  { id: 'scarlet-violet', name: 'Scarlet & Violet' },
  { id: 'sword-shield', name: 'Sword & Shield' },
  { id: 'vintage', name: 'Vintage (1999-2003)' },
  { id: 'xy', name: 'XY Series' },
  { id: 'sun-moon', name: 'Sun & Moon' },
  { id: 'promo', name: 'Promos' }
];

type SortOption = 'name' | 'price_high' | 'price_low' | 'rarity' | 'set';

export default function CardsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSet, setSelectedSet] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 12;

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let cards = [...MOCK_CARDS];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      cards = cards.filter(card =>
        card.name.toLowerCase().includes(query) ||
        card.set.toLowerCase().includes(query)
      );
    }

    // Rarity filter
    if (selectedRarity !== 'all') {
      cards = cards.filter(card => card.rarity === selectedRarity);
    }

    // Sort
    cards.sort((a, b) => {
      switch (sortBy) {
        case 'price_high':
          return b.price - a.price;
        case 'price_low':
          return a.price - b.price;
        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'holo', 'ultra', 'secret'];
          return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
        case 'set':
          return a.set.localeCompare(b.set);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    // Set filter
    if (selectedSet !== 'all') {
      cards = cards.filter(card => card.set === selectedSet);
    }

    return cards;
  }, [searchQuery, selectedSet, selectedRarity, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  return (
    <div className="cards-page">
      {/* Header */}
      <div className="cards-header">
        <h1 className="cards-title">
          <Layers size={32} />
          Pokemon Card Database
        </h1>
        <p className="cards-subtitle">
          Browse {MOCK_CARDS.length.toLocaleString()}+ cards from all Pokemon TCG sets
        </p>
      </div>

      {/* Set Categories */}
      <div className="set-categories">
        {SET_CATEGORIES.map(category => (
          <button
            key={category.id}
            className={`set-category-chip ${selectedSet === category.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedSet(category.id);
              setCurrentPage(1);
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="cards-filter-bar">
        <div className="cards-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, set, or type..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="cards-filters">
          <select
            className="cards-filter-select"
            value={selectedRarity}
            onChange={(e) => {
              setSelectedRarity(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="holo">Holo Rare</option>
            <option value="ultra">Ultra Rare</option>
            <option value="secret">Secret Rare</option>
          </select>

          <select
            className="cards-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="name">Sort: A-Z</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
            <option value="rarity">Rarity</option>
            <option value="set">Set</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {paginatedCards.length > 0 ? (
        <div className="cards-grid">
          {paginatedCards.map(card => (
            <div key={card.id} className="card-item">
              <div className="card-image-container">
                {/* Placeholder image with gradient */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    color: '#64748b',
                    fontSize: '12px',
                    textAlign: 'center',
                    padding: '20px'
                  }}
                >
                  <Sparkles size={40} style={{ opacity: 0.3 }} />
                </div>
                <span className={`card-rarity-badge ${card.rarity}`}>
                  {card.rarity}
                </span>
              </div>
              <div className="card-info">
                <h3 className="card-name">{card.name}</h3>
                <p className="card-set">{card.set}</p>
                <div className="card-meta">
                  <span className="card-number">{card.number}</span>
                  <span className="card-price">${card.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tag-empty">
          <Search size={64} />
          <h3>No cards found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="cards-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                className={currentPage === pageNum ? 'active' : ''}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && (
            <>
              <span style={{ padding: '10px', color: '#9CA3AF' }}>...</span>
              <button
                className={currentPage === totalPages ? 'active' : ''}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
