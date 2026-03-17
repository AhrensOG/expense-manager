'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { getIconComponent, availableIcons } from '@/lib/icons';
import { DeleteConfirmation } from './DeleteConfirmation';
import api from '@/lib/api';

export const AddTransactionSheet = ({ 
  isOpen, 
  onClose, 
  isMobile, 
  isEditMode = false, 
  existingTransaction = null,
  onDelete = null,
  onSubmit
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  isMobile: boolean; 
  isEditMode?: boolean; 
  existingTransaction?: any;
  onDelete?: ((id: number, type?: string) => void) | null;
  onSubmit?: (data: any) => Promise<any>;
}) => {
  if (!isOpen) return null;

  return (
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
      onClick={onClose}
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
        <TransactionFormWrapper 
          onClose={onClose} 
          isMobile={isMobile}
          isEditMode={isEditMode}
          existingTransaction={existingTransaction}
          onDelete={onDelete}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};

interface FormData {
  type: 'expense' | 'income' | 'transfer';
  amount: string;
  date: string;
  category: string;
  method: string;
  fromMethod: string;
  toMethod: string;
  note: string;
}

const TransactionFormWrapper = ({ 
  onClose, 
  isMobile, 
  isEditMode, 
  existingTransaction, 
  onDelete, 
  onSubmit 
}: { 
  onClose: () => void; 
  isMobile: boolean; 
  isEditMode?: boolean; 
  existingTransaction?: any;
  onDelete?: ((id: number, type?: string) => void) | null;
  onSubmit?: (data: any) => Promise<any>;
}) => {
  const [view, setView] = useState<string>('form');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // Category creation state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'expense' | 'income'>('expense');
  const [newCategoryIcon, setNewCategoryIcon] = useState('folder');
  const [newCategoryColor, setNewCategoryColor] = useState('#95A5A6');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accs = await api.getAccounts();
        setAccounts(accs);
        
        // Set default account after fetching
        if (accs.length > 0 && !isEditMode) {
          setFormData(prev => ({
            ...prev,
            method: accs[0].id.toString(),
          }));
        }
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };
    fetchAccounts();
  }, [isEditMode]);
  
  const paymentMethods: { id: string; label: string; balance?: number }[] = accounts.map(acc => ({
    id: acc.id.toString(),
    label: acc.name,
    balance: acc.balance,
  }));
  
  const getAccountBalance = (accountId: string) => {
    const acc = paymentMethods.find(m => m.id === accountId);
    if (acc && acc.balance !== undefined) {
      return parseFloat(String(acc.balance)).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' CHF';
    }
    return '';
  };
  
  if (paymentMethods.length === 0) {
    paymentMethods.push({ id: '1', label: 'Banque', balance: 0 });
  }
  
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await api.getCategories();
        const transformed = cats.map((c: any) => ({
          id: c.id.toString(),
          name: c.name,
          type: c.type,
          iconName: c.icon || 'Folder',
          label: c.name,
          userId: c.userId, // Track if it's a user-created category
        }));
        setCategories(transformed);
        
        // Set default category based on transaction type - use functional update
        if (!isEditMode && transformed.length > 0) {
          setFormData((prev) => {
            const typeFilter = prev.type === 'income' ? 'income' : 'expense';
            const filtered = transformed.filter((c: any) => c.type === typeFilter || c.type === 'both');
            if (filtered.length > 0 && prev.category === '1') { // Only set default if still at initial value
              return { ...prev, category: filtered[0].id };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [isEditMode]);
  
  const getCategoryIcon = (iconName: string) => getIconComponent(iconName);
  
  const getInitialFormData = (): FormData => {
    if (isEditMode && existingTransaction) {
      return {
        type: existingTransaction.type || 'expense',
        amount: Math.abs(existingTransaction.amount).toString(),
        date: existingTransaction.date?.split('T')[0] || '',
        category: existingTransaction.categoryId?.toString() || '1',
        method: existingTransaction.accountId?.toString() || '1',
        fromMethod: existingTransaction.fromMethod || '1',
        toMethod: existingTransaction.toMethod || '2',
        note: existingTransaction.description || '',
      };
    }
    return {
      type: 'expense',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '1',
      method: '1',
      fromMethod: '1',
      toMethod: '2',
      note: '',
    };
  };

  const [formData, setFormData] = useState<FormData>(getInitialFormData);

  const updateField = (field: string, value: string) => {
    setFormData((prev: FormData) => {
      const updated = { ...prev, [field]: value };
      
      // When type changes, update category to a valid one for that type
      if (field === 'type' && categories.length > 0) {
        const typeFilter = value === 'income' ? 'income' : 'expense';
        const validCats = categories.filter((c: any) => c.type === typeFilter || c.type === 'both');
        if (validCats.length > 0 && !validCats.some((c: any) => c.id === prev.category)) {
          updated.category = validCats[0].id;
        }
      }
      
      return updated;
    });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete && existingTransaction) {
      onDelete(existingTransaction.id, existingTransaction.type);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.amount) return;

    // Validate transfer balance
    if (formData.type === 'transfer') {
      const amount = Math.abs(parseFloat(formData.amount));
      const fromAccount = accounts.find(a => a.id === parseInt(formData.fromMethod));
      if (!fromAccount) {
        toast('Erreur: compte non trouvé', { duration: 3000 });
        return;
      }
      if (parseFloat(fromAccount.balance) < amount) {
        const available = parseFloat(fromAccount.balance).toLocaleString('de-DE', { minimumFractionDigits: 2 });
        toast(`Solde insuffisant! Disponible: ${available} CHF`, { duration: 4000 });
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      if (formData.type === 'transfer' && onSubmit) {
        await onSubmit({
          type: 'transfer',
          amount: Math.abs(parseFloat(formData.amount)),
          date: formData.date,
          fromAccountId: parseInt(formData.fromMethod),
          toAccountId: parseInt(formData.toMethod),
          description: formData.note,
        });
      } else if (onSubmit) {
        await onSubmit({
          type: formData.type,
          amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
          date: formData.date,
          categoryId: parseInt(formData.category),
          accountId: parseInt(formData.method),
          description: formData.note,
        });
      }
      onClose();
    } catch (err) {
      console.error('Error submitting transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsCreatingCategory(true);
    try {
      const created = await api.createCategory({
        name: newCategoryName.trim(),
        type: newCategoryType,
        icon: newCategoryIcon,
        color: newCategoryColor,
      });
      
      // Add to categories list
      const newCat = {
        id: created.id.toString(),
        name: created.name,
        type: created.type,
        iconName: created.icon || 'Folder',
        label: created.name,
      };
      setCategories(prev => [...prev, newCat]);
      
      // Select the new category
      updateField('category', newCat.id);
      setView('form');
      
      // Reset form
      setNewCategoryName('');
      setNewCategoryType('expense');
      setNewCategoryIcon('folder');
      setNewCategoryColor('#95A5A6');
    } catch (err) {
      console.error('Error creating category:', err);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const colorOptions = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#2ECC71', '#27AE60', '#16A085', '#E74C3C',
    '#3498DB', '#9B59B6', '#F39C12', '#1ABC9C', '#95A5A6',
  ];

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    toast(`Supprimer "${categoryName}"?`, {
      action: {
        label: 'Supprimer',
        onClick: async () => {
          try {
            await api.deleteCategory(parseInt(categoryId));
            setCategories(prev => prev.filter((c: any) => c.id !== categoryId));
            // If deleted category was selected, reset to first available
            if (formData.category === categoryId) {
              const remaining = categories.filter((c: any) => c.id !== categoryId);
              if (remaining.length > 0) {
                updateField('category', remaining[0].id);
              }
            }
            toast('Catégorie supprimée', { duration: 2000 });
          } catch (err) {
            console.error('Error deleting category:', err);
            toast('Erreur lors de la suppression', { duration: 3000 });
          }
        },
      },
      cancel: {
        label: 'Annuler',
        onClick: () => {},
      },
    });
  };

  if (view === 'category') {
    if (categoriesLoading) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Chargement...
        </div>
      );
    }
    const expenseCats = categories.filter((c: any) => c.type === 'expense' || c.type === 'both');
    const incomeCats = categories.filter((c: any) => c.type === 'income' || c.type === 'both');
    const allCats = formData.type === 'income' ? incomeCats : expenseCats;
    
    // Separate global (userId: null) from user categories
    const globalCats = allCats.filter((c: any) => c.userId === null);
    const userCats = allCats.filter((c: any) => c.userId !== null);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <button
            onClick={() => setView('form')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              color: 'var(--accent)',
              minHeight: '48px',
              padding: '8px 0',
            }}
          >
            ← Retour
          </button>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {/* Global categories */}
          {globalCats.length > 0 && (
            <>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Catégories disponibles
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', alignContent: 'start', marginBottom: '20px' }}>
                {globalCats.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      updateField('category', cat.id);
                      setView('form');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '16px 8px',
                      borderRadius: '16px',
                      backgroundColor: formData.category === cat.id ? 'var(--accent)' : 'var(--bg)',
                      minHeight: '90px',
                    }}
                  >
                    {React.createElement(getCategoryIcon(cat.iconName), { size: 28, color: formData.category === cat.id ? '#FFF' : 'var(--text-primary)' })}
                    <span style={{ fontSize: '12px', fontWeight: '500', color: formData.category === cat.id ? '#FFF' : 'var(--text-primary)', textAlign: 'center' }}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          
          {/* User categories */}
          {userCats.length > 0 && (
            <>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Mes catégories
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', alignContent: 'start', marginBottom: '20px' }}>
                {userCats.map((cat: any) => (
                  <div key={cat.id} style={{ position: 'relative' }}>
                    <button
                      onClick={() => {
                        updateField('category', cat.id);
                        setView('form');
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '16px 8px',
                        borderRadius: '16px',
                        backgroundColor: formData.category === cat.id ? 'var(--accent)' : 'var(--bg)',
                        minHeight: '90px',
                        width: '100%',
                      }}
                    >
                      {React.createElement(getCategoryIcon(cat.iconName), { size: 28, color: formData.category === cat.id ? '#FFF' : 'var(--text-primary)' })}
                      <span style={{ fontSize: '12px', fontWeight: '500', color: formData.category === cat.id ? '#FFF' : 'var(--text-primary)', textAlign: 'center' }}>
                        {cat.label}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id, cat.label);
                      }}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#EF4444',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <span style={{ color: '#FFF', fontSize: '14px', lineHeight: 1 }}>×</span>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Add Category Button */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => {
              setNewCategoryType(formData.type === 'income' ? 'income' : 'expense');
              setView('createCategory');
            }}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px dashed var(--accent)',
              borderRadius: '16px',
              color: 'var(--accent)',
              fontSize: '15px',
              fontWeight: '600',
              backgroundColor: 'transparent',
              minHeight: '56px',
            }}
          >
            + Ajouter une catégorie
          </button>
        </div>
      </div>
    );
  }

  if (view === 'account') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <button
            onClick={() => setView('form')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              color: 'var(--accent)',
              minHeight: '48px',
              padding: '8px 0',
            }}
          >
            ← Retour
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {paymentMethods.map((acc: any) => (
            <button
              key={acc.id}
              onClick={() => {
                updateField('method', acc.id);
                setView('form');
              }}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: formData.method === acc.id ? 'var(--accent)' : 'var(--bg)',
                color: formData.method === acc.id ? '#FFF' : 'var(--text-primary)',
                textAlign: 'left',
                fontSize: '16px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{acc.label}</span>
              {/* <span style={{ opacity: 0.7 }}>{getAccountBalance(acc.id)}</span> */}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'createCategory') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <button
            onClick={() => setView('category')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              color: 'var(--accent)',
              minHeight: '48px',
              padding: '8px 0',
            }}
          >
            ← Retour
          </button>
          <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Nouvelle catégorie
          </span>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {/* Type selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Type
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setNewCategoryType('expense')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  backgroundColor: newCategoryType === 'expense' ? 'var(--accent)' : 'var(--bg)',
                  color: newCategoryType === 'expense' ? '#FFF' : 'var(--text-primary)',
                  minHeight: '48px',
                }}
              >
                Dépense
              </button>
              <button
                onClick={() => setNewCategoryType('income')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  backgroundColor: newCategoryType === 'income' ? 'var(--income)' : 'var(--bg)',
                  color: newCategoryType === 'income' ? '#FFF' : 'var(--text-primary)',
                  minHeight: '48px',
                }}
              >
                Revenu
              </button>
            </div>
          </div>
          
          {/* Name input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Nom de la catégorie
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Ex: Courses, Loyer..."
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                backgroundColor: 'var(--bg)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          
          {/* Icon selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Icône
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {availableIcons.slice(0, 30).map(icon => {
                const IconComp = getIconComponent(icon.name);
                const isSelected = newCategoryIcon === icon.name;
                return (
                  <button
                    key={icon.name}
                    onClick={() => setNewCategoryIcon(icon.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg)',
                      minHeight: '48px',
                    }}
                  >
                    <IconComp size={24} color={isSelected ? '#FFF' : 'var(--text-primary)'} />
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Color selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Couleur
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {colorOptions.map(color => {
                const isSelected = newCategoryColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setNewCategoryColor(color)}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '12px',
                      backgroundColor: color,
                      border: isSelected ? '3px solid var(--text-primary)' : '3px solid transparent',
                      minHeight: '48px',
                    }}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Preview */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '16px',
            backgroundColor: 'var(--bg)',
            borderRadius: '16px',
            marginBottom: '20px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: `${newCategoryColor}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {React.createElement(getIconComponent(newCategoryIcon), { size: 24, color: newCategoryColor })}
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {newCategoryName || 'Nom de la catégorie'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {newCategoryType === 'expense' ? 'Dépense' : 'Revenu'}
              </div>
            </div>
          </div>
          
          {/* Create button */}
          <button
            onClick={handleCreateCategory}
            disabled={!newCategoryName.trim() || isCreatingCategory}
            style={{
              width: '100%',
              padding: '18px',
              backgroundColor: 'var(--accent)',
              color: '#FFF',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '600',
              minHeight: '56px',
              opacity: (!newCategoryName.trim() || isCreatingCategory) ? 0.6 : 1,
            }}
          >
            {isCreatingCategory ? 'Création...' : 'Créer la catégorie'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', overflow: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
          {isEditMode ? 'Modifier la transaction' : (formData.type === 'transfer' ? 'Nouveau transfert' : 'Nouvelle dépense')}
        </h2>
        <button onClick={onClose} style={{ minWidth: '44px', minHeight: '44px', fontSize: '18px' }}>✕</button>
      </div>

      <TransactionFormContent
        formData={formData}
        updateField={updateField}
        onSelectCategory={() => setView('category')}
        onSelectAccount={() => setView('account')}
        isEditMode={isEditMode}
        onClose={onClose}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        paymentMethods={paymentMethods}
        categories={categories}
        getAccountBalance={getAccountBalance}
      />

      {/* Edit mode buttons */}
      {isEditMode && !showDeleteConfirm && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'var(--accent)',
              color: '#FFF',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <button
            onClick={handleDelete}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'transparent',
              border: '1px solid #EF4444',
              borderRadius: '12px',
              color: '#EF4444',
              fontSize: '15px',
              fontWeight: '500',
            }}
          >
            Supprimer cette transaction
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <DeleteConfirmation
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

// Separate content component to avoid duplication
const TransactionFormContent = ({ 
  formData, 
  updateField, 
  onSelectCategory, 
  onSelectAccount,
  isEditMode, 
  onClose, 
  onSubmit, 
  isSubmitting,
  paymentMethods,
  categories,
  getAccountBalance,
}: { 
  formData: FormData; 
  updateField: (field: string, value: string) => void; 
  onSelectCategory: () => void; 
  onSelectAccount: () => void; 
  isEditMode?: boolean; 
  onClose: () => void; 
  onSubmit?: () => void; 
  isSubmitting?: boolean;
  paymentMethods: { id: string; label: string; balance?: number }[];
  categories?: any[];
  getAccountBalance: (accountId: string) => string;
}) => {
  const expenseCats = categories?.filter((c: any) => c.type === 'expense' || c.type === 'both') || [];
  const incomeCats = categories?.filter((c: any) => c.type === 'income' || c.type === 'both') || [];
  const cats = formData.type === 'income' ? incomeCats : expenseCats;
  const selectedCategory = cats.find((c: any) => c.id === formData.category);
  const selectedMethod = paymentMethods.find(m => m.id === formData.method);
  
  const renderIcon = (iconName: string) => {
    const IconComp = getIconComponent(iconName);
    return React.createElement(IconComp, { size: 20 });
  };

  const TABS = [
    { id: 'expense', label: 'Dépense', color: 'var(--accent)' },
    { id: 'income', label: 'Revenu', color: 'var(--income)' },
    { id: 'transfer', label: 'Transfert', color: 'var(--text-secondary)' },
  ];

  return (
    <>
      {/* Tabs - only show if not in edit mode */}
      {!isEditMode && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'var(--bg)', borderRadius: '16px', padding: '4px' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => updateField('type', tab.id)}
              style={{
                flex: 1,
                padding: '14px 8px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                backgroundColor: formData.type === tab.id ? tab.color : 'transparent',
                color: formData.type === tab.id ? '#FFF' : 'var(--text-secondary)',
                minHeight: '48px',
              }}
            >
              {tab.id === 'transfer' ? <ArrowRightLeft size={16} style={{ marginRight: '4px', display: 'inline' }} /> : null}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Amount */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          inputMode="decimal"
          value={formData.amount}
          onChange={e => updateField('amount', e.target.value)}
          placeholder="0,00"
          style={{
            width: '100%',
            padding: '20px',
            fontSize: '32px',
            fontWeight: '700',
            textAlign: 'center',
            backgroundColor: 'var(--bg)',
            borderRadius: '16px',
            color: 'var(--text-primary)',
            borderBottom: '3px solid var(--accent)',
          }}
        />
        <div style={{ textAlign: 'center', marginTop: '8px', color: 'var(--text-secondary)' }}>CHF</div>
      </div>

      {/* Date */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={e => updateField('date', e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: '15px',
            backgroundColor: 'var(--bg)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Transfer fields */}
      {formData.type === 'transfer' ? (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>De</label>
            <button style={{ width: '100%', padding: '14px', backgroundColor: 'var(--bg)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
              <span>{paymentMethods.find(m => m.id === formData.fromMethod)?.label}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{getAccountBalance(formData.fromMethod)}</span>
            </button>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Vers</label>
            <button style={{ width: '100%', padding: '14px', backgroundColor: 'var(--bg)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
              <span>{paymentMethods.find(m => m.id === formData.toMethod)?.label}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{getAccountBalance(formData.toMethod)}</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Catégorie</label>
            <button onClick={onSelectCategory} style={{ width: '100%', padding: '14px', backgroundColor: 'var(--bg)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedCategory?.iconName && renderIcon(selectedCategory.iconName)}
                {selectedCategory?.label}
              </span>
              <ChevronDown size={18} />
            </button>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Compte</label>
            <button onClick={onSelectAccount} style={{ width: '100%', padding: '14px', backgroundColor: 'var(--bg)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
              <span>{selectedMethod?.label}</span>
              <ChevronDown size={18} />
            </button>
          </div>
        </>
      )}

      {/* Note */}
      <div style={{ marginBottom: isEditMode ? '0' : '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Note (optionnel)</label>
        <input
          type="text"
          value={formData.note}
          onChange={e => updateField('note', e.target.value)}
          placeholder="Ajouter une note..."
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: '15px',
            backgroundColor: 'var(--bg)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Submit - only show if not in edit mode */}
      {!isEditMode && (
        <button
          onClick={onSubmit}
          disabled={!formData.amount || isSubmitting}
          style={{
            width: '100%',
            padding: '18px',
            backgroundColor: 'var(--accent)',
            color: '#FFF',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '600',
            minHeight: '56px',
            opacity: (!formData.amount || isSubmitting) ? 0.6 : 1,
          }}
        >
          {isSubmitting ? 'Enregistrement...' : (formData.type === 'transfer' ? 'Enregistrer le transfert' : 'Enregistrer')}
        </button>
      )}
    </>
  );
};
