"use client";

import { useState, useCallback } from "react";
import { X, Delete } from "lucide-react";
import { clsx } from "clsx";

interface InlineCalculatorProps {
  onInsert: (result: string) => void;
  onClose: () => void;
}

type Operator = "+" | "-" | "×" | "÷" | null;

export function InlineCalculator({ onInsert, onClose }: InlineCalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [lastEquation, setLastEquation] = useState<string | null>(null);

  const inputDigit = useCallback((digit: string) => {
    if (lastEquation) {
      setLastEquation(null);
    }
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }, [display, waitingForOperand, lastEquation]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setLastEquation(null);
  }, []);

  const backspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  }, [display]);

  const performOperation = useCallback((nextOperator: Operator) => {
    if (lastEquation) {
      setLastEquation(null);
    }
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue;
      let result: number;

      switch (operator) {
        case "+":
          result = currentValue + inputValue;
          break;
        case "-":
          result = currentValue - inputValue;
          break;
        case "×":
          result = currentValue * inputValue;
          break;
        case "÷":
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, operator, previousValue, lastEquation]);

  const calculate = useCallback(() => {
    if (operator === null || previousValue === null) {
      return;
    }

    const inputValue = parseFloat(display);
    let result: number;

    switch (operator) {
      case "+":
        result = previousValue + inputValue;
        break;
      case "-":
        result = previousValue - inputValue;
        break;
      case "×":
        result = previousValue * inputValue;
        break;
      case "÷":
        result = inputValue !== 0 ? previousValue / inputValue : 0;
        break;
      default:
        result = inputValue;
    }

    // Round to avoid floating point issues
    result = Math.round(result * 1000000000) / 1000000000;

    // Save the full equation for display
    setLastEquation(`${previousValue} ${operator} ${inputValue} = ${result}`);
    setDisplay(String(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, operator, previousValue]);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  }, [display]);

  const percentage = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const insertResult = useCallback(() => {
    onInsert(display);
  }, [display, onInsert]);

  const buttonClass = "h-10 w-10 rounded-lg text-sm font-medium transition flex items-center justify-center";
  const numberClass = clsx(buttonClass, "bg-white/10 text-white hover:bg-white/20");
  const operatorClass = clsx(buttonClass, "bg-[var(--color-primary)]/80 text-white hover:bg-[var(--color-primary)]");
  const functionClass = clsx(buttonClass, "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white");

  return (
    <div className="rounded-xl bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-3 w-[220px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/60">Calculator</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Display */}
      <div className="bg-black/30 rounded-lg px-3 py-2 mb-3 border border-white/5">
        <div className="text-right text-xl font-mono text-white truncate">
          {lastEquation ? (
            lastEquation
          ) : operator && previousValue !== null ? (
            <span>
              <span className="text-white/50">{previousValue} {operator} </span>
              {!waitingForOperand && display}
            </span>
          ) : (
            display
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        {/* Row 1 */}
        <button type="button" onClick={clear} className={functionClass}>C</button>
        <button type="button" onClick={toggleSign} className={functionClass}>±</button>
        <button type="button" onClick={percentage} className={functionClass}>%</button>
        <button type="button" onClick={() => performOperation("÷")} className={operatorClass}>÷</button>

        {/* Row 2 */}
        <button type="button" onClick={() => inputDigit("7")} className={numberClass}>7</button>
        <button type="button" onClick={() => inputDigit("8")} className={numberClass}>8</button>
        <button type="button" onClick={() => inputDigit("9")} className={numberClass}>9</button>
        <button type="button" onClick={() => performOperation("×")} className={operatorClass}>×</button>

        {/* Row 3 */}
        <button type="button" onClick={() => inputDigit("4")} className={numberClass}>4</button>
        <button type="button" onClick={() => inputDigit("5")} className={numberClass}>5</button>
        <button type="button" onClick={() => inputDigit("6")} className={numberClass}>6</button>
        <button type="button" onClick={() => performOperation("-")} className={operatorClass}>−</button>

        {/* Row 4 */}
        <button type="button" onClick={() => inputDigit("1")} className={numberClass}>1</button>
        <button type="button" onClick={() => inputDigit("2")} className={numberClass}>2</button>
        <button type="button" onClick={() => inputDigit("3")} className={numberClass}>3</button>
        <button type="button" onClick={() => performOperation("+")} className={operatorClass}>+</button>

        {/* Row 5 */}
        <button type="button" onClick={() => inputDigit("0")} className={clsx(numberClass, "col-span-1")}>0</button>
        <button type="button" onClick={backspace} className={functionClass}>
          <Delete className="h-4 w-4" />
        </button>
        <button type="button" onClick={inputDecimal} className={numberClass}>.</button>
        <button type="button" onClick={calculate} className={operatorClass}>=</button>
      </div>

      {/* Insert button */}
      <button
        type="button"
        onClick={insertResult}
        className="w-full mt-3 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-medium hover:brightness-110 transition"
      >
        Insert into task
      </button>
    </div>
  );
}
