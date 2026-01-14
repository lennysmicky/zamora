// // src/pages/Restaurant/Payments/RestaurantPaymentsPage.jsx
// import { useTranslation } from 'react-i18next';
// import useAuthStore from '../../../stores/authStore';

// // ✅ IMPORTER les composants existants
// import KpiCard from '../../../components/kpi/KpiCard';

// const RestaurantPaymentsPage = () => {
//   const { t } = useTranslation();
//   const { restaurantId } = useAuthStore();

//   // TODO: Connecter avec API
//   const stats = {
//     revenue: 150000,
//     commission: 22500,
//     net: 127500,
//   };
//   const payments = [];
//   const isLoading = false;

//   return (
//     <div className="payments-page">
//       <h1>{t('sidebar.payments')}</h1>

//       <div className="payments-stats">
//         <KpiCard
//           title="Revenus du mois"
//           value={`${stats.revenue.toLocaleString()} FCFA`}
//           icon="💰"
//           trend="+12%"
//           trendUp={true}
//         />
//         <KpiCard
//           title="Commission Zamora (15%)"
//           value={`${stats.commission.toLocaleString()} FCFA`}
//           icon="💸"
//         />
//         <KpiCard
//           title="Net à recevoir"
//           value={`${stats.net.toLocaleString()} FCFA`}
//           icon="✅"
//           trend="+8%"
//           trendUp={true}
//         />
//       </div>

//       <div className="payments-history">
//         <h2>Historique des virements</h2>
//         <table className="payments-table">
//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>Montant</th>
//               <th>Commission</th>
//               <th>Net</th>
//               <th>Statut</th>
//             </tr>
//           </thead>
//           <tbody>
//             {payments.map(payment => (
//               <tr key={payment.id}>
//                 <td>{payment.date}</td>
//                 <td>{payment.amount} FCFA</td>
//                 <td>{payment.commission} FCFA</td>
//                 <td>{payment.net} FCFA</td>
//                 <td>{payment.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default RestaurantPaymentsPage;

import React from 'react';

const PaymentsPage = () => {
  return (
    <div className="payments-container">
      <h1>Paiements</h1>
      <p className="text-secondary">Page en construction...</p>
    </div>
  );
};

export default PaymentsPage;