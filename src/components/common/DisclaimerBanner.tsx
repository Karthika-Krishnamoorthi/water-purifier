import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<Props> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2.5 bg-sky-50/70 border border-sky-100 rounded-lg text-xs text-slate-600">
        <Info className="w-4 h-4 text-sky-600 shrink-0" />
        <p>
          <span className="font-semibold text-slate-800">ClearSense Safety Note:</span> Monitors water volume and service timing. Does not certify microbiological or chemical potability.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-teal-50/50 border border-sky-100/80 rounded-xl p-4 my-4 flex items-start gap-3 shadow-xs">
      <div className="p-2 bg-sky-100 text-sky-800 rounded-lg shrink-0 mt-0.5">
        <ShieldAlert className="w-5 h-5 text-sky-700" />
      </div>
      <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h4 className="font-semibold text-slate-900 mb-0.5 flex items-center gap-1.5">
          <span>Project Safety &amp; Certification Advisory</span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
            AtomQUEST 2026 Protocol
          </span>
        </h4>
        <p>
          <strong className="text-slate-800">ClearSense</strong> monitors cumulative water volume and supports proactive maintenance scheduling. It does <span className="underline decoration-sky-400 font-medium text-slate-800">not</span> certify drinking-water safety, detect chemical contaminants, or replace certified reverse osmosis / UV purification stages. Always follow the purifier manufacturer’s maintenance schedule and conduct certified laboratory testing when raw water quality fluctuates.
        </p>
      </div>
    </div>
  );
};
