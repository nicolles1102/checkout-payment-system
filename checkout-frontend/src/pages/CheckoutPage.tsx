import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  Hash,
  Calendar,
  Lock,
  ArrowLeft,
  Shield,
  PawPrint,
} from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
import { updateCardInfo } from '../store/paymentSlice';
import { updateCustomer, updateDelivery, setAcceptTerms } from '../store/deliverySlice';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { CheckoutStep } from '../types';

interface CheckoutPageProps {
  onNext: (step: CheckoutStep) => void;
  onBack: (step: CheckoutStep) => void;
}

interface FormErrors {
  [key: string]: string;
}

export function CheckoutPage({ onNext, onBack }: CheckoutPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProduct } = useSelector((state: RootState) => state.products);
  const { card, baseFee, deliveryFee, totalAmount } = useSelector((state: RootState) => state.payment);
  const { customer, delivery, acceptTerms } = useSelector(
    (state: RootState) => state.delivery
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : '';
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Customer validation
    if (!customer.full_name.trim()) {
      newErrors.full_name = 'El nombre es requerido';
    }
    if (!customer.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!customer.phone_number.trim()) {
      newErrors.phone_number = 'El teléfono es requerido';
    } else if (!/^\+?[\d\s-]{7,15}$/.test(customer.phone_number)) {
      newErrors.phone_number = 'Teléfono inválido';
    }

    // Delivery validation
    if (!delivery.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }
    if (!delivery.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }
    if (!delivery.region.trim()) {
      newErrors.region = 'El departamento es requerido';
    }

    // Card validation
    const cardDigits = card.number.replace(/\D/g, '');
    if (cardDigits.length < 13) {
      newErrors.card_number = 'Número de tarjeta inválido';
    }
    if (!card.card_holder.trim()) {
      newErrors.card_holder = 'El titular es requerido';
    }
    const expDigits = (card.exp_month + card.exp_year).replace(/\D/g, '');
    if (expDigits.length < 4) {
      newErrors.card_expiry = 'Fecha de expiración inválida';
    }
    if (!card.cvc.trim() || card.cvc.length < 3) {
      newErrors.card_cvc = 'CVC inválido';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Debe aceptar los términos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext('summary');
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    dispatch(updateCardInfo({ number: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    const [month, year] = formatted.split('/');
    dispatch(
      updateCardInfo({
        exp_month: month || '',
        exp_year: year || '',
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onBack('product')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al producto
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Forms - Left side */}
        <div className="lg:col-span-3 space-y-8">
          {/* Customer Info */}
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Información Personal
                </h3>
                <p className="text-xs text-gray-500">
                  Datos del comprador
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Input
                label="Nombre completo"
                placeholder="Oso Pérez"
                value={customer.full_name}
                onChange={(e) =>
                  dispatch(updateCustomer({ full_name: e.target.value }))
                }
                error={errors.full_name}
                icon={<User className="w-4 h-4" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="oso@email.com"
                  value={customer.email}
                  onChange={(e) =>
                    dispatch(updateCustomer({ email: e.target.value }))
                  }
                  error={errors.email}
                  icon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={customer.phone_number}
                  onChange={(e) =>
                    dispatch(updateCustomer({ phone_number: e.target.value }))
                  }
                  error={errors.phone_number}
                  icon={<Phone className="w-4 h-4" />}
                />
              </div>
            </div>
          </section>

          {/* Delivery Info */}
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Dirección de Envío
                </h3>
                <p className="text-xs text-gray-500">
                  ¿Dónde recibe Oso su chaqueta?
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Input
                label="Dirección"
                placeholder="Carrera 1 # 2-3"
                value={delivery.address}
                onChange={(e) =>
                  dispatch(updateDelivery({ address: e.target.value }))
                }
                error={errors.address}
                icon={<MapPin className="w-4 h-4" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Ciudad"
                  placeholder="Medellín"
                  value={delivery.city}
                  onChange={(e) =>
                    dispatch(updateDelivery({ city: e.target.value }))
                  }
                  error={errors.city}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <Input
                  label="Departamento"
                  placeholder="Antioquia"
                  value={delivery.region}
                  onChange={(e) =>
                    dispatch(updateDelivery({ region: e.target.value }))
                  }
                  error={errors.region}
                  icon={<Globe className="w-4 h-4" />}
                />
                <Input
                  label="Código Postal"
                  placeholder="050001"
                  value={delivery.postal_code}
                  onChange={(e) =>
                    dispatch(updateDelivery({ postal_code: e.target.value }))
                  }
                  icon={<Hash className="w-4 h-4" />}
                />
              </div>
            </div>
          </section>

          {/* Card Info */}
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Información de Pago
                </h3>
                <p className="text-xs text-gray-500">
                  Tarjeta de crédito o débito
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Input
                label="Número de tarjeta"
                placeholder="4242 4242 4242 4242"
                value={card.number}
                onChange={handleCardNumberChange}
                error={errors.card_number}
                icon={<CreditCard className="w-4 h-4" />}
                maxLength={19}
              />
              <Input
                label="Titular de la tarjeta"
                placeholder="OSO PEREZ"
                value={card.card_holder}
                onChange={(e) =>
                  dispatch(
                    updateCardInfo({ card_holder: e.target.value.toUpperCase() })
                  )
                }
                error={errors.card_holder}
                icon={<User className="w-4 h-4" />}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Vencimiento"
                  placeholder="MM/AA"
                  value={
                    card.exp_month
                      ? `${card.exp_month}/${card.exp_year}`
                      : ''
                  }
                  onChange={handleExpiryChange}
                  error={errors.card_expiry}
                  icon={<Calendar className="w-4 h-4" />}
                  maxLength={5}
                />
                <Input
                  label="CVC"
                  type="password"
                  placeholder="123"
                  value={card.cvc}
                  onChange={(e) =>
                    dispatch(
                      updateCardInfo({
                        cvc: e.target.value.replace(/\D/g, '').slice(0, 4),
                      })
                    )
                  }
                  error={errors.card_cvc}
                  icon={<Lock className="w-4 h-4" />}
                  maxLength={4}
                />
              </div>
            </div>
          </section>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => dispatch(setAcceptTerms(e.target.checked))}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-900 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              Acepto los{' '}
              <span className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                términos y condiciones
              </span>{' '}
              y la{' '}
              <span className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                política de privacidad
              </span>
            </span>
          </label>
          {errors.terms && (
            <p className="text-sm text-red-400">{errors.terms}</p>
          )}

          {/* Secure payment notice */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Pago procesado de forma segura por Wompi</span>
          </div>
        </div>

        {/* Order Summary - Right side */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-gray-800/50 bg-gray-900/30 p-6 space-y-4">
              <h4 className="font-bold text-white text-lg">
                Resumen del pedido
              </h4>

              {selectedProduct && (
                <div className="flex items-center gap-4 pb-4 border-b border-gray-800/50">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PawPrint className="w-8 h-8 text-gray-700" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {selectedProduct.name}
                    </p>
                    <p className="text-xs text-gray-500">Cant: 1</p>
                  </div>
                  <p className="text-sm font-bold text-purple-300 ml-auto">
                    ${selectedProduct.price.toLocaleString()}
                  </p>
                </div>
              )}

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
                <span className="text-gray-300 font-medium">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  ${((selectedProduct?.price ?? 0) + baseFee + deliveryFee).toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              fullWidth
              size="lg"
              icon={<CreditCard className="w-5 h-5" />}
            >
              Continuar al resumen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}