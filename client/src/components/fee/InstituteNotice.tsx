import React from 'react';
import { Info, ExternalLink, AlertCircle } from 'lucide-react';

const InstituteNotice: React.FC = () => (
  <div className="bg-blue-950 border border-blue-700 rounded-xl p-5 mb-6 space-y-4">
    <div className="flex items-center gap-2 text-blue-300 font-semibold text-base">
      <Info className="w-5 h-5 flex-shrink-0" />
      Fee Payment — Even Semester A.Y. 2025-26 (ABV IIITM Gwalior)
    </div>

    <div className="space-y-1">
      <p className="text-sm text-gray-300">Pay online via the official portal:</p>
      <a
        href="https://octopod.co.in/student/admission/08d02b1d9ee5fa9d0be8bb55f8c5dd3c"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 underline break-all"
      >
        https://octopod.co.in/student/admission/08d02b1d9ee5fa9d0be8bb55f8c5dd3c
        <ExternalLink className="w-3 h-3 flex-shrink-0" />
      </a>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      <div className="bg-gray-900 rounded-lg p-3 space-y-1 text-sm">
        <p className="text-gray-400 font-medium">Bank Transfer (Academic & Mess Fee)</p>
        <p className="text-gray-300">Bank: <span className="text-white">Bank of India</span></p>
        <p className="text-gray-300">A/C No: <span className="text-white font-mono">945210110000969</span></p>
        <p className="text-gray-300">IFSC: <span className="text-white font-mono">BKID0009462</span></p>
        <p className="text-gray-300">Name: <span className="text-white">Director, ABV IIITM GWALIOR</span></p>
      </div>
    </div>

    <div className="flex items-start gap-2 text-xs text-yellow-400">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>
        Late registration policy:{' '}
        <a
          href="https://iiitm.ac.in/index.php/en/academics-final/policy-for-late-registration"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-yellow-300"
        >
          iiitm.ac.in — Late Registration Policy
        </a>
      </span>
    </div>
  </div>
);

export default InstituteNotice;
