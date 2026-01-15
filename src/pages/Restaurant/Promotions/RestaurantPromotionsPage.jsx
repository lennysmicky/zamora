import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../../stores/authStore';

import PromotionsTable from '../../../components/Promotions/PromotionsTable';
import PromotionForm from '../../../components/Promotions/PromotionForm';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Modal from '../../../components/common/Modal';
import { RiAddLine } from 'react-icons/ri';

import { usePromotions } from '../../../hooks/usePromotions';

import './promotions.css';

const RestaurantPromotionsPage = () => {
  const { t } = useTranslation();
  const { restaurantId } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoToDelete, setPromoToDelete] = useState(null);

  const {
    promotions,
    isLoading,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
  } = usePromotions(restaurantId);

  const openCreateModal = () => {
    setEditingPromo(null);
    setIsModalOpen(true);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingPromo(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (data) => {
    if (editingPromo) {
      updatePromotion({
        ...editingPromo,
        ...data,
      });
    } else {
      createPromotion(data);
    }
    closeModal();
  };

  const handleConfirmDelete = () => {
    deletePromotion(promoToDelete);
    setPromoToDelete(null);
  };

  return (
    <div className="promotions-page">
      <div className="page-header">
        <h1>{t('promotions.title')}</h1>
        <button className="create-btn" onClick={openCreateModal}>
          <RiAddLine />
          <span>Creer une promotion</span>
        </button>
      </div>
      <PromotionsTable
        promotions={promotions}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={setPromoToDelete}
        onToggleStatus={togglePromotionStatus}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          editingPromo
            ? t('Modifier une promotion')
            : t('Creer une promotion')
        }
      >
        <PromotionForm
          initialData={editingPromo}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
      <ConfirmDialog
        isOpen={Boolean(promoToDelete)}
        onClose={() => setPromoToDelete(null)}
        onConfirm={handleConfirmDelete}
        type="danger"
        title={t('promotions.deleteTitle', 'Supprimer la promotion ?')}
        message={t(
          'promotions.deleteMessage',
          'Cette action est irréversible.'
        )}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default RestaurantPromotionsPage;
