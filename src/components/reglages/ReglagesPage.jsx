'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Briefcase, 
  Utensils, 
  Wallet, 
  Lock, 
  Palette, 
  Globe, 
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Sun,
  Moon,
} from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { CategoryCreateForm } from '@/components/forms/CategoryCreateForm';
import api from '@/lib/api';
import { getIconComponent } from '@/lib/icons';

const LANGUAGES = [
  { code: 'fr', name: 'Français', label: 'FR' },
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'sq', name: 'Shqip', label: 'SQ' },
];

export const ReglagesPage = ({ isMobile, locale, isDark, toggleTheme }) => {
  const router = useRouter();
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createCategoryType, setCreateCategoryType] = useState('expense');
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [loading, setLoading] = useState(true);

  const isDesktop = !isMobile;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await api.getCategories();
      const expense = cats.filter(c => c.type === 'expense');
      const income = cats.filter(c => c.type === 'income');
      setCategories({ expense, income });
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleCreateCategory = () => {
    setShowCreateForm(true);
  };

  const handleCategoryCreated = async (newCategory) => {
    setShowCreateForm(false);
    await loadCategories();
  };

  const handleDeleteCategory = async (categoryId, type) => {
    try {
      await api.deleteCategory(categoryId);
      setCategories(prev => ({
        ...prev,
        [type]: prev[type].filter(c => c.id.toString() !== categoryId.toString()),
      }));
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <>
      {/* Main content */}
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--bg)',
        margin: isDesktop ? '0 auto' : '0',
      }}>
        {/* Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'var(--card-bg)',
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--text-primary)',
          }}>
            Réglages
          </span>
        </header>

        {/* Content */}
        <div style={{ padding: isDesktop ? '24px' : '0', paddingBottom: isMobile ? '80px' : '24px' }}>
          
          {/* Section 1: Categories et Comptes */}
          <SettingsSection label="CATÉGORIES ET COMPTES" isDesktop={isDesktop}>
            <div>
              <SettingsRow 
                icon={Briefcase}
                label="Catégories de revenus"
                rightElement={
                  expandedSection === 'income' 
                    ? <ChevronDown size={20} color="var(--text-secondary)" />
                    : <ChevronRight size={20} color="var(--text-secondary)" />
                }
                onClick={() => handleSectionClick('income')}
              />
              {expandedSection === 'income' && (
                <div style={{ padding: '0 16px 8px' }}>
                  {loading ? (
                    <div style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Chargement...
                    </div>
                  ) : categories.income.length === 0 ? (
                    <div style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Aucune catégorie
                    </div>
                  ) : (() => {
                    const systemCats = categories.income.filter(c => c.userId === null);
                    const userCats = categories.income.filter(c => c.userId !== null);
                    return (
                      <>
                        {systemCats.length > 0 && (
                          <>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Catégories du système
                            </div>
                            {systemCats.map(cat => (
                              <div 
                                key={cat.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px',
                                  marginBottom: '4px',
                                  backgroundColor: 'var(--bg)',
                                  borderRadius: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: `${cat.color || '#95A5A6'}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    {(() => {
                                      const Icon = getIconComponent(cat.icon || 'Folder');
                                      return Icon ? <Icon size={18} color={cat.color || '#95A5A6'} /> : null;
                                    })()}
                                  </div>
                                  <span style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                                    {cat.name}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                        {userCats.length > 0 && (
                          <>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Mes catégories
                            </div>
                            {userCats.map(cat => (
                              <div 
                                key={cat.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px',
                                  marginBottom: '4px',
                                  backgroundColor: 'var(--bg)',
                                  borderRadius: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: `${cat.color || '#95A5A6'}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    {(() => {
                                      const Icon = getIconComponent(cat.icon || 'Folder');
                                      return Icon ? <Icon size={18} color={cat.color || '#95A5A6'} /> : null;
                                    })()}
                                  </div>
                                  <span style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                                    {cat.name}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id, 'income')}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Trash2 size={18} color="#FF5A3C" />
                                </button>
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    );
                  })()}
                  <button
                    onClick={() => { setCreateCategoryType('income'); handleCreateCategory(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      width: '100%',
                      backgroundColor: 'var(--bg)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'var(--accent)',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '8px',
                      minHeight: '48px',
                    }}
                  >
                    <Plus size={18} />
                    Ajouter une catégorie
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <SettingsRow 
                icon={Utensils}
                label="Catégories de dépenses"
                rightElement={
                  expandedSection === 'expense' 
                    ? <ChevronDown size={20} color="var(--text-secondary)" />
                    : <ChevronRight size={20} color="var(--text-secondary)" />
                }
                onClick={() => handleSectionClick('expense')}
              />
              {expandedSection === 'expense' && (
                <div style={{ padding: '0 16px 8px' }}>
                  {loading ? (
                    <div style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Chargement...
                    </div>
                  ) : categories.expense.length === 0 ? (
                    <div style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Aucune catégorie
                    </div>
                  ) : (() => {
                    const systemCats = categories.expense.filter(c => c.userId === null);
                    const userCats = categories.expense.filter(c => c.userId !== null);
                    return (
                      <>
                        {systemCats.length > 0 && (
                          <>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Catégories du système
                            </div>
                            {systemCats.map(cat => (
                              <div 
                                key={cat.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px',
                                  marginBottom: '4px',
                                  backgroundColor: 'var(--bg)',
                                  borderRadius: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: `${cat.color || '#95A5A6'}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    {(() => {
                                      const Icon = getIconComponent(cat.icon || 'Folder');
                                      return Icon ? <Icon size={18} color={cat.color || '#95A5A6'} /> : null;
                                    })()}
                                  </div>
                                  <span style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                                    {cat.name}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                        {userCats.length > 0 && (
                          <>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Mes catégories
                            </div>
                            {userCats.map(cat => (
                              <div 
                                key={cat.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px',
                                  marginBottom: '4px',
                                  backgroundColor: 'var(--bg)',
                                  borderRadius: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: `${cat.color || '#95A5A6'}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    {(() => {
                                      const Icon = getIconComponent(cat.icon || 'Folder');
                                      return Icon ? <Icon size={18} color={cat.color || '#95A5A6'} /> : null;
                                    })()}
                                  </div>
                                  <span style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                                    {cat.name}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id, 'expense')}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Trash2 size={18} color="#FF5A3C" />
                                </button>
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    );
                  })()}
                  <button
                    onClick={() => { setCreateCategoryType('expense'); handleCreateCategory(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      width: '100%',
                      backgroundColor: 'var(--bg)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'var(--accent)',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '8px',
                      minHeight: '48px',
                    }}
                  >
                    <Plus size={18} />
                    Ajouter une catégorie
                  </button>
                </div>
              )}
            </div>
            
            <SettingsRow 
              icon={Wallet}
              label="Gestionnaire de comptes"
              subtitle="Types, comptes et configuration"
              rightElement={<ChevronRight size={20} color="var(--text-secondary)" />}
              onClick={() => router.push(`/${locale}/comptes`)}
            />
          </SettingsSection>

          {/* Section 2: Réglages */}
          <SettingsSection label="RÉGLAGES" isDesktop={isDesktop}>
            <SettingsRow 
              icon={Lock}
              label="Mot de passe"
              showBadge
              badgeEnabled={passwordEnabled}
              onClick={() => setPasswordEnabled(!passwordEnabled)}
            />
            
            {/* Apparence - clickable icon to toggle theme */}
            <button 
              onClick={() => toggleTheme && toggleTheme()}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                minHeight: '64px',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Palette size={22} color="var(--text-secondary)" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)' }}>Apparence</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {isDark ? 'Sombre' : 'Clair'}
                  </span>
                </div>
              </div>
              {isDark ? (
                <Moon size={24} color="var(--accent)" />
              ) : (
                <Sun size={24} color="#F59E0B" />
              )}
            </button>
            
            {/* Langue with language buttons */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '16px',
              minHeight: '64px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Globe size={22} color="var(--text-secondary)" />
                <span style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)' }}>Langue</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      if (lang.code !== locale) {
                        toast.info('À venir...');
                      }
                    }}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      backgroundColor: locale === lang.code ? 'var(--accent)' : 'var(--bg)',
                      color: locale === lang.code ? '#FFF' : 'var(--text-primary)',
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </SettingsSection>

        </div>
      </div>

      {/* Modal for creating category */}
      {showCreateForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={() => setShowCreateForm(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: isMobile ? '100%' : '500px',
              maxHeight: isMobile ? '90vh' : '85vh',
              backgroundColor: 'var(--card-bg)',
              borderRadius: isMobile ? '24px 24px 0 0' : '24px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {isMobile && (
              <div style={{ paddingTop: '12px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px' }} />
              </div>
            )}
            <CategoryCreateForm
              onClose={() => setShowCreateForm(false)}
              onBack={() => setShowCreateForm(false)}
              onCreated={handleCategoryCreated}
              initialType={createCategoryType}
              isMobile={isMobile}
            />
          </div>
        </div>
      )}
    </>
  );
};
