'use client';

import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';

export default function AdminCategories() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['general', 'market']);

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="admin-categories">
      {/* Header Actions */}
      <div className="admin-toolbar">
        <p className="admin-toolbar-info">
          Drag categories to reorder. Click to expand/collapse subcategories.
        </p>
        <button className="admin-btn primary">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="admin-categories-list">
        {CATEGORIES.map((category, index) => (
          <div key={category.id} className="admin-category-item">
            <div className="admin-category-main">
              <div className="admin-category-drag">
                <GripVertical className="w-5 h-5" />
              </div>

              <button
                className="admin-category-expand"
                onClick={() => toggleExpand(category.id)}
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>

              <div
                className="admin-category-color"
                style={{ backgroundColor: category.color }}
              />

              <div className="admin-category-info">
                <h3 className="admin-category-name">{category.name}</h3>
                <p className="admin-category-desc">{category.description}</p>
                <div className="admin-category-stats">
                  <span><FileText className="w-4 h-4" /> {category.threadCount?.toLocaleString() || 0} threads</span>
                  <span><MessageSquare className="w-4 h-4" /> {category.postCount?.toLocaleString() || 0} posts</span>
                </div>
              </div>

              <div className="admin-category-actions">
                <span className="admin-category-order">Order: {index + 1}</span>
                <button className="admin-action-icon" title="View">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="admin-action-icon" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="admin-action-icon danger" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subcategories */}
            {expandedCategories.includes(category.id) && category.subcategories && (
              <div className="admin-subcategories">
                {category.subcategories.map((sub) => (
                  <div key={sub.id} className="admin-subcategory-item">
                    <div className="admin-subcategory-drag">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="admin-subcategory-info">
                      <span className="admin-subcategory-name">{sub.name}</span>
                      {sub.description && (
                        <span className="admin-subcategory-desc">{sub.description}</span>
                      )}
                    </div>
                    <div className="admin-subcategory-actions">
                      <button className="admin-action-icon-sm" title="Edit">
                        <Edit className="w-3 h-3" />
                      </button>
                      <button className="admin-action-icon-sm danger" title="Delete">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <button className="admin-add-subcategory">
                  <Plus className="w-4 h-4" />
                  Add Subcategory
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Category Settings */}
      <div className="admin-card mt-6">
        <div className="admin-card-header">
          <h2>Category Settings</h2>
        </div>
        <div className="admin-settings-form">
          <div className="admin-setting-item">
            <label>Default Category for New Threads</label>
            <select defaultValue="general">
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="admin-setting-item">
            <label>Allow Users to Create Categories</label>
            <input type="checkbox" />
          </div>
          <div className="admin-setting-item">
            <label>Show Empty Categories</label>
            <input type="checkbox" defaultChecked />
          </div>
          <button className="admin-btn primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
}
