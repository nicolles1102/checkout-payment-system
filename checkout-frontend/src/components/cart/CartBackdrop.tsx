import { type PropsWithChildren } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, X, Plus, Minus, Trash2, PawPrint, CreditCard } from 'lucide-react';
import type { AppDispatch, RootState } from '../../store';
import { selectCartItems, selectCartCount, selectCartSubtotal, closeCart, removeFromCart, updateQuantity } from '../../store/cartSlice';
import { Button } from '../ui/Button';

interface CartBackdropProps {
  onCheckout: () => void;
}

const BASE_FEE = 3000;
const DELIVERY_FEE = 7000;

export function CartBackdrop({ children, onCheckout }: PropsWithChildren<CartBackdropProps>) {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCartItems);
  const count = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);
  const isOpen = useSelector((state: RootState) => state.cart.isOpen);
  const total = subtotal + BASE_FEE + DELIVERY_FEE;

  const handleCheckout = () => {
    dispatch(closeCart());
    onCheckout();
  };

  return (
    <>
      {/* Overlay when cart is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500"
          onClick={() => dispatch(closeCart())}
        />
      )}

      {/* Back Layer - Cart Sheet */}
      <div
        className={`
          fixed left-0 right-0 bottom-0 z-50
          transition-all duration-500 ease-in-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="rounded-t-3xl rounded-b-2xl border border-gray-800/50 bg-gray-950 backdrop-blur-xl shadow-2xl shadow-purple-500/5 overflow-hidden">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-gray-700" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 pt-2 flex items-center justify-between border-b border-gray-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Tu pedido
                  </h3>
                  <p className="text-xs text-gray-500">
                    {count} {count === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Items */}
            <div className="px-6 py-4 space-y-4 max-h-[40vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <PawPrint className="w-12 h-12 text-gray-700 mx-auto" />
                  <p className="text-gray-500 text-sm">
                    Oso está esperando que agregues productos 🐻
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800/30"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PawPrint className="w-6 h-6 text-gray-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">${item.product.price.toLocaleString()} c/u</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.product.id, quantity: item.quantity - 1 }))}
                        className="w-7 h-7 rounded-lg bg-gray-800/50 flex items-center justify-center hover:bg-gray-700/50 text-gray-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm text-white font-medium">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.product.id, quantity: item.quantity + 1 }))}
                        className="w-7 h-7 rounded-lg bg-gray-800/50 flex items-center justify-center hover:bg-gray-700/50 text-gray-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-purple-300 w-[70px] text-right">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => dispatch(removeFromCart(item.product.id))}
                      className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Totals & Checkout */}
            {items.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-800/30 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Tarifa base</span>
                    <span>${BASE_FEE.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Costo de envío</span>
                    <span>${DELIVERY_FEE.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-800/30">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    ${total.toLocaleString()}
                  </span>
                </div>
                <Button onClick={handleCheckout} fullWidth size="lg" icon={<CreditCard className="w-5 h-5" />}>
                  Pagar con tarjeta de crédito
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Front Layer - wraps main content, shifts up when isOpen */}
      <div
        className={`
          relative z-30 min-h-screen
          transition-all duration-500 ease-in-out
          ${isOpen ? 'scale-[0.95] translate-y-[-40px] opacity-90 pointer-events-none overflow-hidden' : 'scale-100 translate-y-0 opacity-100'}
        `}
      >
        {children}
      </div>
    </>
  );
}