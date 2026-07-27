import React from 'react';
import type { CheckoutStep } from '../../types';

const steps: { key: CheckoutStep; label: string; number: number }[] = [
  { key: 'product', label: 'Chaquetas', number: 1 },
  { key: 'checkout', label: 'Pago y Envío', number: 2 },
  { key: 'summary', label: 'Resumen', number: 3 },
  { key: 'result', label: 'Resultado', number: 4 },
];

interface StepIndicatorProps {
  currentStep: CheckoutStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const getCurrentIndex = () => {
    return steps.findIndex((s) => s.key === currentStep);
  };

  const currentIndex = getCurrentIndex();

  return (
    <div className="w-full px-3 sm:px-4 py-4 sm:py-6">
      {/* Single unified layout that scales gracefully */}
      <div className="flex items-start justify-center max-w-2xl mx-auto gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const circleKey = `circle-${step.key}`;
          const connectorKey = `connector-${step.key}`;

          return (
            <React.Fragment key={step.key}>
              {/* Step circle + label */}
              <div className="flex flex-col items-center relative flex-shrink-0">
                <div
                  className={`
                    w-8 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold aspect-square
                    transition-all duration-500 ease-out
                    ${isCompleted
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                      : isCurrent
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white scale-110 shadow-xl shadow-purple-600/40 ring-2 sm:ring-4 ring-purple-500/20'
                        : 'bg-gray-800/50 text-gray-500 border border-gray-700'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`
                    text-[10px] leading-tight sm:text-xs mt-1 sm:mt-2 text-center font-medium transition-colors duration-300
                    ${isCurrent ? 'text-purple-300' : isCompleted ? 'text-gray-300' : 'text-gray-600'}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="w-6 sm:w-16 lg:w-24 mx-1 sm:mx-2 mb-4 sm:mb-6 self-center">
                  <div
                    className={`
                      h-0.5 sm:h-1 rounded-full transition-all duration-500
                      ${isCompleted ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gray-800'}
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
