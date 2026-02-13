import React, { useState, useEffect } from 'react';
import { TaxConfig } from '../types';
import { DEFAULT_TAX_CONFIG } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TaxConfig;
  onSave: (newConfig: TaxConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<TaxConfig>(config);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  const handleChange = (section: keyof TaxConfig | 'deduction', field: string, value: number) => {
    if (section === 'deduction') {
      setLocalConfig(prev => ({
        ...prev,
        deduction: { ...prev.deduction, [field]: value }
      }));
    } else if (field === 'baseSalary') {
       setLocalConfig(prev => ({ ...prev, baseSalary: value }));
    }
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_TAX_CONFIG);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Cấu hình Luật Thuế</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs leading-relaxed border border-blue-100">
            <strong>Lưu ý:</strong> Các chỉ số mặc định đang áp dụng theo quy định hiện hành 2025. Bạn có thể thay đổi để mô phỏng các chính sách mới (ví dụ: tăng mức giảm trừ gia cảnh).
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Lương cơ sở (VNĐ)</label>
                <input 
                  type="number" 
                  value={localConfig.baseSalary}
                  onChange={(e) => handleChange('baseSalary' as any, 'baseSalary', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Dùng để tính trần BHXH, BHYT (20 lần).</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Giảm trừ bản thân</label>
                    <input 
                      type="number" 
                      value={localConfig.deduction.personal}
                      onChange={(e) => handleChange('deduction', 'personal', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Giảm trừ phụ thuộc</label>
                    <input 
                      type="number" 
                      value={localConfig.deduction.dependent}
                      onChange={(e) => handleChange('deduction', 'dependent', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
             </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
           <button 
             onClick={handleReset}
             className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
           >
             Khôi phục mặc định
           </button>
           <button 
             onClick={() => { onSave(localConfig); onClose(); }}
             className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all"
           >
             Áp dụng
           </button>
        </div>
      </div>
    </div>
  );
};