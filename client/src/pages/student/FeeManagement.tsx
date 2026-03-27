import React from 'react';
import InstituteNotice from '../../components/fee/InstituteNotice';
import FeeSection from '../../components/fee/FeeSection';

const FeeManagement: React.FC = () => (
  <div className="p-6 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold text-white mb-6">Fee Management</h1>
    <InstituteNotice />
    <div className="grid md:grid-cols-2 gap-6">
      <FeeSection feeType="academic" title="Academic Fee Receipt" />
      <FeeSection feeType="mess" title="Mess / Hostel Fee Receipt" />
    </div>
  </div>
);

export default FeeManagement;
