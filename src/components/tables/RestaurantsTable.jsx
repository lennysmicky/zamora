import React from "react";


import {
  RiEditLine,
  RiDeleteBinLine,
} from "react-icons/ri";


function RestaurantsTable({ restaurants, onEdit, onDelete }) {
  return (
    <table className="restaurants-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Adresse</th>
          <th>Téléphone</th>
          <th>Email</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {restaurants.map((r) => (
          <tr key={r.id}>
            <td>{r.name}</td>

            <td>
              {r.address}, {r.city}, {r.country}
            </td>
            <td>{r.phone}</td>
            <td>{r.email}</td>
             <td>
              <span
                className={`status-btn ${
                  r.status === "actif" ? "active" : "inactive"
                }`}
              >
                {r.status}
              </span>
            </td>
            <td className="actions">
              <button onClick={() => onEdit(r)}>
                <RiEditLine />
              </button>
              <button onClick={() => onDelete(r)} className="danger">
                <RiDeleteBinLine />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default RestaurantsTable;
