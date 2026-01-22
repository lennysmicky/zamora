import React, { useEffect, useState } from "react";
import './RestaurantsPage.css'
function RestaurantForm({ restaurant, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    status: "actif",
    openingHours: "",
  });

  useEffect(() => {
    if (restaurant) setForm(restaurant);
  }, [restaurant]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="promotion-form">
        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            name="name"
            placeholder="Nom"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Adresse</label>
          <input
            type="text"
            name="address"
            placeholder="Adresse"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Ville</label>
          <input
            type="text"
            name="city"
            placeholder="Ville"
            value={form.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Pays</label>
          <input
            type="text"
            name="country"
            placeholder="Pays"
            value={form.country}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Téléphone</label>
          <input
            type="text"
            name="phone"
            placeholder="Téléphone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Statut</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>

        <div className="form-group">
          <label>Horaires d'ouverture</label>
          <input
            type="text"
            name="openingHours"
            placeholder="08:00 - 22:00"
            value={form.openingHours}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="cancel" onClick={onCancel}>
            Annuler
          </button>

          <button type="submit" className="secondary">
            {restaurant ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RestaurantForm;
