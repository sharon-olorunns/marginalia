import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, useToast } from '../ui';

export default function CreateListModal({ isOpen, onClose, onCreateList }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Please enter a list name');
      return;
    }

    if (trimmedName.length > 50) {
      setError('List name must be 50 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreateList(trimmedName);
      toast.success(`List "${trimmedName}" created`);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New List" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          ref={inputRef}
          label="List Name"
          placeholder="e.g., Product Thinking, Weekend Reads..."
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
      
      <Modal.Footer>
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
          disabled={!name.trim()}
        >
          Create List
        </Button>
      </Modal.Footer>
    </Modal>
  );
}