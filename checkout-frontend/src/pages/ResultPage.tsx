import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  PawPrint,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
import { resetTransaction, pollTransactionStatus } from '../store/transactionSlice';
import { resetPayment } from '../store/paymentSlice';
import { resetDelivery } from '../store/deliverySlice';
import { clearSelectedProduct } from '../store/productsSlice';
import { Button } from '../components/ui/Button';

interface ResultPageProps {
  onRestart: () => void;
}

export function ResultPage({ onRestart }: ResultPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { status, id, amount, polling, loading } = useSelector(
    (state: RootState) => state.transaction
  );

  // Start polling when we land on this page and status is still PENDING
  useEffect(() => {
    if (id && status === 'PENDING') {
      dispatch(pollTransactionStatus(id));
    }
  }, [id, status, dispatch]);

  const isApproved = status === 'APPROVED';
  const isDeclined = status === 'DECLINED';
  const isError = status === 'ERROR';
  const isLoading = loading || polling;

  const handleRestart = () => {
    dispatch(resetTransaction());
    dispatch(resetPayment());
    dispatch(resetDelivery());
    dispatch(clearSelectedProduct());
    onRestart();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="flex flex-col items-center gap-6 text-center px-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <PawPrint className="w-8 h-8 text-purple-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Procesando tu pago
            </h3>
            <p className="text-gray-500 text-sm">
              Wompi está verificando la transacción...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-12 space-y-8">
      {/* Result status */}
      <div className="text-center space-y-6 pt-8">
        {/* Icon */}
        <div
          className={`
            inline-flex items-center justify-center w-28 h-28 rounded-full
            transition-all duration-500 animate-[scaleIn_0.5s_ease-out]
            ${isApproved
              ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-4 border-green-500/30'
              : isDeclined || isError
                ? 'bg-gradient-to-br from-red-500/20 to-rose-600/20 border-4 border-red-500/30'
                : 'bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border-4 border-yellow-500/30'
            }
          `}
        >
          {isApproved ? (
            <CheckCircle2 className="w-14 h-14 text-green-400" />
          ) : isDeclined || isError ? (
            <XCircle className="w-14 h-14 text-red-400" />
          ) : (
            <Clock className="w-14 h-14 text-yellow-400" />
          )}
        </div>

        {/* Status text */}
        <div className="space-y-2">
          <h2
            className={`
              text-3xl font-bold
              ${isApproved
                ? 'text-green-400'
                : isDeclined || isError
                  ? 'text-red-400'
                  : 'text-yellow-400'
              }
            `}
          >
            {isApproved
              ? '¡Pago aprobado! 🎉'
              : isDeclined
                ? 'Pago declinado'
                : isError
                  ? 'Error en el pago'
                  : 'Pago pendiente'}
          </h2>
          <p className="text-gray-500">
            {isApproved
              ? '¡Gracias por tu compra! Oso recibirá su chaqueta muy pronto.'
              : isDeclined
                ? 'La tarjeta no pudo ser procesada. Verifica los datos e intenta de nuevo.'
                : isError
                  ? 'Ocurrió un error al procesar el pago. Intenta de nuevo.'
                  : 'La transacción está siendo revisada por Wompi.'}
          </p>
        </div>
      </div>

      {/* Transaction details card */}
      {id && (
        <div className="rounded-2xl border border-gray-800/50 bg-gray-900/30 p-6 space-y-4">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider">
            Detalles de la transacción
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">ID Transacción</span>
              <span className="text-gray-300 font-mono text-xs">{id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monto</span>
              <span className="text-white font-bold">
                ${amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estado</span>
              <span
                className={`
                  font-medium
                  ${isApproved ? 'text-green-400' : isDeclined || isError ? 'text-red-400' : 'text-yellow-400'}
                `}
              >
                {status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gateway</span>
              <span className="text-gray-300">Wompi</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {isApproved ? (
          <>
            <div className="rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 p-6 text-center space-y-3">
              <PawPrint className="w-8 h-8 text-green-400 mx-auto" />
              <p className="text-sm text-gray-400">
                Oso está muy feliz con su nueva chaqueta 🐻✨
              </p>
            </div>
            <Button
              onClick={handleRestart}
              fullWidth
              size="lg"
              variant="primary"
              icon={<ShoppingBag className="w-5 h-5" />}
            >
              Seguir comprando
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleRestart}
              fullWidth
              size="lg"
              icon={<RefreshCw className="w-5 h-5" />}
            >
              Intentar de nuevo
            </Button>
            <Button
              onClick={handleRestart}
              fullWidth
              size="md"
              variant="ghost"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Volver al inicio
            </Button>
          </>
        )}
      </div>
    </div>
  );
}