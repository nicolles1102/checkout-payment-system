import type { CheckoutStep } from '../../types';

const steps: { key: CheckoutStep; label: string; number: number }[] = [
  { key: 'product', label: 'Producto', number: 1 },
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
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Step circle + label */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-500 ease-out
                    ${isCompleted
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                      : isCurrent
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white scale-110 shadow-xl shadow-purple-600/40 ring-4 ring-purple-500/20'
                        : 'bg-gray-800/50 text-gray-500 border border-gray-700'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`
                    text-xs mt-2 whitespace-nowrap font-medium transition-colors duration-300
                    ${isCurrent ? 'text-purple-300' : isCompleted ? 'text-gray-300' : 'text-gray-600'}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 mb-6">
                  <div
                    className={`
                      h-1 rounded-full transition-all duration-500
                      ${isCompleted ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gray-800'}
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}