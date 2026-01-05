'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Plus,
  Library,
  Dumbbell,
  Apple,
  Pill,
  ClipboardCheck,
  Copy,
  Edit,
  Trash2,
  X,
  Users,
  ChevronRight,
  Star,
  Globe,
  Lock,
  Filter,
  MoreVertical,
} from 'lucide-react';

type TemplateType = 'WORKOUT' | 'NUTRITION' | 'SUPPLEMENT' | 'CHECKIN_PROTOCOL';

interface Template {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Fat Burn Pro',
    description: 'High-intensity 8-week program for maximum fat loss with progressive overload',
    type: 'WORKOUT',
    tags: ['fat loss', 'hiit', 'cardio'],
    isPublic: true,
    usageCount: 156,
    createdAt: '2023-10-15',
  },
  {
    id: '2',
    name: '1600 kcal Cut',
    description: 'Aggressive cutting protocol with high protein for muscle retention',
    type: 'NUTRITION',
    tags: ['cutting', 'high protein', 'low calorie'],
    isPublic: false,
    usageCount: 89,
    createdAt: '2023-11-01',
  },
  {
    id: '3',
    name: 'Hypertrophy Max',
    description: 'Advanced 12-week hypertrophy program with periodization',
    type: 'WORKOUT',
    tags: ['muscle building', 'hypertrophy', 'advanced'],
    isPublic: true,
    usageCount: 234,
    createdAt: '2023-09-20',
  },
  {
    id: '4',
    name: 'Performance Stack',
    description: 'Complete supplement stack for performance and recovery',
    type: 'SUPPLEMENT',
    tags: ['performance', 'recovery', 'stack'],
    isPublic: false,
    usageCount: 45,
    createdAt: '2023-10-10',
  },
  {
    id: '5',
    name: 'Weekly Photo Check-in',
    description: 'Standard bi-weekly check-in protocol with photos and metrics',
    type: 'CHECKIN_PROTOCOL',
    tags: ['check-in', 'photos', 'metrics'],
    isPublic: true,
    usageCount: 312,
    createdAt: '2023-08-15',
  },
  {
    id: '6',
    name: '3200 kcal Bulk',
    description: 'Clean bulk nutrition plan for maximum muscle gain',
    type: 'NUTRITION',
    tags: ['bulking', 'muscle gain', 'clean eating'],
    isPublic: true,
    usageCount: 178,
    createdAt: '2023-09-05',
  },
  {
    id: '7',
    name: 'PPL Split',
    description: 'Push/Pull/Legs split for balanced development',
    type: 'WORKOUT',
    tags: ['ppl', 'intermediate', 'strength'],
    isPublic: true,
    usageCount: 267,
    createdAt: '2023-10-25',
  },
  {
    id: '8',
    name: 'Recovery Protocol',
    description: 'Essential supplements for recovery and sleep optimization',
    type: 'SUPPLEMENT',
    tags: ['recovery', 'sleep', 'essential'],
    isPublic: false,
    usageCount: 67,
    createdAt: '2023-11-10',
  },
];

const getTypeIcon = (type: TemplateType) => {
  switch (type) {
    case 'WORKOUT':
      return Dumbbell;
    case 'NUTRITION':
      return Apple;
    case 'SUPPLEMENT':
      return Pill;
    case 'CHECKIN_PROTOCOL':
      return ClipboardCheck;
  }
};

const getTypeColor = (type: TemplateType) => {
  switch (type) {
    case 'WORKOUT':
      return 'electric';
    case 'NUTRITION':
      return 'lime';
    case 'SUPPLEMENT':
      return 'coral';
    case 'CHECKIN_PROTOCOL':
      return 'brand';
  }
};

const getTypeLabel = (type: TemplateType) => {
  switch (type) {
    case 'WORKOUT':
      return 'Workout';
    case 'NUTRITION':
      return 'Nutrition';
    case 'SUPPLEMENT':
      return 'Supplement';
    case 'CHECKIN_PROTOCOL':
      return 'Check-in';
  }
};

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType | null>(null);
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    type: 'WORKOUT' as TemplateType,
    name: '',
    description: '',
    tags: '',
    isPublic: false,
  });
  const [isCreating, setIsCreating] = useState(false);

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !selectedType || template.type === selectedType;
    const matchesPublic = !showPublicOnly || template.isPublic;
    return matchesSearch && matchesType && matchesPublic;
  });

  const templateCounts = {
    WORKOUT: mockTemplates.filter(t => t.type === 'WORKOUT').length,
    NUTRITION: mockTemplates.filter(t => t.type === 'NUTRITION').length,
    SUPPLEMENT: mockTemplates.filter(t => t.type === 'SUPPLEMENT').length,
    CHECKIN_PROTOCOL: mockTemplates.filter(t => t.type === 'CHECKIN_PROTOCOL').length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-surface-100">Template Library</h1>
            <p className="text-surface-400">Reusable templates for workouts, nutrition, and more</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-72"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Template
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats by Type */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {(['WORKOUT', 'NUTRITION', 'SUPPLEMENT', 'CHECKIN_PROTOCOL'] as TemplateType[]).map((type, index) => {
            const Icon = getTypeIcon(type);
            const color = getTypeColor(type);
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={`glass-card p-4 cursor-pointer transition-all ${
                  selectedType === type ? `border-${color}-500/50` : 'hover:border-surface-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${color}-400`} />
                  </div>
                  <p className="text-sm text-surface-400">{getTypeLabel(type)}</p>
                </div>
                <p className="text-3xl font-bold font-display text-surface-100">{templateCounts[type]}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !selectedType
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
              }`}
            >
              All Templates
            </button>
            {(['WORKOUT', 'NUTRITION', 'SUPPLEMENT', 'CHECKIN_PROTOCOL'] as TemplateType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type === selectedType ? null : type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === type
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                }`}
              >
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-surface-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showPublicOnly}
              onChange={(e) => setShowPublicOnly(e.target.checked)}
              className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
            />
            Public templates only
          </label>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => {
            const Icon = getTypeIcon(template.type);
            const color = getTypeColor(template.type);
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card overflow-hidden group hover:border-brand-500/30 transition-all cursor-pointer"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${color}-400`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-surface-100 group-hover:text-brand-400 transition-colors">
                          {template.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs badge-${color}`}>{getTypeLabel(template.type)}</span>
                          {template.isPublic ? (
                            <Globe className="w-3 h-3 text-surface-500" />
                          ) : (
                            <Lock className="w-3 h-3 text-surface-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-700 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4 text-surface-400" />
                    </button>
                  </div>
                  <p className="text-sm text-surface-400 mb-4 line-clamp-2">{template.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-lg bg-surface-800 text-surface-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-surface-800">
                    <div className="flex items-center gap-4 text-sm text-surface-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {template.usageCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Popular
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        className="p-2 rounded-lg hover:bg-surface-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Copy className="w-4 h-4 text-surface-400" />
                      </button>
                      <button 
                        className="p-2 rounded-lg hover:bg-surface-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="w-4 h-4 text-surface-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Create New Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: filteredTemplates.length * 0.05 }}
            onClick={() => setShowCreateModal(true)}
            className="glass-card p-8 flex flex-col items-center justify-center min-h-[280px] border-2 border-dashed border-surface-700 hover:border-brand-500/50 cursor-pointer group transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-surface-800 group-hover:bg-brand-500/20 flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-8 h-8 text-surface-500 group-hover:text-brand-400 transition-colors" />
            </div>
            <p className="text-lg font-medium text-surface-400 group-hover:text-surface-100 transition-colors">
              Create New Template
            </p>
            <p className="text-sm text-surface-500">Save time with reusable templates</p>
          </motion.div>
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <Library className="w-16 h-16 text-surface-700 mx-auto mb-4" />
            <p className="text-surface-400 text-lg">No templates found</p>
            <p className="text-surface-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-auto md:w-full md:max-w-lg bg-surface-900 rounded-2xl border border-surface-800 z-50 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-800 flex-shrink-0">
                <h2 className="text-xl font-display font-bold text-surface-100">Create Template</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="label">Template Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['WORKOUT', 'NUTRITION', 'SUPPLEMENT', 'CHECKIN_PROTOCOL'] as TemplateType[]).map((type) => {
                      const Icon = getTypeIcon(type);
                      const color = getTypeColor(type);
                      const isSelected = newTemplate.type === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setNewTemplate({ ...newTemplate, type })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
                            isSelected
                              ? `bg-${color}-500/20 border border-${color}-500/50`
                              : 'bg-surface-800 hover:bg-surface-700'
                          }`}
                        >
                          <Icon className={`w-6 h-6 ${isSelected ? `text-${color}-400` : 'text-surface-400'}`} />
                          <span className={`text-xs ${isSelected ? `text-${color}-400` : 'text-surface-400'}`}>
                            {getTypeLabel(type)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="label">Template Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Beginner Strength Program"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    placeholder="Describe what this template is for..."
                    rows={3}
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    className="input-field resize-none"
                  />
                </div>
                <div>
                  <label className="label">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., beginner, strength, full body"
                    value={newTemplate.tags}
                    onChange={(e) => setNewTemplate({ ...newTemplate, tags: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newTemplate.isPublic}
                    onChange={(e) => setNewTemplate({ ...newTemplate, isPublic: e.target.checked })}
                    className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                  />
                  <label htmlFor="isPublic" className="text-sm text-surface-300">
                    Make this template public (visible to other coaches)
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-800 flex-shrink-0">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (!newTemplate.name.trim()) return;
                    setIsCreating(true);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Navigate to appropriate builder based on type with template data
                    const builderRoutes: Record<TemplateType, string> = {
                      WORKOUT: '/workouts/builder',
                      NUTRITION: '/nutrition/builder',
                      SUPPLEMENT: '/nutrition', // No dedicated supplement builder
                      CHECKIN_PROTOCOL: '/check-ins', // No dedicated check-in protocol builder
                    };
                    
                    const baseUrl = builderRoutes[newTemplate.type];
                    const params = new URLSearchParams({
                      templateName: newTemplate.name,
                      templateDescription: newTemplate.description,
                      isTemplate: 'true',
                    });
                    
                    setIsCreating(false);
                    setShowCreateModal(false);
                    setNewTemplate({
                      type: 'WORKOUT',
                      name: '',
                      description: '',
                      tags: '',
                      isPublic: false,
                    });
                    
                    // Navigate to builder with params
                    router.push(`${baseUrl}?${params.toString()}`);
                  }}
                  disabled={!newTemplate.name.trim() || isCreating}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

