import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Globe, Flame, SlidersHorizontal, ArrowDown, ExternalLink, RefreshCw, Sun, Moon } from 'lucide-react';
import { GHL_PRODUCTS } from './data';
import { Product, CartItem, SortOption } from './types';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartSidebar } from './components/CartSidebar';

export default function App() {
  // State elements
  const [products, setProducts] = useState<Product[]>(GHL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [viewedProduct, setViewedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);

  // Theme state: day vs. night
  const [theme, setTheme] = useState<'day' | 'night'>(() => {
    const stored = localStorage.getItem('GHL_THEME');
    if (stored === 'day' || stored === 'night') return stored;
    return 'night'; // default to Dark (night) theme
  });

  // Apply theme class to Document Root (HTML / :root element)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'day') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('GHL_THEME', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'night' ? 'day' : 'night'));
  };

  // Tactical Live Clock UTC Timer
  const [currentTime, setCurrentTime] = useState<Date>(new Date("2026-06-06T08:53:30Z"));



  // Initialize and update UTC time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prev => new Date(prev.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update filtered, searched, and sorted product lists
  const filteredProducts = products
    .filter(p => {
      const matchCategory = selectedCategory === 'ALL' || p.category.toUpperCase() === selectedCategory.toUpperCase();
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      // Default: newest drop - based on releaseDate strings
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });

  // Load cart from localStorage on init
  useEffect(() => {
    const stored = localStorage.getItem('GHL_DISPATCH_BAG');
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse dispatch bag indices', e);
      }
    }
  }, []);

  // Sync cart to localStorage
  const syncCart = (newCart: CartItem[]) => {
    setCartItems(newCart);
    localStorage.setItem('GHL_DISPATCH_BAG', JSON.stringify(newCart));
  };

  // Add item to cart
  const handleAddToCart = (product: Product, size: string, quantity: number) => {
    const existingIndex = cartItems.findIndex(
      item => item.product.id === product.id && item.selectedSize === size
    );

    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart = [...cartItems, { product, selectedSize: size, quantity }];
    }

    syncCart(updatedCart);
  };

  // Quick direct add from card
  const handleAddToCartDirectly = (product: Product, size: string) => {
    handleAddToCart(product, size, 1);
    // Open cart automatically to show feedback
    setIsCartOpen(true);
  };

  // Update item quantity in cart
  const handleUpdateQty = (productId: string, size: string, change: number) => {
    const updatedCart = cartItems
      .map(item => {
        if (item.product.id === productId && item.selectedSize === size) {
          const newQty = item.quantity + change;
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter(item => item.quantity > 0);

    syncCart(updatedCart);
  };

  // Remove item from cart
  const handleRemoveItem = (productId: string, size: string) => {
    const updatedCart = cartItems.filter(
      item => !(item.product.id === productId && item.selectedSize === size)
    );
    syncCart(updatedCart);
  };

  // Clean whole cart
  const handleClearCart = () => {
    syncCart([]);
  };

  // Scroll smoothly to drop collections
  const scrollToCollection = () => {
    const collectionsElement = document.getElementById('collection-rack');
    if (collectionsElement) {
      collectionsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };



  const getCartTotalQty = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-brand-matte relative text-brand-offwhite selection:bg-brand-neon selection:text-brand-matte font-sans">
      {/* Structural Faint Background Grid Lines from Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/12 md:left-1/4 w-px h-full bg-white/5" />
        <div className="absolute top-0 right-1/12 md:right-1/4 w-px h-full bg-white/5" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-white/5" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-white/5" />
      </div>

      {/* Upper Tactical Ticker Bar */}
      <div className="bg-brand-darkgray/90 text-[10px] uppercase font-mono py-2.5 px-4 md:px-8 border-b border-white/10 flex flex-wrap justify-end items-center gap-2 relative z-20">
        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-1">
            <Globe size={11} className="text-white/60" />
            <span className="opacity-60 font-medium tracking-wider">UTC TIMESTAMP: {currentTime.toISOString().replace('T', ' ').substring(0, 19)}</span>
          </div>
        </div>
      </div>

      {/* Main Elegant Header */}
      <header id="store-main-header" className="sticky top-0 z-30 bg-brand-matte/95 backdrop-blur-md border-b border-white/10 py-5 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <h1 className="font-display font-black text-lg sm:text-2xl tracking-tighter text-brand-offwhite uppercase hover:text-white/80 transition-colors cursor-pointer" onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}>
              GO HARD LUXURY
            </h1>
            <span className="font-mono text-[7px] text-brand-lightgray uppercase tracking-[0.4em] leading-none font-bold">
              ESTABLISHED IN 2019
            </span>
          </div>
        </div>

        {/* Categories desktop tabs links */}
        <nav className="hidden md:flex items-center gap-12 text-[10px] uppercase tracking-[0.2em] font-black">
          {['ALL', 'POLOS', 'DENIM', 'TEES', 'ACCESSORIES'].map((cat) => (
            <button
              id={`nav-tab-${cat}`}
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                scrollToCollection();
              }}
              className={`pb-1 hover-line uppercase transition-all relative cursor-pointer ${
                selectedCategory === cat ? 'text-brand-offwhite font-black underline underline-offset-4 decoration-2' : 'text-brand-lightgray hover:text-brand-offwhite'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Action interfaces */}
        <div className="flex items-center gap-4">
          {/* Custom Day and Night switch deck */}
          <button
            id="toggle-theme-btn"
            onClick={toggleTheme}
            className="p-2.5 transition-all cursor-pointer border bg-[#121212] border-white/10 text-brand-lightgray hover:text-brand-offwhite hover:border-white/30 flex items-center gap-1.5"
            style={{ borderRadius: '0px' }}
            title={`Switch to ${theme === 'night' ? 'day' : 'night'} display perspective`}
          >
            {theme === 'night' ? (
              <>
                <Sun size={13} className="text-brand-offwhite" />
                <span className="font-mono text-[9px] font-black uppercase tracking-wider hidden sm:inline">DAY_MODE</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-brand-offwhite" />
                <span className="font-mono text-[9px] font-black uppercase tracking-wider hidden sm:inline">NIGHT_MODE</span>
              </>
            )}
          </button>

          {/* Quick Search toggle */}
          <button
            id="toggle-search-btn"
            onClick={() => setIsSearchVisible(prev => !prev)}
            className={`p-2.5 transition-all cursor-pointer border ${
              isSearchVisible 
                ? 'bg-white text-black border-white' 
                : 'bg-[#121212] border-white/10 text-brand-lightgray hover:text-brand-offwhite hover:border-white/30'
            }`}
            style={{ borderRadius: '0px' }}
            title="Search collection"
          >
            <Search size={14} />
          </button>



          {/* Tactical bag counter */}
          <button
            id="toggle-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="bg-white text-black hover:bg-neutral-200 px-4 py-2 flex items-center gap-2 transition-all cursor-pointer active:scale-95 font-black text-xs uppercase tracking-widest"
            style={{ borderRadius: '0px' }}
          >
            <ShoppingBag size={14} className="stroke-[3.5]" />
            <span className="font-mono text-xs">{getCartTotalQty()}</span>
          </button>
        </div>
      </header>

      {/* Hero Presentation Drop Segment */}
      <section id="hero-banner-section" className="relative h-[85vh] min-h-[480px] sm:min-h-[580px] flex flex-col justify-between items-stretch py-12 px-6 md:px-12 text-left overflow-hidden border-b border-white/10 z-10 bg-[#080808]">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-40"
        >
          <source src="/video/SaveClip.App_AQMNLLCOZx9fTFK3FwpUwBbLXY_YghRBoOy3hXzNcIETEuC6RS3rLLlRf25T3rHV7gddLaq6yVC83NKbvLi672p_CxBwfD3450dxLQs.mp4" type="video/mp4" />
        </video>

        {/* Ambient top dark shade overlay */}
        <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/80 to-transparent z-0 pointer-events-none" />

        {/* Theme large transparent background heading text stroke - GO HARD LUXURY */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none select-none overflow-hidden">
          <h1 className="text-[25vw] md:text-[22vw] font-black tracking-tighter leading-[0.7] uppercase outline-text select-none">
            <span className="whitespace-nowrap">GO HARD</span> LUXURY
          </h1>
        </div>

        {/* Top left grid reference info */}
        <div className="flex justify-between items-start z-10 w-full relative">
          <div className="max-w-md">
            <span className="text-xs sm:text-sm md:text-base uppercase tracking-widest block font-black mb-2">FEATURED ARCHIVE_</span>
            <p className="text-xs sm:text-sm leading-relaxed opacity-75">
              Curating the intersection of street culture and technical precision. Designed for the unseen.
            </p>
          </div>
        </div>

        {/* Medium centered message title with extremely bold font sizing style */}
        <div className="my-auto z-10 relative flex flex-col items-center text-center">
          <h2
            className="font-display font-black text-5xl sm:text-8xl md:text-9xl tracking-tighter uppercase text-white leading-[0.8] mb-6"
          >
            GO HARD LUX<span className="text-white">.</span>
          </h2>
          <p
            className="max-w-xl text-xs md:text-sm tracking-wide leading-relaxed opacity-70 mb-8"
          >
            "Remember one thing. Through every dark night, there's a bright day after."
          </p>
        </div>

        {/* Drop details drawer segment */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 z-10 w-full relative mt-auto pt-6 border-t border-white/5">
          <div className="flex gap-4 items-end">
            <div className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none text-white select-none">19.</div>
            <div className="pb-1.5">
              <span className="text-[9px] uppercase tracking-widest block opacity-40">CURRENTLY DROPPING</span>
              <span className="text-xs font-black uppercase tracking-wider text-white">TECH-NYLON & INDUSTRIAL DENIMS_</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button
               id="hero-explore-btn"
              onClick={scrollToCollection}
              className="bg-white text-black hover:bg-neutral-200 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer w-full sm:w-auto text-center"
              style={{ borderRadius: '0px' }}
            >
              View Lookbook
            </button>
          </div>
        </div>
      </section>

      {/* Main product showcase rack */}
      <main id="collection-rack" className="max-w-7xl mx-auto py-12 px-4 md:px-8 space-y-8">
        {/* Dynamic Search view drawer when toggled active */}
        <AnimatePresence>
          {isSearchVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-brand-darkgray border border-brand-midgray/30 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                  <input
                    id="search-input-field"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ENTER COORDS TO QUERY RACK..."
                    className="w-full bg-brand-matte border border-brand-midgray/60 focus:border-brand-neon px-4 py-3 text-xs font-mono text-brand-offwhite placeholder-brand-lightgray/35 outline-none rounded-xl uppercase tracking-wider"
                  />
                  {searchQuery && (
                    <button
                      id="search-clear-btn"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3.5 text-xs font-mono text-red-400 hover:text-white"
                    >
                      [CLEAR]
                    </button>
                  )}
                </div>
                <div className="text-xs font-mono text-brand-lightgray shrink-0">
                  REF: {filteredProducts.length} SPECIMENS DETECTED
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and sorting layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-brand-midgray/15">
          {/* Leftside: category tags scrolling container */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <SlidersHorizontal size={13} className="text-brand-lightgray shrink-0 mr-1.5 hidden sm:inline" />
            {['ALL', 'POLOS', 'DENIM', 'TEES', 'ACCESSORIES'].map((category) => (
              <button
                id={`filter-pill-${category}`}
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-2 rounded-lg font-mono text-xs uppercase cursor-pointer whitespace-nowrap transition-all border ${
                  selectedCategory === category
                    ? 'bg-brand-neon text-brand-matte border-brand-neon font-black'
                    : 'bg-brand-darkgray/30 border-brand-midgray/25 text-brand-lightgray hover:border-brand-lightgray hover:text-brand-offwhite'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Right side: Sort option picker */}
          <div className="flex items-center gap-2 w-full md:w-auto self-end md:self-auto justify-between md:justify-start">
            <span className="font-mono text-[10px] text-brand-lightgray uppercase tracking-widest">
              Arrange_Racks:
            </span>
            <select
              id="sort-option-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-brand-darkgray border border-brand-midgray/40 text-brand-offwhite text-xs font-mono px-3 py-2 rounded-lg outline-none focus:border-brand-neon cursor-pointer"
            >
              <option value="newest">DROP SEQUENCE (NEWEST)</option>
              <option value="price-asc">COORDINATION PRICE (LOW-HIGH)</option>
              <option value="price-desc">COORDINATION PRICE (HIGH-LOW)</option>
              <option value="name-asc">LABEL ALPHABETICAL (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Main interactive grid cards list */}
        {filteredProducts.length > 0 ? (
          <div id="products-interactive-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={(p) => setViewedProduct(p)}
                onAddToCartDirectly={handleAddToCartDirectly}
              />
            ))}
          </div>
        ) : (
          /* Empty Search results framework matches */
          <div className="border border-dashed border-brand-midgray/40 rounded-2xl p-16 text-center max-w-md mx-auto space-y-3 bg-brand-darkgray/10">
            <span className="font-mono text-lg text-brand-neon block font-extrabold uppercase tracking-wider">
              ✖ ZERO SPECIMENS DETECTED
            </span>
            <p className="text-xs font-mono text-brand-lightgray leading-relaxed uppercase">
              The query variables did not match any inventory index coords in the active drop catalogs.
            </p>
            <button
              id="reset-search-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="bg-brand-midgray hover:bg-brand-lightgray text-brand-offwhite hover:text-brand-matte font-mono text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer mt-2"
            >
              RESET COORDINATES
            </button>
          </div>
        )}
      </main>

      {/* Streetwear Inspirational Footer Quote with Brand info */}
      <footer id="store-main-footer" className="bg-brand-darkgray border-t border-brand-midgray/25 py-12 px-4 md:px-8 mt-12 text-xs font-mono">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3.5">
            <h4 className="font-display font-black text-sm text-brand-offwhite tracking-wider uppercase">
              GO HARD LUXURY // GHL
            </h4>
            <p className="text-[11px] text-brand-lightgray leading-relaxed font-sans normal-case">
              Bringing luxury streetwear through industrial aesthetics and raw, message-driven drops. Thuggin since Day One.
            </p>
            <div className="text-[9px] text-brand-neon uppercase font-bold">
              ESTABLISHED IN 2019 // #1of1
            </div>
          </div>

          <div className="space-y-3.5">
            <h5 className="font-mono font-bold text-xs text-brand-offwhite tracking-wider uppercase">
              DROP COORDINATES_
            </h5>
            <ul className="space-y-1.5 text-brand-lightgray text-[11px]">
              <li className="hover:text-brand-neon cursor-pointer" onClick={() => setSelectedCategory('ALL')}>ALL COLLECTIONS</li>
              <li className="hover:text-brand-neon cursor-pointer" onClick={() => setSelectedCategory('POLOS')}>GHL POLO SERIES</li>
              <li className="hover:text-brand-neon cursor-pointer" onClick={() => setSelectedCategory('DENIM')}>STONED DENIMS</li>
              <li className="hover:text-brand-neon cursor-pointer" onClick={() => setSelectedCategory('TEES')}>PUFF PRINT TEES</li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h5 className="font-mono font-bold text-xs text-brand-offwhite tracking-wider uppercase">
              CUSTOMER DESPATCH_
            </h5>
            <ul className="space-y-1.5 text-brand-lightgray text-[11px]">
              <li className="hover:text-brand-neon cursor-pointer" onClick={() => alert('All shipments dispatch within 24-48 business hours with signature drop validation.')}>SECURE SHIPPING</li>
              <li className="hover:text-brand-neon cursor-pointer" onClick={() => alert('Returns accepted within 14 coordinates of dispatch for store credit.')}>VAULT POLICY</li>
              <li className="hover:text-brand-neon cursor-pointer" onClick={() => alert('Accepted methods:\nCards, Apple and Google Pay, and Secured Cryptographic coins.')}>CRYPT DISPATCH</li>
              <li className="hover:text-brand-neon cursor-pointer" onClick={() => alert('Support coordinates are monitored 24/7:\nGohardluxury4@gmail.com')}>COORDS SUPPORT</li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h5 className="font-mono font-bold text-xs text-brand-offwhite tracking-wider uppercase">
              GHL_CONTACTS_
            </h5>
            <ul className="space-y-1.5 text-brand-lightgray text-[11px]">
              <li className="hover:text-brand-neon transition-colors">
                <a href="tel:09038499673" className="block">PH: 09038499673</a>
              </li>
              <li className="hover:text-brand-neon transition-colors">
                <a href="mailto:Gohardluxury4@gmail.com" className="block">EM: Gohardluxury4@gmail.com</a>
              </li>
              <li className="hover:text-brand-neon transition-colors">
                <a href="https://www.tiktok.com/@gohardluxury" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                  <span>TT: @gohardluxury</span>
                  <ExternalLink size={10} />
                </a>
              </li>
              <li className="hover:text-brand-neon transition-colors">
                <a href="https://instagram.com/gohxrdluxury_" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                  <span>IG: @gohxrdluxury_</span>
                  <ExternalLink size={10} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-brand-midgray/15 flex flex-col md:flex-row justify-between items-center gap-4 text-brand-lightgray/55 text-[10px]">
          <span>© 2026 OFF THUG RACK DESIGN CO. ALL RIGHTS DISPATCHED FOR DEPLOYMENTS.</span>
          <div className="flex items-center gap-4">
            <a href="https://gohardluxury.com/#" target="_blank" rel="noreferrer" className="hover:text-brand-neon inline-flex items-center gap-1 cursor-pointer">
              <span>VISIT SOURCE SITE</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </footer>

      {/* Cart dispatch menu drawer slide over */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Product Spec modal viewer details */}
      <ProductDetailModal
        product={viewedProduct}
        onClose={() => setViewedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
