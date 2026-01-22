import React, { useState } from "react";
import RestaurantsTable from "../../components/tables/RestaurantsTable";
import RestaurantForm from "../../components/forms/RestaurantsForm";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { RiAddLine } from "react-icons/ri";
import '../../pages/Restaurant/Promotions/promotions.css';
import './Restaurants.css'

const initialRestaurants = [
  {
    id: 1,
    name: "City Burger",
    address: "Rue 123",
    city: "Lomé",
    country: "Togo",
    phone: "+228 90 00 00 00",
    email: "contact@cityburger.tg",
    status: "actif",
    openingHours: "08:00 - 22:00",
  },
];

function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);

  const handleSave = (restaurant) => {
    if (restaurant.id) {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurant.id ? restaurant : r))
      );
    } else {
      setRestaurants((prev) => [...prev, { ...restaurant, id: Date.now() }]);
    }

    setEditingRestaurant(null);
    setIsModalOpen(false);
  };

  const handleDelete = (restaurant) => {
    setRestaurantToDelete(restaurant);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    setRestaurants((prev) =>
      prev.filter((r) => r.id !== restaurantToDelete.id)
    );
    setRestaurantToDelete(null);
    setIsConfirmOpen(false);
  };

  const handleAddClick = () => {
    setEditingRestaurant(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (restaurant) => {
    setEditingRestaurant(restaurant);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="promotions-page restaurants">
        <div className="page-header">
          <h1>Gestion des restaurants</h1>
          <button onClick={handleAddClick} className="create-btn">
            <RiAddLine />
            <span>Ajouter un restaurant</span>
          </button>
        </div>

        <RestaurantsTable
          restaurants={restaurants}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRestaurant ? "Modifier le restaurant" : "Ajouter un restaurant"}
        >
          <RestaurantForm
            restaurant={editingRestaurant}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmation"
          message="Voulez-vous vraiment supprimer ce restaurant ?"
        />
      </div>


    </>
  );
}

export default RestaurantsPage;
