import React, { useState, useEffect } from 'react';
import { AdditionalIncome, CalculationInput, Region, TaxResult, TaxConfig, IncomeType } from './types';
import { calculateGrossToNet, calculateNetToGross } from './services/taxService';
import { TAX_CONFIG_2025, TAX_CONFIG_2026, DEFAULT_TAX_CONFIG } from './constants';
import { ResultsView } from './components/ResultsView';
import { AiAdvisor } from './components/AiAdvisor';
import { Card, CardContent, CardHeader } from './components/ui/Card';
import { Tooltip } from './components/ui/Tooltip';
import { MoneyInput } from './components/ui/MoneyInput';
import { SettingsModal } from './components/SettingsModal';
import { TaxLawInfoModal } from './components/TaxLawInfoModal';

const App: React.FC = () => {
  // Default to 2026 config as requested
  const [taxConfig, setTaxConfig] = useState<TaxConfig>(DEFAULT_TAX_CONFIG);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('2026');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLawInfoOpen, setIsLawInfoOpen] = useState(false);

  const [input, setInput] = useState<CalculationInput>({
    income: 0,
    incomeType: 'GROSS',
    region: Region.I,
    dependents: 0,
    insuranceSalary: 0,
    insuranceMode: 'OFFICIAL',
    otherDeductions: 0,
    additionalIncomes: []
  });

  const [result, setResult] = useState<TaxResult | null>(null);
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeType, setNewIncomeType] = useState<IncomeType>('NON_TAXABLE');

  // Re-calculate when config changes if there is a result
  useEffect(() => {
    if (result) {
      handleCalculate();
    }
  }, [taxConfig.id]);

  const switchPolicy = (policyId: string) => {
    setSelectedPolicyId(policyId);
    if (policyId === '2025') {
      setTaxConfig(TAX_CONFIG_2025);
    } else {
      setTaxConfig(TAX_CONFIG_2026);
    }
  };

  const handleCalculate = () => {
    if (input.income <= 0 && input.additionalIncomes.length === 0) return;
    
    let res: TaxResult;
    if (input.incomeType === 'GROSS') {
      res = calculateGrossToNet(input, taxConfig);
    } else {
      res = calculateNetToGross(input, taxConfig);
    }
    setResult(res);
    
    if (window.innerWidth < 1024) {
        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
  };

  const handleInputChange = (field: keyof CalculationInput, value: any) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const addNewIncome = () => {
      if (!newIncomeName || !newIncomeAmount) return;
      
      const newIncome: AdditionalIncome = {
          id: Date.now().toString(),
          type: newIncomeType,
          amount: Number(newIncomeAmount),
          label: newIncomeName
      };
      
      setInput(prev => ({ ...prev, additionalIncomes: [...prev.additionalIncomes, newIncome] }));
      setNewIncomeName('');
      setNewIncomeAmount('');
      setNewIncomeType('NON_TAXABLE');
  };

  const removeIncomeSource = (id: string) => {
    setInput(prev => ({
      ...prev,
      additionalIncomes: prev.additionalIncomes.filter(inc => inc.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20 relative">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={taxConfig}
        onSave={(newConfig) => {
          setTaxConfig(newConfig);
          // Only update result if we are already showing one
          if (result) {
            const res = input.incomeType === 'GROSS' 
              ? calculateGrossToNet(input, newConfig) 
              : calculateNetToGross(input, newConfig);
            setResult(res);
          }
        }}
      />

      <TaxLawInfoModal
        isOpen={isLawInfoOpen}
        onClose={() => setIsLawInfoOpen(false)}
        config={taxConfig}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/30">
              T
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-800 tracking-tight leading-none">TaxVN</span>
                <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Finance AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsLawInfoOpen(true)}
                className="group flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-all rounded-lg border border-slate-200 hover:border-emerald-200 shadow-sm"
            >
                <span className="text-xs font-bold">📖 Quy định</span>
            </button>
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="group flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-all rounded-lg border border-slate-200 hover:border-emerald-200 shadow-sm"
            >
                <span className="text-xs font-bold">⚙️ Cấu hình</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                Tính lương <span className="text-emerald-600">Gross & Net</span>
                </h1>
                <p className="text-slate-500 text-lg">
                Cập nhật đề xuất luật thuế mới nhất 2026
                </p>
            </div>
            
            {/* POLICY SWITCHER */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center font-bold text-sm shadow-inner">
                <button
                    onClick={() => switchPolicy('2025')}
                    className={`px-4 py-2 rounded-lg transition-all ${selectedPolicyId === '2025' ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Luật 2025 (Cũ)
                </button>
                <button
                    onClick={() => switchPolicy('2026')}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${selectedPolicyId === '2026' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Đề xuất 2026
                    {selectedPolicyId !== '2026' && <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
            
            {/* LEFT COLUMN: INPUTS */}
            <div className="lg:col-span-7 space-y-6">
                <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Thông tin thu nhập</h3>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Áp dụng: <span className="text-emerald-600 font-bold">{taxConfig.name}</span></p>
                        </div>
                    </div>
                    <CardContent className="space-y-8">
                        
                        {/* 1. MAIN SALARY */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60">
                             <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Lương cố định (Tháng)</label>
                             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div className="relative flex-1 group">
                                    <MoneyInput
                                        value={input.income}
                                        onChange={(val) => handleInputChange('income', val)}
                                        placeholder="0"
                                        className="w-full text-2xl font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-4 py-3 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 group-hover:border-slate-400"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">VNĐ</span>
                                </div>
                                <div className="flex bg-slate-200/50 p-1 rounded-lg self-start sm:self-auto">
                                    <button
                                        onClick={() => handleInputChange('incomeType', 'GROSS')}
                                        className={`px-4 py-3 sm:py-2 rounded-md text-xs sm:text-sm font-bold transition-all flex-1 sm:flex-none ${input.incomeType === 'GROSS' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        GROSS
                                    </button>
                                    <button
                                        onClick={() => handleInputChange('incomeType', 'NET')}
                                        className={`px-4 py-3 sm:py-2 rounded-md text-xs sm:text-sm font-bold transition-all flex-1 sm:flex-none ${input.incomeType === 'NET' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        NET
                                    </button>
                                </div>
                             </div>
                        </div>

                        {/* INSURANCE SETTINGS */}
                         <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700">Mức lương đóng bảo hiểm</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div 
                                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${input.insuranceMode === 'OFFICIAL' ? 'bg-emerald-50/50 border-emerald-500/50 ring-1 ring-emerald-500/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                    onClick={() => handleInputChange('insuranceMode', 'OFFICIAL')}
                                >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${input.insuranceMode === 'OFFICIAL' ? 'border-emerald-500 bg-white' : 'border-slate-300 bg-slate-100'}`}>
                                        {input.insuranceMode === 'OFFICIAL' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                    </div>
                                    <span className={`text-sm font-bold ${input.insuranceMode === 'OFFICIAL' ? 'text-emerald-800' : 'text-slate-600'}`}>Trên lương chính thức</span>
                                </div>
                                
                                <div 
                                    className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all ${input.insuranceMode === 'CUSTOM' ? 'bg-emerald-50/50 border-emerald-500/50 ring-1 ring-emerald-500/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                    onClick={() => input.insuranceMode !== 'CUSTOM' && handleInputChange('insuranceMode', 'CUSTOM')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${input.insuranceMode === 'CUSTOM' ? 'border-emerald-500 bg-white' : 'border-slate-300 bg-slate-100'}`}>
                                            {input.insuranceMode === 'CUSTOM' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                        </div>
                                        <span className={`text-sm font-bold ${input.insuranceMode === 'CUSTOM' ? 'text-emerald-800' : 'text-slate-600'}`}>Nhập mức khác</span>
                                    </div>
                                    
                                    {input.insuranceMode === 'CUSTOM' && (
                                        <div className="animate-fade-in relative">
                                            <MoneyInput
                                                value={input.insuranceSalary || 0}
                                                onChange={(val) => handleInputChange('insuranceSalary', val)}
                                                placeholder="0"
                                                className="w-full text-sm font-semibold text-slate-800 bg-white border border-emerald-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none pr-10"
                                                autoFocus
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">VNĐ</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>

                        {/* 2. REGION & DEPENDENTS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Vùng đóng bảo hiểm</label>
                                <div className="relative">
                                    <select
                                        value={input.region}
                                        onChange={(e) => handleInputChange('region', Number(e.target.value))}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700 appearance-none hover:border-slate-400 transition-colors"
                                    >
                                        <option value={Region.I}>Vùng I (Hà Nội, TP.HCM)</option>
                                        <option value={Region.II}>Vùng II (Đà Nẵng, Cần Thơ)</option>
                                        <option value={Region.III}>Vùng III (Bắc Ninh...)</option>
                                        <option value={Region.IV}>Vùng IV (Khác)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    Người phụ thuộc
                                    <Tooltip content={`Giảm trừ ${new Intl.NumberFormat('vi-VN').format(taxConfig.deduction.dependent)}đ/người`}>
                                        <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold cursor-help hover:bg-slate-300 transition-colors">?</div>
                                    </Tooltip>
                                </label>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => handleInputChange('dependents', Math.max(0, input.dependents - 1))}
                                        className="w-12 h-11 rounded-l-xl border border-r-0 border-slate-300 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 transition-all text-slate-600 font-bold text-lg"
                                    >
                                        -
                                    </button>
                                    <div className="flex-1 h-11 flex items-center justify-center border-y border-slate-300 font-bold text-xl text-slate-800 bg-white">
                                        {input.dependents}
                                    </div>
                                    <button 
                                        onClick={() => handleInputChange('dependents', input.dependents + 1)}
                                        className="w-12 h-11 rounded-r-xl border border-l-0 border-slate-300 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 transition-all text-slate-600 font-bold text-lg"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. ADDITIONAL INCOME */}
                        <div className="border-t border-slate-100 pt-8">
                            <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Thu nhập khác
                            </label>
                            
                            {/* List Existing */}
                            <div className="space-y-3 mb-4">
                                {input.additionalIncomes.map((inc) => (
                                    <div key={inc.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="font-bold text-slate-800 truncate">{inc.label}</div>
                                            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                                <span className={`w-2 h-2 rounded-full ${
                                                    inc.type === 'SALARY_LIKE' ? 'bg-blue-400' : 
                                                    inc.type === 'FREELANCE' ? 'bg-orange-400' :
                                                    inc.type === 'INVESTMENT' ? 'bg-purple-400' : 'bg-emerald-400'
                                                }`}></span>
                                                {inc.type === 'SALARY_LIKE' && 'Tính gộp lương'}
                                                {inc.type === 'FREELANCE' && 'Vãng lai (10%)'}
                                                {inc.type === 'INVESTMENT' && 'Đầu tư (5%)'}
                                                {inc.type === 'NON_TAXABLE' && 'Miễn thuế'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 sm:gap-5">
                                            <span className="font-mono font-bold text-emerald-600 whitespace-nowrap">+{new Intl.NumberFormat('vi-VN').format(inc.amount)}</span>
                                            <button 
                                                onClick={() => removeIncomeSource(inc.id)} 
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add New Form */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 transition-colors">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                    <input 
                                        type="text" 
                                        placeholder="Tên khoản thu (VD: Thưởng tết...)" 
                                        value={newIncomeName}
                                        onChange={(e) => setNewIncomeName(e.target.value)}
                                        className="px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                                    />
                                    <MoneyInput 
                                        value={Number(newIncomeAmount)}
                                        onChange={(val) => setNewIncomeAmount(val.toString())}
                                        placeholder="Số tiền" 
                                        className="px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium w-full"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <select 
                                            value={newIncomeType}
                                            onChange={(e) => setNewIncomeType(e.target.value as IncomeType)}
                                            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white font-medium appearance-none"
                                        >
                                            <option value="NON_TAXABLE">Miễn thuế (Không chịu thuế)</option>
                                            <option value="SALARY_LIKE">Tính gộp lương (Thuế lũy tiến)</option>
                                            <option value="FREELANCE">Vãng lai (Thuế 10%)</option>
                                            <option value="INVESTMENT">Đầu tư vốn (Thuế 5%)</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={addNewIncome}
                                        className="bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        <span>Thêm</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCalculate}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-lg font-bold py-4 rounded-xl shadow-xl shadow-emerald-500/20 transform hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            Tính Thuế Ngay
                        </button>

                    </CardContent>
                </Card>
            </div>

            {/* RESULTS SECTION */}
            <div className="lg:col-span-5 space-y-6 sticky top-24" id="results-section">
                {result ? (
                    <div className="space-y-6 animate-slide-up">
                        <ResultsView result={result} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-8 bg-white/60 backdrop-blur-sm border border-white rounded-2xl text-center shadow-lg shadow-slate-200/50">
                            <div className="w-24 h-24 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white">
                                <span className="text-5xl animate-bounce" style={{ animationDuration: '3s' }}>👇</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Bắt đầu tính toán</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Nhập lương và các thông tin bên trái để xem kết quả.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </main>

      {/* GLOBAL FLOATING AI WIDGET */}
      <AiAdvisor contextData={result} />

    </div>
  );
};

export default App;