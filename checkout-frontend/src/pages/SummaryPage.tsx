import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  CreditCard,
  User,
  MapPin,
  Shield,
  Lock,
  PawPrint,
} from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
import { setProcessing, setPaymentError } from '../store/paymentSlice';
import { createTransaction } from '../store/transactionSlice';
import { Button } from '../components/ui/Button';
import type { CheckoutStep } from '../types';

interface SummaryPageProps {
  onNext: (step: CheckoutStep) => void;
  onBack: (step: CheckoutStep) => void;
}

export function SummaryPage({ onNext, onBack }: SummaryPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProduct } = useSelector((state: RootState) => state.products);
  const { card, baseFee, deliveryFee, isProcessing } = useSelector(
    (state: RootState) => state.payment
  );
  const { customer, delivery, acceptTerms } = useSelector(
    (state: RootState) => state.delivery
  );
  const { error } = useSelector((state: RootState) => state.transaction);

  const maskCardNumber = (number: string) => {
    const digits = number.replace(/\s/g, '');
    const last4 = digits.slice(-4);
    return `**** **** **** ${last4}`;
  };

  const handlePay = async () => {
    if (!selectedProduct) return;

    dispatch(setProcessing(true));

    const result = await dispatch(
      createTransaction({
        product_id: selectedProduct.id,
        customer,
        delivery,
        card,
        accept_terms: acceptTerms,
      })
    );

    dispatch(setProcessing(false));

    if (createTransaction.fulfilled.match(result)) {
      onNext('result');
    } else {
      dispatch(
        setPaymentError(
          result.error?.message || 'Error al procesar el pago'
        )
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onBack('checkout')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Editar información
      </button>

      {/* Success animation placeholder */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/20 mb-2">
          <Lock className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Revisa tu compra
        </h2>
        <p className="text-gray-500 text-sm">
          Todo listo para procesar el pago de forma segura
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="rounded-2xl border border-gray-800/50 bg-gray-900/30 overflow-hidden">
        {/* Product info */}
        {selectedProduct && (
          <div className="p-6 border-b border-gray-800/50">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PawPrint className="w-10 h-10 text-gray-700" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-white">
                  {selectedProduct.name}
                </p>
                <p className="text-sm text-gray-500">Cantidad: 1</p>
              </div>
              <p className="text-xl font-bold text-purple-300">
                ${selectedProduct.price.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Customer info */}
        <div className="p-6 border-b border-gray-800/50 space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">
              Datos del comprador
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm ml-7">
            <div>
              <p className="text-gray-500">Nombre</p>
              <p className="text-white">{customer.full_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-white">{customer.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Teléfono</p>
              <p className="text-white">{customer.phone_number}</p>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="p-6 border-b border-gray-800/50 space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white">
              Dirección de envío
            </span>
          </div>
          <div className="ml-7 text-sm space-y-1">
            <p className="text-white">{delivery.address}</p>
            <p className="text-gray-400">
              {delivery.city}, {delivery.region}
              {delivery.postal_code ? `, ${delivery.postal_code}` : ''}
            </p>
          </div>
        </div>

        {/* Card info */}
        <div className="p-6 border-b border-gray-800/50 space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">
              Método de pago
            </span>
          </div>
          <div className="ml-7 text-sm space-y-1">
            <p className="text-white flex items-center gap-2">
              <span className="text-gray-400">💳</span>
              {maskCardNumber(card.number)}
            </p>
            <p className="text-gray-500">
              Titular: {card.card_holder}
            </p>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="p-6 space-y-4">
          <h4 className="font-bold text-white">Resumen de precios</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Producto</span>
              <span>${(selectedProduct?.price ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Tarifa base</span>
              <span>${baseFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Costo de envío</span>
              <span>${deliveryFee.toLocaleString()}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-800/50 flex justify-between items-center">
            <span className="text-gray-300 font-medium">Total a pagar</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              ${((selectedProduct?.price ?? 0) + baseFee + deliveryFee).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          <span>Pago cifrado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>Wompi seguro</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PawPrint className="w-3.5 h-3.5" />
          <span>Oso aprueba</span>
        </div>
      </div>

      {/* Pay button */}
      <Button
        onClick={handlePay}
        fullWidth
        size="lg"
        loading={isProcessing}
        icon={isProcessing ? undefined : <Lock className="w-5 h-5" />}
      >
        {isProcessing
          ? 'Procesando pago...'
          : `Pagar $${((selectedProduct?.price ?? 0) + baseFee + deliveryFee).toLocaleString()}`}
      </Button>
    </div>
  );
}