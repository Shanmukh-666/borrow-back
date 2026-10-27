import React, { useState } from 'react';
import {
  Item,
  ItemCategory,
  ItemCondition,
  ITEM_CATEGORIES,
  ITEM_CONDITIONS,
} from '../../types/Item';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import { ConditionBadge } from '../common/Badge';

export interface ItemFormValues {
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  pickupNote: string;
  imageUrl?: string;
  status?: 'active' | 'archived';
}

export interface ItemFormProps {
  initialValues?: Partial<Item>;
  onSubmit: (values: ItemFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  isEdit?: boolean;
}

const PRESET_PHOTOS = [
  { label: '🔧 Power Tool', url: '/images/items/cordless-drill.jpg' },
  { label: '📷 Camera / Tech', url: '/images/items/mirrorless-camera.jpg' },
  { label: '📚 Study Books', url: '/images/items/engineering-maths.jpg' },
  { label: '🏕️ Camping Tent', url: '/images/items/camping-tent.jpg' },
  { label: '🍳 Kitchen Grinder', url: '/images/items/mixer-grinder.jpg' },
  { label: '📽️ HD Projector', url: '/images/items/projector.jpg' },
  { label: '🚲 Mountain Bike', url: '/images/items/mountain-bike.jpg' },
  { label: '🎲 Carrom / Games', url: '/images/items/carrom-board.jpg' },
  { label: '📱 Gimbal / Video', url: '/images/items/gimbal.jpg' },
  { label: '🔢 Scientific Calc', url: '/images/items/calculator.jpg' },
];

export const ItemForm: React.FC<ItemFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Publish listing',
  isEdit = false,
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState<ItemCategory>(
    initialValues?.category || 'Tools & DIY'
  );
  const [condition, setCondition] = useState<ItemCondition>(
    initialValues?.condition || 'Good'
  );
  const [pickupNote, setPickupNote] = useState(initialValues?.pickupNote || '');
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || '');
  const [imageError, setImageError] = useState(false);
  const [status, setStatus] = useState<'active' | 'archived'>(
    initialValues?.status || 'active'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Title is required';
    } else if (trimmedTitle.length < 3 || trimmedTitle.length > 80) {
      newErrors.title = 'Title must be between 3 and 80 characters';
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      newErrors.description = 'Description is required';
    } else if (trimmedDesc.length < 20 || trimmedDesc.length > 1000) {
      newErrors.description = 'Description must be between 20 and 1000 characters';
    }

    if (pickupNote.trim().length > 100) {
      newErrors.pickupNote = 'Pickup note cannot exceed 100 characters';
    }

    if (imageUrl.trim().length > 500) {
      newErrors.imageUrl = 'Image URL cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        pickupNote: pickupNote.trim(),
        imageUrl: imageUrl.trim() || undefined,
        ...(isEdit ? { status } : {}),
      });
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        const backendErrors: Record<string, string> = {};
        err.details.forEach((d: any) => {
          backendErrors[d.field] = d.message;
        });
        setErrors(backendErrors);
      }
      setFormError(err.message || 'Failed to save listing. Please check the inputs.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-6 sm:p-8 rounded-2xl border border-appBorder shadow-sm">
      {formError && (
        <Toast type="error" message={formError} onDismiss={() => setFormError(null)} />
      )}

      {/* Item Title */}
      <div>
        <Input
          label="Item title"
          required
          placeholder="e.g. Bosch cordless hammer drill, Sony mirrorless camera, or Casio calculator"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors({ ...errors, title: '' });
          }}
          error={errors.title}
          helperText="3 to 80 characters. Be concise and specific about the exact item."
          maxLength={80}
        />
      </div>

      {/* Category & Condition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Select
          label="Category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value as ItemCategory)}
          options={ITEM_CATEGORIES as unknown as string[]}
          helperText="Select the category that best matches your item."
        />

        <div>
          <Select
            label="Condition"
            required
            value={condition}
            onChange={(e) => setCondition(e.target.value as ItemCondition)}
            options={ITEM_CONDITIONS as unknown as string[]}
            helperText="Accurately represent physical state."
          />
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-textMuted">Preview badge:</span>
            <ConditionBadge condition={condition} size="sm" />
          </div>
        </div>
      </div>

      {/* Item Image Section */}
      <div className="p-4 sm:p-5 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="imageUrl" className="block text-sm font-semibold text-textPrimary">
              Item photo / Image URL
              <span className="ml-1 text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </label>
            {imageUrl && (
              <button
                type="button"
                onClick={() => {
                  setImageUrl('');
                  setImageError(false);
                }}
                className="text-xs text-appDanger hover:underline font-medium"
              >
                Clear photo
              </button>
            )}
          </div>
          <p className="text-xs text-textMuted mt-1">
            Provide a direct image URL (Unsplash, Imgur, or cloud storage) to display the real item to borrowers.
          </p>
        </div>

        <Input
          id="imageUrl"
          placeholder="https://images.unsplash.com/photo-..."
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            setImageError(false);
            if (errors.imageUrl) setErrors({ ...errors, imageUrl: '' });
          }}
          error={errors.imageUrl}
          maxLength={500}
        />

        {/* Quick presets */}
        <div>
          <span className="text-xs font-medium text-textMuted block mb-2">
            Quick selection from community presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_PHOTOS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setImageUrl(preset.url);
                  setImageError(false);
                }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  imageUrl === preset.url
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-medium'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Image Preview */}
        {imageUrl.trim() && (
          <div className="mt-3">
            <span className="text-xs font-medium text-textMuted block mb-1.5">Live image preview:</span>
            <div className="relative aspect-video max-h-56 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
              {imageError ? (
                <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center text-textMuted">
                  <svg className="w-8 h-8 text-amber-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs font-medium text-slate-700">Unable to load image from this URL</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Please check the link or choose one of the presets above.</p>
                </div>
              ) : (
                <img
                  src={imageUrl.trim()}
                  alt="Item listing preview"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-textPrimary mb-1.5">
          Description
          <span className="text-appDanger ml-1">*</span>
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors({ ...errors, description: '' });
          }}
          placeholder="Describe physical condition, included accessories or cords, safety usage tips, and any helpful notes for borrowers..."
          className={`w-full px-3.5 py-2.5 rounded-field border bg-surface text-textPrimary placeholder:text-textMuted text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand ${
            errors.description ? 'border-appDanger focus:ring-appDanger' : 'border-appBorder hover:border-slate-300'
          }`}
          maxLength={1000}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.description ? (
            <p className="text-xs text-appDanger">{errors.description}</p>
          ) : (
            <p className="text-xs text-textMuted">Minimum 20 characters.</p>
          )}
          <span className="text-xs text-textMuted">{description.length}/1000</span>
        </div>
      </div>

      {/* Pickup area note */}
      <div>
        <Input
          label="Pickup area / Meeting spot"
          placeholder="e.g. Near University Library, Community Center, or Main Campus Gate"
          value={pickupNote}
          onChange={(e) => {
            setPickupNote(e.target.value);
            if (errors.pickupNote) setErrors({ ...errors, pickupNote: '' });
          }}
          error={errors.pickupNote}
          helperText="Suggest a safe, public neighborhood meeting spot or campus landmark (max 100 characters)."
          maxLength={100}
        />
      </div>

      {/* Status (Edit only) */}
      {isEdit && (
        <div className="pt-2 border-t border-appBorder">
          <Select
            label="Listing status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'archived')}
            options={[
              { value: 'active', label: 'Active - Visible in browse and open for requests' },
              { value: 'archived', label: 'Archived - Hidden from public browse' },
            ]}
            helperText="Archived items remain in your dashboard history."
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 border-t border-appBorder flex items-center justify-end gap-3">
        <Button type="submit" variant="primary" loading={isSubmitting} size="md">
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};
