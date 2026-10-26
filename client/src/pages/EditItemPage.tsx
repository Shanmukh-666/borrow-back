import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemService } from '../services/itemService';
import { Item } from '../types/Item';
import { ItemForm, ItemFormValues } from '../components/items/ItemForm';
import { Skeleton } from '../components/common/Skeleton';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export const EditItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    itemService
      .getItemById(id)
      .then((data) => {
        // Verify ownership
        const ownerId = data.owner.id || (data.owner as any)._id;
        if (user && ownerId !== user.id) {
          setError('You do not have permission to edit this listing.');
        } else {
          setItem(data);
        }
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load item for editing');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, user]);

  const handleUpdate = async (values: ItemFormValues) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await itemService.updateItem(id, values);
      navigate(`/items/${id}`, {
        state: { message: 'Your listing has been updated successfully.' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <Toast type="error" message={error || 'Item not found'} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
          Edit listing
        </h1>
        <p className="text-sm text-textMuted mt-1">
          Update item details, condition, guidance, or listing status.
        </p>
      </div>

      <ItemForm
        initialValues={item}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
        submitButtonText="Save changes"
        isEdit={true}
      />
    </div>
  );
};
