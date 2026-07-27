import { useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { Header } from './components/layout/Header';
import { CartBackdrop } from './components/cart/CartBackdrop';
import { StepIndicator } from './components/ui/StepIndicator';
import { ProductPage } from './pages/ProductPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SummaryPage } from './pages/SummaryPage';
import { ResultPage } from './pages/ResultPage';
import type { CheckoutStep, Product } from './types';

function CheckoutFlow() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('product');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const handleNext = (step: CheckoutStep, product?: Product) => {
    if (product) setDetailProduct(product);
    setCurrentStep(step);
  };

  const handleBack = (step: CheckoutStep) => {
    if (step === 'product') setDetailProduct(null);
    setCurrentStep(step);
  };

  const handleRestart = () => {
    setCurrentStep('product');
    setDetailProduct(null);
  };

  const handleCheckoutFromCart = () => {
    setCurrentStep('checkout');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'product':
        return <ProductPage onNext={handleNext} />;
      case 'detail':
        return detailProduct ? (
          <ProductDetailPage product={detailProduct} onBack={handleBack} />
        ) : null;
      case 'checkout':
        return <CheckoutPage onNext={handleNext} onBack={handleBack} />;
      case 'summary':
        return <SummaryPage onNext={handleNext} onBack={handleBack} />;
      case 'result':
        return <ResultPage onRestart={handleRestart} />;
      default:
        return null;
    }
  };

  return (
    <CartBackdrop onCheckout={handleCheckoutFromCart}>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950">
        {/* Background effects - clamped to prevent overflow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-[20%] w-[150%] h-96 bg-purple-600/5 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 -right-[20%] w-[150%] h-96 bg-indigo-600/5 rounded-full blur-[128px]" />
        </div>

        <Header />

        {currentStep !== 'result' && currentStep !== 'detail' && (
          <div className="relative z-10">
            <StepIndicator currentStep={currentStep} />
          </div>
        )}

        <main className="relative z-10 max-w-7xl mx-auto overflow-x-hidden">
          {renderStep()}
        </main>

        <footer className="relative z-10 border-t border-gray-800/30 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              © 2026 Oso's Pet Boutique — Atendido por Oso 🐾 Garantía de lamidas incluidas
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Powered by Wompi</span>
              <span>•</span>
              <span>Sandbox</span>
            </div>
          </div>
        </footer>
      </div>
    </CartBackdrop>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>} persistor={persistor}>
        <CheckoutFlow />
      </PersistGate>
    </Provider>
  );
}