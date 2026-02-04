import Modal from './Modal'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', variant = 'danger' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-text-secondary mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button onClick={() => { onConfirm(); onClose() }} className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}>
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
