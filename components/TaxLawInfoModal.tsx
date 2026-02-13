import React from 'react';
import { TaxConfig } from '../types';

interface TaxLawInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TaxConfig; 
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('vi-VN').format(val);

export const TaxLawInfoModal: React.FC<TaxLawInfoModalProps> = ({ isOpen, onClose, config }) => {
  if (!isOpen) return null;

  // Use passed config to render correct brackets
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-800">Quy định Thuế ({config.name})</h3>
                <p className="text-xs font-medium text-slate-500">Áp dụng cấu hình hiện tại</p>
             </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Section 1: Deductions */}
          <section>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">1. Giảm trừ gia cảnh & Lương cơ sở</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="text-emerald-800 font-medium text-sm mb-1">Bản thân</div>
                  <div className="text-2xl font-bold text-emerald-600">{formatCurrency(config.deduction.personal)}</div>
                  <div className="text-xs text-emerald-600/70">VNĐ/tháng</div>
               </div>
               <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="text-emerald-800 font-medium text-sm mb-1">Người phụ thuộc</div>
                  <div className="text-2xl font-bold text-emerald-600">{formatCurrency(config.deduction.dependent)}</div>
                  <div className="text-xs text-emerald-600/70">VNĐ/người/tháng</div>
               </div>
               <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="text-blue-800 font-medium text-sm mb-1">Lương cơ sở</div>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(config.baseSalary)}</div>
                  <div className="text-xs text-blue-600/70">VNĐ (Trần BHXH)</div>
               </div>
            </div>
          </section>

          {/* Section 2: Insurance */}
          <section>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">2. Tỷ lệ trích đóng bảo hiểm (Trên lương)</h4>
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
               <div className="grid grid-cols-3 divide-x divide-slate-100">
                  <div className="p-4 text-center">
                     <div className="text-2xl font-bold text-slate-700">{config.insurance.social * 100}%</div>
                     <div className="text-xs font-semibold text-slate-400 uppercase mt-1">BH Xã hội</div>
                  </div>
                  <div className="p-4 text-center">
                     <div className="text-2xl font-bold text-slate-700">{config.insurance.health * 100}%</div>
                     <div className="text-xs font-semibold text-slate-400 uppercase mt-1">BH Y tế</div>
                  </div>
                  <div className="p-4 text-center">
                     <div className="text-2xl font-bold text-slate-700">{config.insurance.unemployment * 100}%</div>
                     <div className="text-xs font-semibold text-slate-400 uppercase mt-1">BH Thất nghiệp</div>
                  </div>
               </div>
               <div className="bg-slate-50 p-3 text-xs text-slate-500 text-center border-t border-slate-100">
                  * BHXH, BHYT tối đa trên 20 lần mức lương cơ sở.<br/>
                  * BHTN tối đa trên 20 lần mức lương tối thiểu vùng.
               </div>
            </div>
          </section>

          {/* Section 3: Tax Brackets */}
          <section>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">3. Biểu thuế lũy tiến từng phần</h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Bậc</th>
                            <th className="px-6 py-3">Thu nhập tính thuế / tháng</th>
                            <th className="px-6 py-3 text-right">Thuế suất</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {config.brackets.map((bracket, index) => {
                             const prevMax = index === 0 ? 0 : config.brackets[index - 1].max;
                             const rangeLabel = bracket.max === Infinity 
                                ? `Trên ${prevMax / 1000000} triệu`
                                : `${prevMax === 0 ? 'Đến' : 'Trên ' + (prevMax / 1000000) + ' đến'} ${bracket.max / 1000000} triệu`;
                             
                             return (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-700">Bậc {index + 1}</td>
                                    <td className="px-6 py-3 text-slate-600">{rangeLabel}</td>
                                    <td className="px-6 py-3 text-right font-bold text-emerald-600">{bracket.rate * 100}%</td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
            <button 
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};