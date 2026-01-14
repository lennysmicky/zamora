// src/components/common/ConfirmDialog.jsx
import { useTranslation } from 'react-i18next';
import { RiErrorWarningLine, RiDeleteBinLine } from 'react-icons/ri';
import Modal from './Modal';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'warning',
  isLoading = false
}) => {
  const { t } = useTranslation();

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <RiDeleteBinLine />;
      case 'warning':
      default:
        return <RiErrorWarningLine />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="small">
      <div className="confirm-dialog">
        <div className={`confirm-dialog-icon ${type}`}>
          {getIcon()}
        </div>
        
        <h3 className="confirm-dialog-title">
          {title || t('confirm.title')}
        </h3>
        
        <p className="confirm-dialog-message">
          {message || t('confirm.message')}
        </p>
        
        <div className="confirm-dialog-actions">
          <button 
            className="confirm-dialog-btn cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText || t('common.cancel')}
          </button>
          
          <button 
            className={`confirm-dialog-btn confirm ${type}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="confirm-dialog-spinner"></span>
            ) : (
              confirmText || t('common.confirm')
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;