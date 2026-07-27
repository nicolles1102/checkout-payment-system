import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Plus, Minus, ShoppingBag, PawPrint } from 'lucide-react';
import type { AppDispatch } from '../store';
import { addToCart, openCart } from '../store/cartSlice';
import { Button } from '../components/ui/Button';
import type { Product, CheckoutStep } from '../types';

interface ProductDetailPageProps {
  product: Product;
  onBack: (step: CheckoutStep) => void;
}

export function ProductDetailPage({ product, onBack }: ProductDetailPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [quantity, setQuantity] = useState(1);

  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    dispatch(openCart());
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onBack('product')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mt-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a productos
      </button>

      {/* Product image */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full rounded-2xl border border-purple-500/20"
        />
      ) : (
        <div className="w-full aspect-[3/4] rounded-2xl border border-purple-500/20 bg-gray-900 flex items-center justify-center">
          <PawPrint className="w-24 h-24 text-gray-700" />
        </div>
      )}

      {/* Product info */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white">{product.name}</h2>
          <p className="text-gray-500 mt-2 leading-relaxed">{product.description}</p>
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800/30">
          <div>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              ${product.price.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Por unidad</p>
          </div>
          <div className="text-right">
            {outOfStock ? (
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                Agotado
              </span>
            ) : product.stock <= 5 ? (
              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                Últimos {product.stock}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                {product.stock} en stock
              </span>
            )}
          </div>
        </div>

        {/* Quantity selector */}
        {!outOfStock && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-400">Cantidad</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-800/30 flex items-center justify-center hover:bg-gray-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-5 h-5 text-white" />
              </button>
              <span className="text-2xl font-bold text-white w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-800/30 flex items-center justify-center hover:bg-gray-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
              <span className="text-sm text-gray-500">
                {product.stock} disponibles
              </span>
            </div>
          </div>
        )}

        {/* Add to cart button */}
        {!outOfStock && (
          <Button
            onClick={handleAddToCart}
            fullWidth
            size="lg"
            icon={<ShoppingBag className="w-5 h-5" />}
          >
            Agregar al carrito — ${(product.price * quantity).toLocaleString()}
          </Button>
        )}
      </div>
    </div>
  );
}