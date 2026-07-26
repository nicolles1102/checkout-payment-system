import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { Header } from './components/layout/Header';
import { StepIndicator } from './components/ui/StepIndicator';
import { ProductPage } from './pages/ProductPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SummaryPage } from './pages/SummaryPage';
import { ResultPage } from './pages/ResultPage';
import type { CheckoutStep } from './types';

function CheckoutFlow() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('product');

  const handleNext = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  const handleBack = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  const handleRestart = () => {
    setCurrentStep('product');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[128px]" />
      </div>

      <Header />

      {/* Step indicator - only show during flow */}
      {currentStep !== 'result' && (
        <div className="relative z-10">
          <StepIndicator currentStep={currentStep} />
        </div>
      )}

      <main className="relative z-10 max-w-7xl mx-auto">
        {currentStep === 'product' && <ProductPage onNext={handleNext} />}
        {currentStep === 'checkout' && (
          <CheckoutPage onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 'summary' && (
          <SummaryPage onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 'result' && <ResultPage onRestart={handleRestart} />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © 2026 Oso's Pet Boutique — Hecho con amor para Oso 🐻
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Powered by Wompi</span>
            <span>•</span>
            <span>Sandbox</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <CheckoutFlow />
    </Provider>
  );
}

export default App;