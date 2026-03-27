import React from 'react';
import { BANKS, type Bank } from '../../types/fee';
import clsx from 'clsx';

interface Props {
  value: Bank | '';
  onChange: (bank: Bank) => void;
  disabled?: boolean;
}

const BankSelector: React.FC<Props> = ({ value, onChange, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">Select Bank</label>
    <div className="grid grid-cols-3 gap-2">
      {BANKS.map((bank) => (
        <button
          key={bank.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(bank.id)}
          className={clsx(
            'flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors text-xs font-medium',
            value === bank.id
              ? 'border-blue-500 bg-blue-900/30 text-blue-300'
              : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <img
            src={bank.logo}
            alt={bank.label}
            className="w-8 h-8 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {bank.label}
        </button>
      ))}
    </div>
  </div>
);

export default BankSelector;
