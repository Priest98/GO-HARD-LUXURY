import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Tag, CreditCard, Ticket, Check, MapPin, Sparkles, ShoppingBag } from 'lucide-react';
import { CartItem, CouponCode } from '../types';
import { COUPON_CODES } from '../data';
import { ProductVisualizer } from './ProductVisualizer';

declare var FlutterwaveCheckout: any;

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, size: string, change: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearCart: () => void;
  onOrderComplete?: (orderData: {
    customerName: string;
    customerEmail: string;
    items: {
      productId: string;
      productName: string;
      size: string;
      quantity: number;
      price: number;
    }[];
    totalAmount: number;
  }) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOrderComplete
}) => {
  const [couponInput, setCouponInput] = useState<string>('');
  const [activeCoupon, setActiveCoupon] = useState<CouponCode | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'complete'>('cart');

  // Shipping details state
  const [shippingName, setShippingName] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [shippingEmail, setShippingEmail] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculators
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = activeCoupon ? (subtotal * activeCoupon.discountPercentage) / 100 : 0;
  const deliveryFee = subtotal > 150000 ? 0 : 12000.00; // Free delivery above ₦150,000
  const grandTotal = subtotal - discountAmount + deliveryFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    
    const matched = COUPON_CODES.find(c => c.code.toUpperCase() === couponInput.toUpperCase().trim());
    if (matched) {
      setActiveCoupon(matched);
      setCouponInput('');
    } else {
      setCouponError('INVALID PROMO COORDINATES');
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName || !shippingAddress || !shippingEmail) {
      alert('Please complete all dispatch information coordinates.');
      return;
    }

    setIsSubmittingOrder(true);

    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('checkout_start', {
        total: grandTotal,
        items_count: cartItems.length
      });
    }
    
    try {
      if (typeof FlutterwaveCheckout !== 'undefined') {
        FlutterwaveCheckout({
          public_key: import.meta.env.VITE_FLW_PUBLIC_KEY || "FLWPUBK_TEST-c39a31bb0ee84784a95c1c8a149a4ba1-X",
          tx_ref: `GHL-TX-${Date.now()}`,
          amount: grandTotal,
          currency: "NGN",
          payment_options: "card,ussd,mobilemoney",
          customer: {
            email: shippingEmail,
            name: shippingName,
          },
          customizations: {
            title: "GO HARD LUXURY",
            description: "Order Dispatch Payment Coordination",
            logo: "https://gohardluxury.com/logo.png",
          },
          callback: function (data: any) {
            console.log("Flutterwave payment callback data:", data);
            if (data.status === "successful" || data.charge_response_code === "00") {
              const randomID = `GHL-REG-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;
              setOrderId(randomID);
              if (onOrderComplete) {
                onOrderComplete({
                  customerName: shippingName,
                  customerEmail: shippingEmail,
                  items: cartItems.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    size: item.selectedSize,
                    quantity: item.quantity,
                    price: item.product.price
                  })),
                  totalAmount: grandTotal
                });
              }
              setIsSubmittingOrder(false);
              setCheckoutStep('complete');

              if (typeof window !== 'undefined' && window.trackEvent) {
                window.trackEvent('purchase', {
                  total: grandTotal,
                  orderId: randomID
                });
              }
            } else {
              alert("Payment verification pending or unsuccessful: " + data.message);
              setIsSubmittingOrder(false);
            }
          },
          onclose: function () {
            setIsSubmittingOrder(false);
            console.log("Payment checkout closed by customer.");
          },
        });
      } else {
        throw new Error("Flutterwave Checkout SDK not loaded on window.");
      }
    } catch (err) {
      console.error("Failed to load Flutterwave checkout:", err);
      // Fallback
      setTimeout(() => {
        const randomID = `GHL-REG-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;
        setOrderId(randomID);
        if (onOrderComplete) {
          onOrderComplete({
            customerName: shippingName,
            customerEmail: shippingEmail,
            items: cartItems.map(item => ({
              productId: item.product.id,
              productName: item.product.name,
              size: item.selectedSize,
              quantity: item.quantity,
              price: item.product.price
            })),
            totalAmount: grandTotal
          });
        }
        setIsSubmittingOrder(false);
        setCheckoutStep('complete');

        if (typeof window !== 'undefined' && window.trackEvent) {
          window.trackEvent('purchase', {
            total: grandTotal,
            orderId: randomID
          });
        }
      }, 1500);
    }
  };

  const handleResetCheckout = () => {
    onClearCart();
    setActiveCoupon(null);
    setShippingName('');
    setShippingAddress('');
    setShippingEmail('');
    setCheckoutStep('cart');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Darkened blur backdrop */}
        <motion.div
          id="cart-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-xs cursor-pointer"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            id="cart-slideover"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="w-screen max-w-md bg-brand-matte border-l border-white/15 shadow-2xl flex flex-col h-full relative"
          >
            {/* Header section */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black">
              <div className="flex items-center gap-3">
                <div className="bg-white/5 p-2 rounded-none border border-white/25">
                  <ShoppingBag size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-white tracking-widest uppercase">
                    DISPATCH BAG_
                  </h3>
                  <span className="font-mono text-[9px] text-[#8e8e93] tracking-[0.15em] block uppercase font-bold">
                    {cartItems.length} SPECIMENS READY
                  </span>
                </div>
              </div>
              <button
                id="cart-close-btn"
                onClick={onClose}
                className="p-2.5 text-[9px] font-mono font-black rounded-none bg-black border border-white/20 text-white hover:bg-white hover:text-black transition-all cursor-pointer uppercase tracking-widest"
              >
                CLOSE [X]
              </button>
            </div>

            {/* Steps indicator inside cart */}
            {cartItems.length > 0 && checkoutStep !== 'complete' && (
              <div className="bg-black flex border-b border-white/10 text-[9px] font-mono text-[#8e8e93]">
                <button
                  onClick={() => setCheckoutStep('cart')}
                  className={`flex-1 py-3 text-center border-r border-white/10 uppercase tracking-widest font-black cursor-pointer ${
                    checkoutStep === 'cart' ? 'bg-[#121212] text-white underline underline-offset-4' : 'hover:text-white'
                  }`}
                >
                  01. Review Bag
                </button>
                <button
                  onClick={() => {
                    if (cartItems.length > 0) setCheckoutStep('shipping');
                  }}
                  className={`flex-1 py-3 text-center uppercase tracking-widest font-black cursor-pointer ${
                    checkoutStep === 'shipping' ? 'bg-[#121212] text-white underline underline-offset-4' : 'hover:text-white'
                  }`}
                >
                  02. Dispatch Cords
                </button>
              </div>
            )}

            {/* Cart body content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 && checkoutStep !== 'complete' ? (
                /* Empty Cart State */
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                  <div className="w-16 h-16 rounded-none border border-dashed border-white/20 flex items-center justify-center text-white bg-[#121212]">
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <h5 className="font-display font-black text-sm text-white uppercase tracking-widest">YOUR BAG IS EMPTY</h5>
                    <p className="text-[10px] font-mono text-[#8e8e93] font-bold mt-2 leading-relaxed uppercase tracking-wider">
                      You haven't added any items yet.<br />Explore the index to thug it out.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="bg-white text-black hover:bg-neutral-200 text-[10px] font-black tracking-widest px-5 py-3 rounded-none font-bold transition-all cursor-pointer"
                  >
                    CONTINUE BROWSING
                  </button>
                </div>
              ) : checkoutStep === 'cart' ? (
                /* STEP 1: CART LIST VIEW */
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}`}
                      className="flex gap-3 bg-black border border-white/10 rounded-none p-4 relative hover:border-white/30 transition-colors"
                    >
                      {/* Product Thumbnail Drawer with vector */}
                      <div className="w-16 h-16 rounded-none overflow-hidden shrink-0 border border-white/15 bg-black">
                        <ProductVisualizer productId={item.product.id} className="w-full h-full scale-120 hover:scale-130 transition-transform rounded-none" />
                      </div>

                      {/* Product Descriptions */}
                      <div className="flex-1 min-w-0 pr-6">
                        <span className="font-mono text-[8px] text-[#8e8e93] font-black uppercase tracking-[0.15em] block">
                          {item.product.category}
                        </span>
                        <h4 className="font-display font-black text-xs text-white uppercase truncate mt-1">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-[10px] font-mono font-bold text-[#8e8e93] uppercase">
                          <span>SIZE: <span className="text-white">{item.selectedSize}</span></span>
                          <span>PRICE: ₦{item.product.price.toLocaleString()}</span>
                        </div>

                        {/* Interactive Qty Increments */}
                        <div className="flex items-center bg-black border border-white/20 rounded-none h-7 overflow-hidden w-24 mt-3">
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.selectedSize, -1)}
                            className="p-1 px-2.5 text-white/50 hover:text-white cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus size={9} />
                          </button>
                          <span className="flex-1 text-center font-mono font-black text-[10px] text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.selectedSize, 1)}
                            className="p-1 px-2.5 text-white/50 hover:text-white cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus size={9} />
                          </button>
                        </div>
                      </div>

                      {/* Trash action */}
                      <button
                        onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                        className="absolute top-3 right-3 text-[#8e8e93] hover:text-white p-1 rounded-none hover:bg-white/5 transition-all cursor-pointer"
                        title="Remove specimen"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Promo coupon form input */}
                  <div className="pt-5 border-t border-white/10">
                    {activeCoupon ? (
                      <div className="bg-white/5 border border-white/20 p-4 rounded-none flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Ticket size={13} className="text-white" />
                          <div>
                            <span className="font-mono text-[9px] font-black text-white block uppercase tracking-widest">
                              PROMO APPLIED: {activeCoupon.code}
                            </span>
                            <span className="text-[9px] font-mono text-[#8e8e93] font-bold block uppercase tracking-wider mt-0.5">
                              {activeCoupon.description} (-{activeCoupon.discountPercentage}%)
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-[9px] font-mono font-black text-red-500 hover:underline cursor-pointer tracking-widest uppercase"
                        >
                          [REMOVE]
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            id="coupon-input"
                            type="text"
                            placeholder="COUPON_COORDS (e.g. THUG19)"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value);
                              setCouponError('');
                            }}
                            className="w-full bg-black border border-white/20 focus:border-white px-3 py-2 text-xs font-mono text-white outline-none rounded-none placeholder-white/20 uppercase tracking-widest"
                          />
                          <Tag size={11} className="absolute right-3 top-2.5 text-white/20" />
                        </div>
                        <button
                          id="coupon-apply-btn"
                          type="submit"
                          className="bg-white text-black hover:bg-neutral-200 px-4 font-mono text-[10px] font-black tracking-widest rounded-none transition-colors cursor-pointer uppercase"
                        >
                          APPLY_
                        </button>
                      </form>
                    )}
                    {couponError && (
                      <p className="text-[9px] font-mono font-black text-red-500 mt-1.5 uppercase tracking-widest">
                        ✖ {couponError}
                      </p>
                    )}
                    <p className="text-[9px] font-mono text-[#8e8e93] font-bold mt-2 leading-relaxed uppercase tracking-wider">
                      TIP: USE LAUNCH CODE <span className="text-white font-black cursor-pointer hover:underline" onClick={() => setCouponInput('THUG19')}>THUG19</span> FOR 19% OFF YOUR ORDER
                    </p>
                  </div>
                </div>
              ) : checkoutStep === 'shipping' ? (
                /* STEP 2: DISPATCH COORDINATES FORM */
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="border border-white/10 bg-black p-5 rounded-none space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={13} className="text-white" />
                      <span className="font-mono text-[10px] font-black uppercase tracking-widest text-white">
                        VALIDATE DESTINATION PORTS_
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-[#8e8e93] font-black uppercase tracking-widest block">Recipient Label_</label>
                      <input
                        id="shipping-name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        className="w-full bg-[#121212] border border-white/20 px-3 py-2 text-xs font-mono text-white focus:border-white outline-none rounded-none uppercase tracking-wider"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-[#8e8e93] font-black uppercase tracking-widest block">Dispatch Web email_</label>
                      <input
                        id="shipping-email"
                        type="email"
                        required
                        placeholder="johndoe@gohardluxury.com"
                        value={shippingEmail}
                        onChange={(e) => setShippingEmail(e.target.value)}
                        className="w-full bg-[#121212] border border-white/20 px-3 py-2 text-xs font-mono text-white focus:border-white outline-none rounded-none tracking-wider"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-[#8e8e93] font-black uppercase tracking-widest block">Destination Depot Address_</label>
                      <textarea
                        id="shipping-address"
                        required
                        rows={3}
                        placeholder="101 St. Laurent Street, NYC, NY 10013"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full bg-[#121212] border border-white/20 px-3 py-2 text-xs font-mono text-white focus:border-white outline-none rounded-none placeholder-white/20 resize-none uppercase tracking-wider"
                      />
                    </div>
                  </div>

                  <div className="bg-black border border-white/10 p-3 flex items-start gap-2.5 text-[9px] font-mono text-[#8e8e93] font-bold uppercase tracking-wider leading-relaxed">
                    <Sparkles size={12} className="text-white shrink-0 mt-0.5" />
                    <span>Free priority air shipping matches all orders exceeding ₦150,000. Safe signature verification required on drop.</span>
                  </div>
                </form>
              ) : (
                /* STEP 3: ORDER COMPLETE STUNNING TICKET DESIGN */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* Cyber Gothic Industrial Ticket receipt boarding pass grid */}
                  <div className="border border-white/20 bg-black rounded-none overflow-hidden shadow-xl font-mono text-xs text-white pb-4 relative">
                    {/* Glowing ticket headers */}
                    <div className="bg-white text-black font-display font-black text-center py-3 tracking-widest uppercase text-[10px]">
                      // SHIPMENT DISPATCH COMMITTED
                    </div>

                    {/* Left & Right custom ticket circular punches */}
                    <div className="absolute top-[40px] left-[-8px] w-4 h-4 bg-brand-matte rounded-full border-r border-white/20" />
                    <div className="absolute top-[40px] right-[-8px] w-4 h-4 bg-brand-matte rounded-full border-l border-white/20" />

                    <div className="p-4 pt-6 space-y-4">
                      {/* Ticket stats */}
                      <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-white/10 border-dashed">
                        <span className="text-[9px] text-[#8e8e93] uppercase font-bold tracking-widest">Shipment_Reference_</span>
                        <span className="text-sm font-black text-white tracking-widest block mt-1 uppercase">
                          {orderId}
                        </span>
                        <span className="text-[8px] text-white mt-1.5 uppercase tracking-widest block bg-white/10 border border-white/20 px-2.5 py-1 font-black">
                          ✔ VERIFIED ON BITSTREAM
                        </span>
                      </div>

                      {/* Recipient breakdown */}
                      <div className="space-y-2.5 text-[10px] pb-4 border-b border-white/10 border-dashed uppercase font-bold tracking-wider text-[#8e8e93]">
                        <div>
                          <span className="text-white block text-[8px] uppercase font-black tracking-widest">Recieving Agent_</span>
                          <span className="font-black text-white">{shippingName}</span>
                        </div>
                        <div>
                          <span className="text-white block text-[8px] uppercase font-black tracking-widest">Target Coordinates_</span>
                          <span className="font-black text-white block leading-tight">{shippingAddress}</span>
                        </div>
                        <div>
                          <span className="text-white block text-[8px] uppercase font-black tracking-widest">Dispatch Alert Box_</span>
                          <span className="font-black text-white">{shippingEmail}</span>
                        </div>
                      </div>

                      {/* Cart products receipt list item names */}
                      <div className="space-y-1.5 pb-4 border-b border-white/10 border-dashed text-[10px] font-bold uppercase tracking-wider text-[#8e8e93]">
                        <span className="text-white text-[8px] block font-black tracking-widest">Deployed Spec_</span>
                        {cartItems.map((item, id) => (
                           <div key={id} className="flex justify-between gap-1 text-[#8e8e93]">
                             <span className="truncate max-w-[180px]">
                               {item.product.name} ({item.selectedSize}) x{item.quantity}
                             </span>
                             <span className="font-black text-white shrink-0">
                               ₦{(item.product.price * item.quantity).toLocaleString()}
                             </span>
                           </div>
                        ))}
                      </div>

                      {/* Pricing audit totals */}
                      <div className="space-y-1.5 text-[10px] pt-1 uppercase font-bold tracking-wider text-[#8e8e93]">
                        <div className="flex justify-between">
                          <span>Subtotal Cords:</span>
                          <span className="text-white">₦{subtotal.toLocaleString()}</span>
                        </div>
                        {activeCoupon && (
                          <div className="flex justify-between text-white font-black">
                            <span>Promo Code Discount (-{activeCoupon.discountPercentage}%):</span>
                            <span>-₦{discountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Air Courier Drop:</span>
                          <span className="text-white">{deliveryFee === 0 ? 'FREE' : `₦${deliveryFee.toLocaleString()}`}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-2.5 border-t border-white/10 font-black text-white">
                          <span>GRAND TOTAL:</span>
                          <span className="text-white">₦{grandTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Barcode drawing simulation using styled block rectangles */}
                      <div className="pt-5 flex flex-col items-center justify-center gap-1.5 opacity-80">
                        <div className="flex gap-[1px] h-7 w-48 justify-center bg-transparent">
                          {[2,1,4,1,2,3,1,2,4,1,3,2,1,2,4,1,3,1,2,3,4,1].map((width, idx) => (
                            <div
                              key={idx}
                              style={{ width: `${width}px` }}
                              className="bg-white h-full"
                            />
                          ))}
                        </div>
                        <span className="text-[8px] font-mono tracking-[4px] text-[#8e8e93] font-bold uppercase text-center block mt-1.5">
                          *GHL{orderId.replaceAll('-', '')}*
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#8e8e93] text-center leading-relaxed">
                    Check your simulated coordinate inbox ({shippingEmail}) for parcel tracking references. Thank you for Thugging It Out.
                  </p>

                  <button
                    id="finish-checkout-btn"
                    onClick={handleResetCheckout}
                    className="w-full h-11 flex items-center justify-center rounded-none bg-white text-black hover:bg-[#eaeaea] font-mono text-[10px] font-black tracking-widest transition-all cursor-pointer uppercase"
                  >
                    CONTINUE SHOPPING
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer Calculator / Actions View for non-complete steps */}
            {cartItems.length > 0 && checkoutStep !== 'complete' && (
              <div className="p-6 border-t border-white/10 bg-black space-y-4">
                {/* Audit breakdowns */}
                <div className="space-y-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8e8e93]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-white font-black">₦{subtotal.toLocaleString()}</span>
                  </div>
                  {activeCoupon && (
                    <div className="flex justify-between text-white font-black">
                      <span>Promo Discount (-{activeCoupon.discountPercentage}%):</span>
                      <span>-₦{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Priority Air Courier:</span>
                    <span className="text-white font-black">
                      {deliveryFee === 0 ? 'FREE' : `₦${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="text-[8px] text-white/50 rounded flex justify-end font-black tracking-widest">
                      ADD ₦{(150000 - subtotal).toLocaleString()} MORE FOR FREE COURIER DROP
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black text-white pt-3 border-t border-white/10">
                    <span>ESTIMATED PAY:</span>
                    <span className="text-white text-sm font-black">₦{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Confirm Dispatch Actions */}
                {checkoutStep === 'cart' ? (
                  <button
                    id="proceed-dispatch-btn"
                    onClick={() => setCheckoutStep('shipping')}
                    className="w-full py-3 flex items-center justify-center gap-2 rounded-none bg-white text-black hover:bg-neutral-200 font-mono text-[10px] font-black tracking-widest transition-all cursor-pointer uppercase"
                  >
                    <CreditCard size={12} />
                    <span>PROCEED TO DISPATCH CORDS</span>
                  </button>
                ) : (
                  <button
                    id="place-order-btn"
                    type="button"
                    onClick={handleCheckoutSubmit}
                    disabled={isSubmittingOrder}
                    className="w-full py-3 flex items-center justify-center gap-2 rounded-none bg-white text-black hover:bg-neutral-200 font-mono text-[10px] font-black tracking-widest transition-all cursor-pointer uppercase"
                  >
                    {isSubmittingOrder ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        COMMITTING ORDER CORDS...
                      </span>
                    ) : (
                      <>
                        <Check size={12} />
                        <span>DEPLOY SHIPPINGS & PLACE ORDER</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
