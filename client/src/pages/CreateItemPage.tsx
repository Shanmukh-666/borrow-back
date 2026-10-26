import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../services/itemService';
import { ItemForm, ItemFormValues } from '../components/items/ItemForm';

export const CreateItemPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (values: ItemFormValues) => {
    setIsSubmitting(true);
    try {
      const createdItem = await itemService.createItem(values);
      navigate(`/items/${createdItem.id}`, {
        state: { message: 'Your listing has been created and is now active for borrowing requests!' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
          List an item
        </h1>
        <p className="text-sm text-textMuted mt-1">
          Share an item with your community. Active listings accept requests for future dates.
        </p>
      </div>

      <ItemForm
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        submitButtonText="Publish listing"
      />
    </div>
  );
};
