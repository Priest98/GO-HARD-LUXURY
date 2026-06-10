import React from 'react';
import { motion } from 'motion/react';
import { Eye, ShoppingBag, EyeOff } from 'lucide-react';
import { Product } from '../types';
import { ProductVisualizer } from './ProductVisualizer';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onAddToCartDirectly: (product: Product, size: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
  onAddToCartDirectly
}) => {
  const isSoldOut = product.soldOut === true;

  return (
    <motion.div
      id={`product-card-${product.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col bg-[#121212] rounded-none border border-white/10 hover:border-white/30 p-4 overflow-hidden transition-all duration-300 backdrop-blur-sm shadow-xl"
    >
      {/* Product Image Frame with custom drawing visualizer */}
      <div className="relative aspect-square overflow-hidden rounded-none bg-black">
        <ProductVisualizer productId={product.id} productImageUrl={product.images?.[0]} className="w-full h-full rounded-none" />

        {/* Dynamic Badge Overlays */}
        {product.badge && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            <span className={`px-2.5 py-1 text-[9px] font-mono tracking-widest font-black uppercase rounded-none border shadow-md backdrop-blur-md ${
              product.badge === '1of1' 
                ? 'bg-red-500/10 text-red-500 border-red-500/30' 
                : product.badge === 'ARCHIVE PIECE'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'bg-white text-black border-white'
            }`}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Sold Out Watermark Cover */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-xs z-10 select-none">
            <div className="border border-white/30 px-4 py-2 rotate-[-4deg] bg-black shadow-2xl rounded-none">
              <span className="font-display font-black text-xs text-white tracking-widest uppercase">
                SOLD OUT // ARCHIVED
              </span>
            </div>
          </div>
        )}

        {/* Quick-action hovering panel (Only active when NOT sold out) */}
        {!isSoldOut && (
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black via-black/90 to-transparent z-10 flex gap-2">
            <button
              id={`quick-view-btn-${product.id}`}
              onClick={() => onView(product)}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 text-[10px] font-bold tracking-widest uppercase py-2.5 px-3 rounded-none transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Eye size={13} />
              <span>EXPLORE</span>
            </button>
            
            {product.sizes.length > 0 && (
              <button
                id={`quick-add-btn-${product.id}`}
                onClick={() => onAddToCartDirectly(product, product.sizes[0])}
                className="flex items-center justify-center bg-[#1a1a1a] border border-white/20 text-white hover:bg-white hover:text-black text-[10px] font-bold p-2.5 rounded-none transition-all duration-200 active:scale-95 cursor-pointer"
                title={`Quick add size ${product.sizes[0]}`}
              >
                <ShoppingBag size={13} />
              </button>
            )}
          </div>
        )}

        {/* Quick action for sold-out archive item checking status */}
        {isSoldOut && (
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black via-black/90 to-transparent z-10">
            <button
              id={`archive-explore-btn-${product.id}`}
              onClick={() => onView(product)}
              className="w-full flex items-center justify-center gap-2 bg-black text-white/70 hover:bg-[#121212] border border-white/15 text-[10px] font-bold tracking-widest py-2.5 px-3 rounded-none transition-all duration-200 cursor-pointer uppercase"
            >
              <EyeOff size={13} />
              <span>VIEW ARCHIVE DETAILS</span>
            </button>
          </div>
        )}
      </div>

      {/* Item info row */}
      <div className="mt-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="font-mono text-[9px] text-[#8e8e93] uppercase tracking-[0.2em] font-black block">
              {product.category}
            </span>
            <h3 className="font-display font-black text-sm text-white group-hover:text-white/80 hover:underline truncate mt-1 uppercase tracking-tight transition-colors cursor-pointer" onClick={() => onView(product)}>
              {product.name}
            </h3>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="font-mono text-xs font-black text-white bg-white/5 border border-white/10 px-2 py-1">
              ₦{product.price.toLocaleString()}
            </span>
            {product.formerPrice && (
              <span className="font-mono text-[9px] text-[#8e8e93] line-through mt-0.5">
                ₦{product.formerPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Item core quote preview or quick size label display */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#8e8e93] font-bold">
          <span>SIZES: {product.sizes.join(' / ')}</span>
          <span className="text-[9px] text-white tracking-wider">
            {isSoldOut ? 'VAULTED' : 'IN STOCK'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
