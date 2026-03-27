import React from 'react';
import { PAYMENT_METHODS, type PaymentMethod } from '../../types/fee';
import clsx from 'clsx';

interface Props {
  value: PaymentMethod | '';
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

const PaymentMethodSelector: React.FC<Props> = ({ value, onChange, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
    <div className="flex flex-wrap gap-2">
      {PAYMENT_METHODS.map((method) => (
        <button
          key={method}
          type="button"
          disabled={disabled}
          onClick={() => onChange(method)}
          className={clsx(
            'px-3 py-1.5 rounded-full border text-sm transition-colors',
            value === method
              ? 'border-blue-500 bg-blue-900/30 text-blue-300'
              : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {method}
        </button>
      ))}
    </div>
  </div>
);

export default PaymentMethodSelector;
