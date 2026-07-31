import React from 'react';
import { motion } from 'motion/react';
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
      className="group relative flex flex-col bg-brand-darkgray rounded-none border border-brand-midgray/40 hover:border-brand-offwhite/30 p-3 pb-4 overflow-hidden transition-all duration-300 backdrop-blur-sm shadow-xl h-full justify-between"
    >
      {/* Product Image Frame with custom drawing visualizer */}
      <div className="relative aspect-square overflow-hidden rounded-none bg-black shrink-0">
        <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out">
          <ProductVisualizer 
            productId={product.id} 
            productImageUrl={product.images?.[0]} 
            className="w-full h-full rounded-none object-cover" 
          />
        </div>

        {/* Dynamic Badge Overlays */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            <span className={`px-2 py-0.5 text-[8px] font-mono tracking-widest font-black uppercase rounded-none border shadow-md backdrop-blur-md ${
              product.badge === '1of1' 
                ? 'bg-red-500/10 text-red-500 border-red-500/30' 
                : product.badge === 'ARCHIVE PIECE'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'bg-brand-offwhite text-brand-matte border-brand-offwhite'
            }`}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Sold Out Watermark Cover */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-3 backdrop-blur-[2px] z-10 select-none">
            <div className="border border-white/20 px-3 py-1.5 rotate-[-3deg] bg-brand-matte shadow-2xl rounded-none">
              <span className="font-display font-black text-[10px] text-white tracking-widest uppercase">
                SOLD OUT // ARCHIVED
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Action Button - Permanently Visible Below Image */}
      <button
        id={`choose-options-btn-${product.id}`}
        onClick={() => onView(product)}
        className={`w-full mt-3 py-2.5 border text-[9px] font-mono font-black tracking-widest uppercase transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-1.5 ${
          isSoldOut
            ? 'bg-brand-midgray/20 border-brand-midgray/40 text-brand-lightgray/50 hover:bg-brand-midgray/40 hover:text-brand-offwhite'
            : 'bg-transparent border-brand-offwhite/20 text-brand-offwhite hover:bg-brand-offwhite hover:text-brand-matte hover:border-brand-offwhite'
        }`}
      >
        {isSoldOut ? 'VIEW ARCHIVE' : 'CHOOSE OPTIONS'}
      </button>

      {/* Item info row (Fully Centered for Luxury feel) */}
      <div className="mt-3.5 flex flex-col items-center text-center flex-1 justify-between">
        <div className="space-y-1 w-full">
          <span className="font-mono text-[8px] text-brand-lightgray uppercase tracking-[0.25em] font-black block">
            {product.category}
          </span>
          <h3 
            onClick={() => onView(product)}
            className="font-display font-black text-xs md:text-sm text-brand-offwhite hover:text-brand-lightgray hover:underline cursor-pointer transition-colors uppercase tracking-tight leading-tight pt-1 max-w-[95%] mx-auto truncate"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        <div className="mt-2.5 w-full flex flex-col items-center">
          {/* Prices */}
          <div className="flex items-center justify-center gap-2 font-mono text-[10px] md:text-xs">
            {product.formerPrice && (
              <span className="text-brand-lightgray/50 line-through">
                ₦{product.formerPrice.toLocaleString()}
              </span>
            )}
            <span className="font-black text-brand-offwhite">
              ₦{product.price.toLocaleString()} NGN
            </span>
          </div>

          {/* Sizes info and Stock Badge */}
          <div className="mt-3 pt-2.5 border-t border-brand-midgray/20 w-full flex items-center justify-between text-[9px] font-mono text-brand-lightgray font-bold px-1">
            <span className="truncate max-w-[70%]">SZ: {product.sizes.join(' / ')}</span>
            <span className={`text-[8px] tracking-wider font-extrabold uppercase ${isSoldOut ? 'text-red-500/80' : 'text-[#39FF88]/80'}`}>
              {isSoldOut ? 'VAULTED' : 'ACTIVE'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
