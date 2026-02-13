import React from 'react';
import { TaxResult } from '../types';
import { Card, CardHeader } from './ui/Card';
import { Tooltip } from './ui/Tooltip';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface ResultsViewProps {
  result: TaxResult;
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('vi-VN').format(val);

const TableRow: React.FC<{ 
  label: string; 
  value: number; 
  subValue?: string; 
  isHeader?: boolean; 
  isTotal?: boolean; 
  indent?: boolean;
  negative?: boolean;
  tooltip?: string;
  highlight?: boolean;
}> = ({ label, value, subValue, isHeader, isTotal, indent, negative, tooltip, highlight }) => (
  <div className={`flex justify-between items-center py-3 px-4 ${isHeader ? 'bg-slate-50 border-y border-slate-200' : 'border-b border-slate-50'} ${highlight ? 'bg-emerald-50/60' : ''} hover:bg-slate-50/80 transition-colors`}>
    <div className={`flex items-center gap-2 ${indent ? 'pl-6' : ''}`}>
      <span className={`${isTotal ? 'font-bold text-slate-900' : isHeader ? 'font-semibold text-slate-700' : 'text-slate-600 font-medium'}`}>
        {label}
      </span>
      {subValue && <span className="text-xs text-slate-400 font-normal">({subValue})</span>}
      {tooltip && (
        <Tooltip content={tooltip}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 hover:text-emerald-500 cursor-help"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </Tooltip>
      )}
    </div>
    <span className={`${isTotal ? 'font-bold text-lg' : 'text-sm font-semibold'} ${negative ? 'text-rose-500' : 'text-slate-800'}`}>
       {negative && value > 0 ? '-' : ''}{formatCurrency(value)}
    </span>
  </div>
);

export const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  const chartData = [
    { name: 'Thực nhận', value: result.totalNet, color: '#10b981' },
    { name: 'Thuế', value: result.totalTax, color: '#f43f5e' },
    { name: 'Bảo hiểm', value: result.socialInsurance + result.healthInsurance + result.unemploymentInsurance, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const totalDeductions = result.gross - result.totalTax - result.totalNet - (result.socialInsurance + result.healthInsurance + result.unemploymentInsurance); // Approximation/Logic check
  // Actually simpler:
  // TaxableIncome = IncomeBeforeTax - Deductions
  // Deductions = IncomeBeforeTax - TaxableIncome
  const calculatedDeductions = result.incomeBeforeTax - result.taxableIncome;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Summary Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <div className="flex-1 bg-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-slate-900/10 flex flex-col justify-between">
             <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Lương Thực nhận (Net)</p>
                <div className="text-4xl font-black text-emerald-400 tracking-tight">
                    {formatCurrency(result.net)} <span className="text-lg text-emerald-400/50 font-medium">VNĐ</span>
                </div>
             </div>
             <div className="mt-4 pt-4 border-t border-slate-800 flex gap-6">
                <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase">Lương Gross</p>
                    <p className="font-bold text-lg">{formatCurrency(result.gross)}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase">Tổng thuế</p>
                    <p className="font-bold text-lg text-rose-400">{formatCurrency(result.personalIncomeTax)}</p>
                </div>
             </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-2 w-full sm:w-48 flex items-center justify-center shadow-sm">
             <div className="w-32 h-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={45}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <RechartsTooltip formatter={(val:number) => formatCurrency(val)} contentStyle={{fontSize: '10px'}} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-400 pointer-events-none">
                    Tỷ lệ
                </div>
             </div>
          </div>
      </div>

      {/* 2. Detailed Breakdown Table (The requested view) */}
      <Card className="overflow-hidden border border-slate-200 shadow-md">
          <CardHeader title="Diễn giải chi tiết (VNĐ)" className="bg-white border-b border-slate-100" />
          <div className="bg-white text-sm">
              <TableRow label="Lương GROSS" value={result.gross} isHeader />
              
              <TableRow label="Bảo hiểm xã hội (8%)" value={result.socialInsurance} indent negative tooltip="Tối đa trên 20 lần lương cơ sở" />
              <TableRow label="Bảo hiểm y tế (1.5%)" value={result.healthInsurance} indent negative tooltip="Tối đa trên 20 lần lương cơ sở" />
              <TableRow label="Bảo hiểm thất nghiệp (1%)" value={result.unemploymentInsurance} indent negative tooltip="Tối đa trên 20 lần lương tối thiểu vùng" />
              
              <TableRow label="Thu nhập trước thuế" value={result.incomeBeforeTax} isHeader highlight />
              
              <TableRow label="Giảm trừ gia cảnh bản thân" value={11000000} indent tooltip="Mức quy định hiện hành: 11 triệu/tháng" />
              <TableRow label="Giảm trừ người phụ thuộc" value={Math.max(0, calculatedDeductions - 11000000)} indent tooltip="4.4 triệu/người/tháng" />
              
              <TableRow label="Thu nhập chịu thuế" value={result.taxableIncome} isHeader highlight />
              
              <TableRow label="Thuế thu nhập cá nhân (*)" value={result.personalIncomeTax} isTotal negative />
          </div>
      </Card>

      {/* 3. Progressive Tax Detail Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-emerald-700 font-bold px-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
            <h3>(*) Chi tiết thuế thu nhập cá nhân</h3>
        </div>
        <Card className="overflow-hidden border border-emerald-100 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-emerald-50/50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 border-b border-emerald-100">Mức chịu thuế</th>
                            <th className="px-4 py-3 border-b border-emerald-100 text-center">Thuế suất</th>
                            <th className="px-4 py-3 border-b border-emerald-100 text-right">Thu nhập tính thuế</th>
                            <th className="px-4 py-3 border-b border-emerald-100 text-right">Tiền nộp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {result.detailTax.map((level, idx) => (
                            <tr key={idx} className={`transition-colors ${level.taxAmount > 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/30 text-slate-400'}`}>
                                <td className="px-4 py-3">
                                    {level.level === 7 
                                      ? `Trên ${formatCurrency(level.minIncome)}` 
                                      : `${level.minIncome > 0 ? 'Trên ' + formatCurrency(level.minIncome) + ' ' : ''}Đến ${formatCurrency(level.maxIncome)}`}
                                </td>
                                <td className="px-4 py-3 text-center font-mono">
                                    {level.rate * 100}%
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                    {formatCurrency(level.taxedAmount)}
                                </td>
                                <td className={`px-4 py-3 text-right font-bold ${level.taxAmount > 0 ? 'text-rose-500' : ''}`}>
                                    {formatCurrency(level.taxAmount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold text-slate-800">
                        <tr>
                            <td colSpan={3} className="px-4 py-3 text-right uppercase text-xs tracking-wider">Tổng tiền thuế</td>
                            <td className="px-4 py-3 text-right text-rose-600 text-base">{formatCurrency(result.personalIncomeTax)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </Card>
      </div>

    </div>
  );
};