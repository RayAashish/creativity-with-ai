import React, { useState } from 'react';
import { Calculator as CalcIcon, X, Minus, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface VirtualCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualCalculator: React.FC<VirtualCalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [formula, setFormula] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (d: string) => {
    sounds.playClick();
    setDisplay(prev => (prev === '0' || prev === 'Error' ? d : prev + d));
  };

  const handleOp = (op: string) => {
    sounds.playClick();
    setFormula(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    sounds.playClick();
    setDisplay('0');
    setFormula('');
  };

  const handleBackspace = () => {
    sounds.playClick();
    setDisplay(prev => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const handleCalculate = () => {
    sounds.playClick();
    try {
      const fullExpr = formula + display;
      // Clean expression for safe evaluation of math tokens
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, `${Math.PI}`)
        .replace(/e/g, `${Math.E}`);
      
      // Basic evaluator for arithmetic
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (!isFinite(result)) {
        setDisplay('Error');
      } else {
        const rounded = Math.round(result * 1000000) / 1000000;
        setDisplay(String(rounded));
        setFormula('');
      }
    } catch {
      setDisplay('Error');
    }
  };

  const handleFunc = (fn: string) => {
    sounds.playClick();
    try {
      const val = parseFloat(display);
      let res = val;
      if (fn === 'sqrt') res = Math.sqrt(val);
      else if (fn === 'sq') res = val * val;
      else if (fn === 'inv') res = 1 / val;
      else if (fn === 'log10') res = Math.log10(val);
      else if (fn === 'ln') res = Math.log(val);
      else if (fn === 'sin') res = Math.sin(val);
      else if (fn === 'cos') res = Math.cos(val);
      else if (fn === 'plusminus') res = -val;

      const rounded = Math.round(res * 1000000) / 1000000;
      setDisplay(String(rounded));
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 shadow-2xl rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all">
      {/* Header */}
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 cursor-move">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          <CalcIcon className="w-4 h-4 text-indigo-500" />
          <span>GATE / Aptitude Calc</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3">
          {/* Display */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 mb-3 border border-slate-200 dark:border-slate-800 text-right">
            <div className="text-xs text-slate-400 font-mono h-4 overflow-hidden text-ellipsis">
              {formula}
            </div>
            <div className="text-2xl font-bold font-mono tracking-wider text-slate-800 dark:text-slate-100 overflow-x-auto whitespace-nowrap">
              {display}
            </div>
          </div>

          {/* Scientific Keypad */}
          <div className="grid grid-cols-4 gap-1.5 mb-2 text-xs font-semibold">
            <button onClick={() => handleFunc('sqrt')} className="p-2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">√x</button>
            <button onClick={() => handleFunc('sq')} className="p-2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">x²</button>
            <button onClick={() => handleFunc('log10')} className="p-2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">log</button>
            <button onClick={() => handleFunc('ln')} className="p-2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">ln</button>
          </div>

          {/* Standard Keypad */}
          <div className="grid grid-cols-4 gap-1.5 font-medium text-sm">
            <button onClick={handleClear} className="p-2.5 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-200">C</button>
            <button onClick={handleBackspace} className="p-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 flex items-center justify-center"><RotateCcw className="w-3.5 h-3.5" /></button>
            <button onClick={() => handleFunc('plusminus')} className="p-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300">±</button>
            <button onClick={() => handleOp('/')} className="p-2.5 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-600">÷</button>

            <button onClick={() => handleDigit('7')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">7</button>
            <button onClick={() => handleDigit('8')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">8</button>
            <button onClick={() => handleDigit('9')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">9</button>
            <button onClick={() => handleOp('*')} className="p-2.5 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-600">×</button>

            <button onClick={() => handleDigit('4')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">4</button>
            <button onClick={() => handleDigit('5')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">5</button>
            <button onClick={() => handleDigit('6')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">6</button>
            <button onClick={() => handleOp('-')} className="p-2.5 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-600">−</button>

            <button onClick={() => handleDigit('1')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">1</button>
            <button onClick={() => handleDigit('2')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">2</button>
            <button onClick={() => handleDigit('3')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">3</button>
            <button onClick={() => handleOp('+')} className="p-2.5 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-600">+</button>

            <button onClick={() => handleDigit('0')} className="col-span-2 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">0</button>
            <button onClick={() => handleDigit('.')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">.</button>
            <button onClick={handleCalculate} className="p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold">=</button>
          </div>
        </div>
      )}
    </div>
  );
};
