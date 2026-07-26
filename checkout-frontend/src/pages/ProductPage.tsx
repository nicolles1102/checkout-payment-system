import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, PawPrint } from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
import { fetchProducts, setSelectedProduct } from '../store/productsSlice';
import { Button } from '../components/ui/Button';
import type { Product, CheckoutStep } from '../types';

interface ProductPageProps {
  onNext: (step: CheckoutStep) => void;
}

export function ProductPage({ onNext }: ProductPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items, selectedProduct, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, items.length]);

  const handleSelectProduct = (product: Product) => {
    dispatch(setSelectedProduct(product));
  };

  const handleContinue = () => {
    if (selectedProduct) {
      onNext('checkout');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="text-center space-y-4">
          <p className="text-red-400">Error al cargar los productos</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <Button onClick={() => dispatch(fetchProducts())}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <div className="text-center space-y-3 px-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
          <PawPrint className="w-3.5 h-3.5" />
          Colección Invierno 2026
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Chaquetas para{' '}
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            mimados
          </span>
        </h2>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          Abriga a tu mejor amigo con estilo. Prendas premium diseñadas para
          perritos y gaticos.
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 max-w-5xl mx-auto">
        {items.map((product) => {
          const isSelected = selectedProduct?.id === product.id;
          const outOfStock = product.stock <= 0;

          return (
            <button
              key={product.id}
              onClick={() => !outOfStock && handleSelectProduct(product)}
              disabled={outOfStock}
              className={`
                group relative text-left rounded-2xl border transition-all duration-300 overflow-hidden
                ${isSelected
                  ? 'border-purple-500 bg-purple-500/5 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/30'
                  : outOfStock
                    ? 'border-gray-800/50 bg-gray-900/30 opacity-50 cursor-not-allowed'
                    : 'border-gray-800/50 bg-gray-900/30 hover:border-gray-700 hover:bg-gray-900/50 hover:shadow-lg'
                }
              `}
            >
              {/* Product Image */}
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PawPrint className="w-16 h-16 text-gray-700" />
                  </div>
                )}

                {/* Stock badge */}
                <div className="absolute top-3 right-3">
                  {outOfStock ? (
                    <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20">
                      Agotado
                    </span>
                  ) : product.stock <= 5 ? (
                    <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium border border-yellow-500/20">
                      Últimos {product.stock}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/20">
                      En stock
                    </span>
                  )}
                </div>

                {/* Selected overlay */}
                {isSelected && (
                  <div className="absolute top-3 left-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-600">
                    {product.stock} disp.
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      {selectedProduct && (
        <div className="sticky bottom-0 px-4 pb-4">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-r from-purple-600/20 via-indigo-600/10 to-purple-600/20 border border-purple-500/20 backdrop-blur-xl p-4 flex items-center justify-between gap-4">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-400">Producto seleccionado</p>
                <p className="font-bold text-white">{selectedProduct.name}</p>
              </div>
              <div className="flex items-center gap-4 sm:gap-8">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Precio</p>
                  <p className="font-bold text-lg text-purple-300">
                    ${selectedProduct.price.toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={handleContinue}
                  size="lg"
                  icon={<ShoppingBag className="w-5 h-5" />}
                >
                  Comprar ahora
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}