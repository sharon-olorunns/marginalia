import { Modal, Button } from './';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="font-sans text-ink-600">{message}</p>
      
      <Modal.Footer>
        <Button 
          variant="ghost" 
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button 
          variant={variant}
          onClick={handleConfirm}
          loading={isLoading}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}