import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ArrowRight, ShieldCheck, Mail, Check } from 'lucide-react';
import { Product } from '../types';
import { ProductVisualizer } from './ProductVisualizer';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'S');
  const [quantity, setQuantity] = useState<number>(1);
  const [waitlistEmail, setWaitlistEmail] = useState<string>('');
  const [waitlistSuccess, setWaitlistSuccess] = useState<boolean>(false);
  const [addingToBag, setAddingToBag] = useState<boolean>(false);
  const [addConfirmed, setAddConfirmed] = useState<boolean>(false);

  const isSoldOut = product.soldOut === true;

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToBagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSoldOut) return;
    
    setAddingToBag(true);
    // Simulate premium micro loader action
    setTimeout(() => {
      onAddToCart(product, selectedSize, quantity);
      setAddingToBag(false);
      setAddConfirmed(true);
      setTimeout(() => {
        setAddConfirmed(false);
      }, 1800);
    }, 600);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    setWaitlistSuccess(true);
    setWaitlistEmail('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop overlay filter */}
        <motion.div
          id="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-brand-matte/90 backdrop-blur-md cursor-zoom-out"
        />

        {/* Modal Primary Window Box */}
        <motion.div
          id="modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="bg-brand-matte w-full max-w-4xl rounded-none border border-white/20 overflow-hidden shadow-2xl relative z-10 grid grid-cols-1 md:grid-cols-12"
        >
          {/* Direct Close Button */}
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black border border-white/20 text-white p-2.5 rounded-none hover:bg-white hover:text-black transition-all duration-200 cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Left Panel: Visual blue-print showcase */}
          <div className="md:col-span-6 relative border-b md:border-b-0 md:border-r border-white/10 bg-black p-6 flex flex-col items-center justify-center min-h-[300px] md:min-h-[450px]">
            {/* Background design watermark label inside the image slot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none select-none overflow-hidden opacity-[0.03] leading-none font-black text-[18vw] outline-text">
              GHL
            </div>

            <ProductVisualizer productId={product.id} productImageUrl={product.images?.[0]} className="w-full max-w-[340px] z-10" isDetailView={true} />
            <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-[9px] font-mono text-[#8e8e93] font-bold z-10 uppercase tracking-widest">
              <span>PATTERN_ID: {product.id.replaceAll('-', '_')}</span>
              <span>SCALE: 1.1x STABLE</span>
            </div>
          </div>

          {/* Right Panel: Shopping Specifications Form */}
          <div className="md:col-span-6 p-6 md:p-8 flex flex-col h-full md:max-h-[85vh] overflow-y-visible md:overflow-y-auto bg-[#0a0a0a]">
            {/* Upper technical badge */}
            <span className="font-mono text-[9px] font-black tracking-[0.2em] text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-none inline-self-start uppercase mb-4">
              {product.category} COLLECTION
            </span>

            <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-tighter uppercase leading-none">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-3 mt-2 mb-6 border-b border-white/5 pb-4">
              <span className="font-mono font-black text-xl text-white">
                ₦{product.price.toLocaleString()}
              </span>
              {product.formerPrice && (
                <span className="font-mono text-sm text-[#8e8e93] line-through">
                  ₦{product.formerPrice.toLocaleString()}
                </span>
              )}
              <span className="text-[9px] font-mono text-[#8e8e93] font-bold tracking-widest ml-auto">NGN / TAX INCLUDED</span>
            </div>

            {/* Quote design panel */}
            {product.quotes && (
              <blockquote className="border-l-2 border-white pl-4 py-1 mb-6 text-sm font-luxury italic text-zinc-200">
                "{product.quotes}"
              </blockquote>
            )}

            {/* Core Narrative description */}
            <div className="mb-6">
              <h4 className="font-mono text-[10px] text-[#8e8e93] font-black uppercase tracking-[0.15em] mb-2 leading-none">
                Overview_
              </h4>
              <p className="text-xs text-white/85 leading-relaxed font-sans font-medium">
                {product.description}
              </p>
            </div>

            {/* Specifications Details layout */}
            <div className="mb-8">
              <h4 className="font-mono text-[10px] text-[#8e8e93] font-black uppercase tracking-[0.15em] mb-3 leading-none">
                Technical_Specs_
              </h4>
              <ul className="space-y-2">
                {product.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-white/70">
                    <span className="text-white text-[10px] mt-0.5">•</span>
                    <span className="font-mono font-bold text-[11px] tracking-wide uppercase">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Size Selector + Quantity Actions */}
            {!isSoldOut ? (
              <form onSubmit={handleAddToBagSubmit} className="mt-auto pt-5 border-t border-white/10">
                {/* Sizing choosing grids */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="font-mono text-[10px] text-[#8e8e93] font-black uppercase tracking-widest">
                      Select_Size_
                    </span>
                    {product.sizes.includes('OS') == false && (
                      <span className="text-[9px] font-mono text-white font-black hover:underline cursor-help uppercase tracking-widest" onClick={() => alert('True to size high-fashion boxy fit.\nSizes S to XXL cover regular to extreme oversized drape.')}>
                        [Sizing Guide]
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        id={`size-btn-${product.id}-${size}`}
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] h-[44px] flex items-center justify-center rounded-none font-mono text-xs font-bold border transition-all duration-200 cursor-pointer ${
                          selectedSize === size
                            ? 'bg-white text-black border-white font-black'
                            : 'border-white/20 text-white hover:border-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Counter + Submit */}
                <div className="flex gap-4 items-end">
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[10px] text-[#8e8e93] font-black uppercase tracking-widest block">
                      QTY_
                    </span>
                    <div className="flex items-center bg-black border border-white/20 rounded-none h-[48px] overflow-hidden px-1">
                      <button
                        id="qty-minus-btn"
                        type="button"
                        onClick={decrementQty}
                        className="p-1 px-3 text-white/50 hover:text-white transition-colors cursor-pointer"
                        title="Reduce quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center font-mono font-black text-xs text-white">
                        {quantity}
                      </span>
                      <button
                        id="qty-plus-btn"
                        type="button"
                        onClick={incrementQty}
                        className="p-1 px-3 text-white/50 hover:text-white transition-colors cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <button
                    id="add-to-bag-btn"
                    type="submit"
                    disabled={addingToBag}
                    className="flex-1 h-[48px] flex items-center justify-center gap-2 rounded-none bg-white text-black hover:bg-neutral-200 active:scale-[0.98] font-mono text-xs font-black tracking-widest transition-all duration-200 cursor-pointer uppercase"
                  >
                    {addingToBag ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4.5 h-4.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        COMMITTING...
                      </span>
                    ) : addConfirmed ? (
                      <span className="flex items-center gap-1 text-neutral-800 font-black">
                        <Check size={16} />
                        ADDED TO BAG!
                      </span>
                    ) : (
                      <>
                        <span>ADD TO BAG_</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>

                  {product.whatsappLink && (
                    <a
                      href={product.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-[48px] px-5 flex items-center justify-center gap-2 rounded-none bg-[#25D366] hover:bg-[#20ba59] text-white active:scale-[0.98] font-mono text-xs font-black tracking-widest transition-all duration-200 cursor-pointer uppercase border border-[#25D366]"
                      title="Order directly on WhatsApp"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.48-.002 9.936-4.436 9.938-9.911.001-2.652-1.03-5.145-2.903-7.02C16.436 1.848 13.945 1.02 11.999 1.02 6.522 1.02 2.066 5.454 2.064 10.93c-.001 1.516.417 2.999 1.21 4.316l-.993 3.626 3.766-.978zM17.487 14.39c-.3-.15-1.774-.875-2.046-.974-.272-.1-.47-.15-.667.15-.197.3-.762.974-.934 1.171-.173.197-.347.222-.647.072-3.003-1.5-4.48-2.6-5.617-4.55-.3-.518-.03-.8.271-1.1.272-.271.603-.7.904-1.05.3-.35.4-.599.6-.999.2-.4.1-.75-.05-1.05-.15-.3-.667-1.607-.914-2.204-.24-.579-.485-.5-.667-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.774-.726 2.022-1.429.247-.699.247-1.299.173-1.428-.074-.13-.272-.21-.572-.36z"/>
                      </svg>
                      <span className="hidden sm:inline">WHATSAPP</span>
                    </a>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-2 text-[8px] font-mono text-[#8e8e93] font-bold justify-center uppercase tracking-widest">
                  <ShieldCheck size={11} className="text-white" />
                  <span>SECURE SIGNATURE VERIFICATION UPON PARCEL DROP</span>
                </div>
              </form>
            ) : (
              /* RESTOCK / WAITLIST FORM for archive sold out pieces */
              <div className="mt-auto pt-5 border-t border-white/10">
                <div className="bg-black border border-white/20 p-5 rounded-none flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-white">
                    <Mail size={15} />
                    <span className="font-mono text-xs font-black tracking-widest uppercase">ARCHIVE WAITLIST RESTOCK_</span>
                  </div>
                  <p className="text-[11px] text-[#8e8e93] leading-relaxed font-sans font-bold uppercase tracking-wider">
                    Drop is complete and archived. Provide your email box details to receive coordinates if uncommitted items become available.
                  </p>

                  {waitlistSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border border-white/30 bg-white/5 p-3 rounded-none flex items-center gap-2"
                    >
                      <Check size={16} className="text-white" />
                      <span className="font-mono text-[10px] font-black text-white uppercase tracking-widest">YOU WILL BE NOTIFIED FIRST_</span>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleWaitlistSubmit} className="flex gap-2.5 mt-2">
                      <input
                        id="waitlist-email-input"
                        type="email"
                        required
                        placeholder="ENTER EMAIL COORDINATES"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="flex-1 bg-[#121212] border border-white/20 px-3 py-2 text-xs font-mono text-white focus:border-white outline-none rounded-none placeholder-white/30 uppercase tracking-wider"
                      />
                      <button
                        id="waitlist-submit-btn"
                        type="submit"
                        className="bg-white text-black px-4 font-mono text-xs font-black rounded-none hover:bg-neutral-200 active:scale-95 transition-all duration-250 cursor-pointer"
                      >
                        SUBMIT_
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Close / Back to Collection button */}
            <button
              onClick={onClose}
              className="mt-8 w-full py-3.5 bg-transparent border border-white/10 hover:border-white/30 text-white font-mono text-xs font-bold tracking-widest transition-all duration-200 cursor-pointer uppercase flex items-center justify-center gap-2 md:hidden"
            >
              <span>← BACK TO COLLECTION</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
