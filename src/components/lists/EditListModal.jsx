import { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal, Button, Input } from '../ui';

export default function EditListModal({ 
  isOpen, 
  onClose, 
  list,
  onRenameList, 
  onDeleteList 
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef(null);

  // Initialize name when modal opens or list changes
  useEffect(() => {
    if (isOpen && list) {
      setName(list.name);
      setError(null);
      setShowDeleteConfirm(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, list]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const trimmedName = name.trim();
    
    // Validation
    if (!trimmedName) {
      setError('Please enter a list name');
      return;
    }

    if (trimmedName.length > 50) {
      setError('List name must be 50 characters or less');
      return;
    }

    // If name hasn't changed, just close
    if (trimmedName === list.name) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onRenameList(list.id, trimmedName);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to rename list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      await onDeleteList(list.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete list');
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  if (!list) return null;

  // Delete confirmation view
  if (showDeleteConfirm) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Delete List" size="sm">
        <div className="space-y-4">
          <p className="font-sans text-ink-600">
            Are you sure you want to delete <strong>"{list.name}"</strong>?
          </p>
          <p className="font-sans text-sm text-ink-500">
            Articles in this list won't be deleted, just removed from this list.
          </p>
        </div>
        
        <Modal.Footer>
          <Button 
            variant="ghost" 
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger"
            onClick={handleDelete}
            loading={isSubmitting}
          >
            Delete List
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // Edit view
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit List" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          ref={inputRef}
          label="List Name"
          placeholder="Enter list name..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          error={error}
          disabled={isSubmitting}
          maxLength={50}
        />
        
        <p className="text-xs text-ink-400 font-sans">
          {name.length}/50 characters
        </p>
      </form>
      
      <Modal.Footer className="justify-between">
        <Button 
          variant="ghost" 
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isSubmitting}
          icon={Trash2}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Delete
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!name.trim() || name.trim() === list.name}
          >
            Save Changes
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}