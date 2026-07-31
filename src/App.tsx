import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Globe, Flame, SlidersHorizontal, ArrowDown, ExternalLink, RefreshCw, Sun, Moon, Menu, X } from 'lucide-react';
import { GHL_PRODUCTS } from './data';
import { Product, CartItem, SortOption } from './types';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartSidebar } from './components/CartSidebar';
import { AdminCMS } from './components/AdminCMS';
import { MobileUploadUplink } from './components/MobileUploadUplink';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const RETIRED_PRODUCT_IDS = new Set(['ghl-442-tracksuit', 'ghl-ribbed-socks', 'ghl-socks']);

function groupProductVariants(sortedProducts: Product[]): Product[] {
  const result: Product[] = [];
  const visited = new Set<string>();
  
  const getGroupKey = (p: Product) => {
    let name = p.name.toLowerCase();
    
    // Standardize tracksuits
    if (name.includes('up&down') || name.includes('tracksuit')) {
      return 'up_and_down_tracksuit';
    }
    // Standardize jeans/denim
    if (name.includes('jean') || name.includes('denim')) {
      return 'denim_jeans';
    }
    // Standardize longsleeve tees
    if (name.includes('ls tee') || name.includes('longsleeve')) {
      return 'ls_tees';
    }
    // Standardize GHL 26 Jerseys
    if (name.includes('26 jersey') || name.includes('26 jerseys')) {
      return '26_jerseys';
    }
    // Standardize GHL TME caps
    if (name.includes('tme hat') || name.includes('tme cap') || name.includes('hat tme')) {
      return 'tme_headwear';
    }
    // Standardize GHL logo shorts
    if (name.includes('logo shorts') || name.includes('shorts')) {
      return 'shorts';
    }
    // Standardize other hats
    if (name.includes('hat') || name.includes('cap') || name.includes('visor')) {
      return 'headwear';
    }
    
    // Strip colors and qualifiers
    name = name.replace(/\b(black|white|grey|gray|red|green|blue|camo|yellow|purple|orange|pink|brown|beige|sand)\b/g, '');
    name = name.replace(/\b(original|archive|collection|design|vneck|silky|v-neck|members|only)\b/g, '');
    return name.trim();
  };

  for (let i = 0; i < sortedProducts.length; i++) {
    const currentProduct = sortedProducts[i];
    if (visited.has(currentProduct.id)) {
      continue;
    }
    
    result.push(currentProduct);
    visited.add(currentProduct.id);
    
    const currentKey = getGroupKey(currentProduct);
    if (currentKey) {
      for (let j = i + 1; j < sortedProducts.length; j++) {
        const otherProduct = sortedProducts[j];
        if (!visited.has(otherProduct.id) && getGroupKey(otherProduct) === currentKey) {
          result.push(otherProduct);
          visited.add(otherProduct.id);
        }
      }
    }
  }
  
  return result;
}

export default function App() {
  // State elements - Persistent Products database
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('GHL_PRODUCTS');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Product[];
        const validProducts = parsed.filter(p => !RETIRED_PRODUCT_IDS.has(p.id));
        const parsedIds = new Set(validProducts.map(p => p.id));
        const newStaticProducts = GHL_PRODUCTS.filter(p => !parsedIds.has(p.id));
        return [...validProducts, ...newStaticProducts];
      } catch (e) {
        console.error('Failed to parse stored products', e);
      }
    }
    return GHL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('GHL_PRODUCTS', JSON.stringify(products));
  }, [products]);

  // Admin Mode state
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => window.location.hash === '#ghl-portal-secure-2026');
  const [isMobileUploadMode, setIsMobileUploadMode] = useState<boolean>(() => window.location.hash.startsWith('#mobile-upload'));
  
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminMode(window.location.hash === '#ghl-portal-secure-2026');
      setIsMobileUploadMode(window.location.hash.startsWith('#mobile-upload'));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Persistent Orders state
  const [orders, setOrders] = useState<any[]>(() => {
    const stored = localStorage.getItem('GHL_ORDERS');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const hasMock = parsed.some((o: any) => o.id && o.id.startsWith('GHL-REG-'));
        if (!hasMock) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse stored orders', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('GHL_ORDERS', JSON.stringify(orders));
  }, [orders]);

  // Persistent Homepage Config state
  const [homepageConfig, setHomepageConfig] = useState<any>(() => {
    const stored = localStorage.getItem('GHL_HOMEPAGE_CONFIG');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored homepage config', e);
      }
    }
    return {
      announcementText: "FREE SHIPPING ON ORDERS OVER ₦100,000 // CODE: GOHARD",
      announcementEnabled: true,
      heroHeadline: "GO HARD LUX.",
      heroSubheadline: "FEATURED ARCHIVE_",
      heroDescription: "Curating the intersection of street culture and technical precision. Designed for the unseen.",
      heroVideoUrl: "/video/SaveClip.App_AQMNLLCOZx9fTFK3FwpUwBbLXY_YghRBoOy3hXzNcIETEuC6RS3rLLlRf25T3rHV7gddLaq6yVC83NKbvLi672p_CxBwfD3450dxLQs.mp4",
      ctaText: "View Lookbook",
      featuredCollectionCategory: "ALL"
    };
  });

  useEffect(() => {
    localStorage.setItem('GHL_HOMEPAGE_CONFIG', JSON.stringify(homepageConfig));
  }, [homepageConfig]);

  // Sync state with Supabase live database
  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured) return;

      try {
        // Fetch products
        const { data: dbProducts, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('release_date', { ascending: false });

        if (prodError) throw prodError;

        if (dbProducts && dbProducts.length > 0) {
          const mapped = dbProducts.map((p: any) => {
            const staticProd = GHL_PRODUCTS.find(sp => sp.id === p.id);
            return {
              id: p.id,
              name: p.name || staticProd?.name || '',
              price: p.price !== undefined && p.price !== null ? Number(p.price) : (staticProd?.price || 0),
              category: p.category || staticProd?.category || 'Tees',
              description: p.description !== undefined && p.description !== null && p.description !== '' ? p.description : (staticProd?.description || ''),
              details: p.details && p.details.length > 0 ? p.details : (staticProd?.details || []),
              sizes: p.sizes && p.sizes.length > 0 ? p.sizes : (staticProd?.sizes || []),
              images: p.images && p.images.length > 0 ? p.images : (staticProd?.images || []),
              soldOut: !!p.sold_out,
              badge: p.badge !== undefined && p.badge !== null && p.badge !== '' ? p.badge : (staticProd?.badge || ''),
              quotes: p.quotes !== undefined && p.quotes !== null ? p.quotes : (staticProd?.quotes || ''),
              releaseDate: p.release_date || staticProd?.releaseDate || '',
              formerPrice: p.former_price !== undefined && p.former_price !== null ? Number(p.former_price) : staticProd?.formerPrice,
              whatsappLink: p.whatsapp_link || staticProd?.whatsappLink || undefined
            };
          });
          
          // Merge Supabase products with static data.ts products (GHL_PRODUCTS)
          // DB products take precedence, local-only data.ts products are appended.
          const dbIds = new Set(mapped.map(p => p.id));
          const onlyLocal = GHL_PRODUCTS.filter(p => !dbIds.has(p.id));
          const combined = [...mapped, ...onlyLocal];
          
          setProducts(combined);
          localStorage.setItem('GHL_PRODUCTS', JSON.stringify(combined));
        }

        // Fetch homepage config
        const { data: dbConfig, error: configError } = await supabase
          .from('homepage_config')
          .select('*')
          .eq('id', 'singleton')
          .maybeSingle();

        if (configError) throw configError;

        if (dbConfig) {
          const mappedConfig = {
            announcementText: dbConfig.announcement_text,
            announcementEnabled: !!dbConfig.announcement_enabled,
            heroHeadline: dbConfig.hero_headline,
            heroSubheadline: dbConfig.hero_subheadline,
            heroDescription: dbConfig.hero_description,
            heroVideoUrl: dbConfig.hero_video_url,
            ctaText: dbConfig.cta_text,
            featuredCollectionCategory: dbConfig.featured_collection_category || 'ALL'
          };
          setHomepageConfig(mappedConfig);
          localStorage.setItem('GHL_HOMEPAGE_CONFIG', JSON.stringify(mappedConfig));
        }

        // Fetch orders
        const { data: dbOrders, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (orderError) throw orderError;

        if (dbOrders) {
          const mappedOrders = dbOrders.map((o: any) => ({
            id: o.id,
            date: o.date,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            items: o.items,
            totalAmount: Number(o.total_amount),
            status: o.status,
            paymentStatus: o.payment_status
          }));
          setOrders(mappedOrders);
          localStorage.setItem('GHL_ORDERS', JSON.stringify(mappedOrders));
        }
      } catch (err) {
        console.error('Failed to sync data from Supabase live backend:', err);
      }
    }

    loadData();
  }, []);

  // Real-time subscriptions for products, orders, and homepage config
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const refetchProducts = async () => {
      try {
        const { data: dbProducts, error } = await supabase
          .from('products')
          .select('*')
          .order('release_date', { ascending: false });

        if (!error && dbProducts) {
          const mapped = dbProducts.map((p: any) => {
            const staticProd = GHL_PRODUCTS.find(sp => sp.id === p.id);
            return {
              id: p.id,
              name: p.name || staticProd?.name || '',
              price: p.price !== undefined && p.price !== null ? Number(p.price) : (staticProd?.price || 0),
              category: p.category || staticProd?.category || 'Tees',
              description: p.description !== undefined && p.description !== null && p.description !== '' ? p.description : (staticProd?.description || ''),
              details: p.details && p.details.length > 0 ? p.details : (staticProd?.details || []),
              sizes: p.sizes && p.sizes.length > 0 ? p.sizes : (staticProd?.sizes || []),
              images: p.images && p.images.length > 0 ? p.images : (staticProd?.images || []),
              soldOut: !!p.sold_out,
              badge: p.badge !== undefined && p.badge !== null && p.badge !== '' ? p.badge : (staticProd?.badge || ''),
              quotes: p.quotes !== undefined && p.quotes !== null ? p.quotes : (staticProd?.quotes || ''),
              releaseDate: p.release_date || staticProd?.releaseDate || '',
              formerPrice: p.former_price !== undefined && p.former_price !== null ? Number(p.former_price) : staticProd?.formerPrice,
              whatsappLink: p.whatsapp_link || staticProd?.whatsappLink || undefined
            };
          });

          const dbIds = new Set(mapped.map(p => p.id));
          const onlyLocal = GHL_PRODUCTS.filter(p => !dbIds.has(p.id));
          const combined = [...mapped, ...onlyLocal];

          setProducts(combined);
          localStorage.setItem('GHL_PRODUCTS', JSON.stringify(combined));
        }
      } catch (err) {
        console.error('Failed to re-fetch products in realtime:', err);
      }
    };

    const refetchHomepageConfig = async () => {
      try {
        const { data: dbConfig, error } = await supabase
          .from('homepage_config')
          .select('*')
          .eq('id', 'singleton')
          .maybeSingle();

        if (!error && dbConfig) {
          const mappedConfig = {
            announcementText: dbConfig.announcement_text,
            announcementEnabled: !!dbConfig.announcement_enabled,
            heroHeadline: dbConfig.hero_headline,
            heroSubheadline: dbConfig.hero_subheadline,
            heroDescription: dbConfig.hero_description,
            heroVideoUrl: dbConfig.hero_video_url,
            ctaText: dbConfig.cta_text,
            featuredCollectionCategory: dbConfig.featured_collection_category || 'ALL'
          };
          setHomepageConfig(mappedConfig);
          localStorage.setItem('GHL_HOMEPAGE_CONFIG', JSON.stringify(mappedConfig));
        }
      } catch (err) {
        console.error('Failed to re-fetch homepage config in realtime:', err);
      }
    };

    const refetchOrders = async () => {
      try {
        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbOrders) {
          const mappedOrders = dbOrders.map((o: any) => ({
            id: o.id,
            date: o.date,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            items: o.items,
            totalAmount: Number(o.total_amount),
            status: o.status,
            paymentStatus: o.payment_status
          }));
          setOrders(mappedOrders);
          localStorage.setItem('GHL_ORDERS', JSON.stringify(mappedOrders));
        }
      } catch (err) {
        console.error('Failed to re-fetch orders in realtime:', err);
      }
    };

    const productsChannel = supabase
      .channel('realtime-products-storefront')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, refetchProducts)
      .subscribe();

    const configChannel = supabase
      .channel('realtime-config-storefront')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_config' }, refetchHomepageConfig)
      .subscribe();

    const ordersChannel = supabase
      .channel('realtime-orders-storefront')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refetchOrders)
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(configChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [viewedProduct, setViewedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [activePolicy, setActivePolicy] = useState<'shipping' | 'refund' | 'privacy' | 'terms' | null>(null);

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

  // Increment visitor counter on storefront load & initialize analytics tracking
  useEffect(() => {
    const count = parseInt(localStorage.getItem('GHL_VISITOR_COUNT') || '0');
    localStorage.setItem('GHL_VISITOR_COUNT', (count + 1).toString());

    // Sync hit count to Supabase if configured
    if (isSupabaseConfigured) {
      supabase.from('analytics').insert({}).then(({ error }) => {
        if (error) {
          console.warn('Analytics table not yet created on Supabase. Falling back to local storage.');
        } else {
          console.log('Page view logged to database.');
        }
      });
    }

    // 1. Google Analytics 4 Script Dynamic Injection
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId && measurementId !== 'YOUR_GA_MEASUREMENT_ID') {
      const scriptId = 'google-analytics-gtag';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer!.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', measurementId);
      }
    }

    // 2. Global Event Tracking Engine
    window.trackEvent = async (eventName: string, metadata = {}) => {
      let sessionId = sessionStorage.getItem('GHL_SESSION_ID');
      if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('GHL_SESSION_ID', sessionId);
      }

      let referrer = document.referrer || 'Direct';
      if (referrer.includes('instagram.com')) referrer = 'Instagram';
      else if (referrer.includes('tiktok.com')) referrer = 'TikTok';
      else if (referrer.includes('google.com')) referrer = 'Google';
      else if (referrer.includes('t.co') || referrer.includes('twitter.com')) referrer = 'X / Twitter';

      const path = window.location.hash || '#home';

      // GA4 tracking
      if (window.gtag && measurementId) {
        window.gtag('event', eventName, {
          session_id: sessionId,
          page_path: path,
          referrer: referrer,
          ...metadata
        });
      }

      // Supabase tracking
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('analytics_events').insert([{
            event_name: eventName,
            product_id: metadata.productId || null,
            product_name: metadata.productName || null,
            session_id: sessionId,
            referrer: referrer,
            path: path
          }]);
          if (error) console.error('Database analytics insert error:', error);
        } catch (err) {
          console.error('Failed to log event to Supabase:', err);
        }
      } else {
        // Local fallback
        try {
          const localEvents = JSON.parse(localStorage.getItem('GHL_ANALYTICS_EVENTS') || '[]');
          localEvents.push({
            event_name: eventName,
            product_id: metadata.productId || null,
            product_name: metadata.productName || null,
            session_id: sessionId,
            referrer: referrer,
            path: path,
            created_at: new Date().toISOString()
          });
          localStorage.setItem('GHL_ANALYTICS_EVENTS', JSON.stringify(localEvents.slice(-100)));
        } catch (e) {
          console.error('Local analytics logging error:', e);
        }
      }
    };

    // Track initial page load
    setTimeout(() => {
      if (window.trackEvent) window.trackEvent('page_view');
    }, 100);
  }, []);

  // Track product view details modal open
  useEffect(() => {
    if (viewedProduct && window.trackEvent) {
      window.trackEvent('product_view', {
        productId: viewedProduct.id,
        productName: viewedProduct.name
      });
    }
  }, [viewedProduct]);

  // Track page views when category or search changes
  useEffect(() => {
    if (window.trackEvent) {
      window.trackEvent('page_view', {
        category: selectedCategory,
        search: searchQuery
      });
    }
  }, [selectedCategory, searchQuery]);

  // Tactical Live Clock UTC Timer
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Track scroll position for dynamic island header
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize and update UTC time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update filtered, searched, and sorted product lists
  const filteredProducts = groupProductVariants(
    products
      .filter(p => {
        const cat1 = p.category ? p.category.toLowerCase().trim() : '';
        const cat2 = selectedCategory ? selectedCategory.toLowerCase().trim() : '';
        const matchCategory = selectedCategory === 'ALL' || 
                              cat1 === cat2 ||
                              (cat1 + 's') === cat2 ||
                              cat1 === (cat2 + 's') ||
                              (cat1.startsWith('accessor') && cat2.startsWith('accessor'));
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchCategory && matchSearch;
      })
      .sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
        // Default: newest drop - based on releaseDate strings
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      })
  );

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

  // Newsletter signup form coordination
  const handleSubscribeNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    // Save locally
    try {
      const stored = JSON.parse(localStorage.getItem('GHL_SUBSCRIBERS') || '[]');
      if (!stored.includes(email)) {
        stored.push(email);
        localStorage.setItem('GHL_SUBSCRIBERS', JSON.stringify(stored));
      }
    } catch (err) {
      console.error('Failed to save subscriber locally', err);
    }

    // Sync to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('subscribers')
          .insert({ email: email });
        if (error) throw error;
      } catch (err) {
        console.error('Failed to sync subscriber to database:', err);
      }
    }

    // Track analytics event
    if (window.trackEvent) {
      window.trackEvent('newsletter_subscribe', { email: email });
    }

    alert('Successfully subscribed to exclusive GHL drops!');
    setNewsletterEmail('');
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

    if (window.trackEvent) {
      window.trackEvent('add_to_cart', {
        productId: product.id,
        productName: product.name,
        size: size,
        quantity: quantity
      });
    }
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

  if (isMobileUploadMode) {
    return <MobileUploadUplink />;
  }

  if (isAdminMode) {
    return (
      <AdminCMS
        onCloseStore={() => {
          setIsAdminMode(false);
          window.location.hash = '';
        }}
        products={products}
        setProducts={setProducts}
        homepageConfig={homepageConfig}
        setHomepageConfig={setHomepageConfig}
        orders={orders}
        setOrders={setOrders}
      />
    );
  }

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
      <div className="bg-brand-darkgray/90 text-[10px] uppercase font-mono py-2.5 px-4 md:px-8 border-b border-white/10 flex justify-between items-center gap-2 relative z-20">
        {homepageConfig.announcementEnabled ? (
          <div className="text-brand-neon/80 font-black hidden sm:block animate-pulse tracking-wider">
            {homepageConfig.announcementText}
          </div>
        ) : <div />}
        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-1">
            <Globe size={11} className="text-white/60" />
            <span className="opacity-60 font-medium tracking-wider">UTC TIMESTAMP: {currentTime.toISOString().replace('T', ' ').substring(0, 19)}</span>
          </div>
        </div>
      </div>

      {/* Main Elegant Header - Dynamic Island Capsule */}
      <motion.header
        id="store-main-header"
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-1/2 -translate-x-1/2 z-40 border border-white/10 shadow-2xl transition-all duration-300 ease-out shadow-[0_0_25px_rgba(255,255,255,0.03)]
          ${isMobileMenuOpen 
            ? 'top-4 w-[92%] max-w-md py-6 px-6 rounded-3xl bg-brand-matte/95 flex flex-col gap-5' 
            : isScrolled
              ? isHovered && !isSearchVisible
                ? 'top-4 w-[92%] max-w-4xl py-3 px-6 rounded-full bg-brand-matte/90 flex items-center justify-between'
                : 'top-4 w-[75%] max-w-[290px] md:w-[60%] lg:w-[45%] md:max-w-xl py-2 px-4 md:px-5 rounded-full bg-brand-matte/90 flex items-center justify-between'
              : isSearchVisible
                ? 'top-16 w-[92%] max-w-4xl py-3 px-6 rounded-full bg-brand-matte/85 flex items-center justify-between'
                : 'top-16 w-[94%] max-w-5xl py-4 px-8 rounded-full bg-brand-matte/70 flex items-center justify-between'
          }`}
      >
        {isMobileMenuOpen ? (
          // Mobile Menu Layout (Expanded Vertically)
          <div className="flex flex-col w-full h-full gap-5">
            {/* Top Row: Logo & Close */}
            <div className="flex items-center justify-between w-full">
              <span className="font-display font-black text-sm tracking-tighter text-brand-offwhite uppercase">
                GO HARD LUXURY
              </span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer text-brand-lightgray hover:text-brand-offwhite"
              >
                <X size={14} />
              </button>
            </div>

            {/* Middle: Vertical Navigation Links */}
            <div className="flex flex-col gap-3 py-2 border-y border-white/5">
              {['ALL', 'POLOS', 'DENIM', 'TEES', 'TRACKSUITS', 'FOOTWEAR', 'ACCESSORIES'].map((cat, index) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    scrollToCollection();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left font-display font-black text-xl tracking-tight uppercase transition-all py-1 cursor-pointer hover:text-brand-neon ${
                    selectedCategory === cat ? 'text-brand-neon translate-x-2' : 'text-brand-lightgray'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input inline in mobile menu */}
            <div className="relative w-full">
              <input
                id="search-input-field"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH CATALOG..."
                className="w-full bg-brand-darkgray border border-white/10 focus:border-white/20 px-4 py-2.5 pr-20 rounded-xl text-xs font-mono text-brand-offwhite placeholder-brand-lightgray/40 outline-none uppercase tracking-wider"
              />
              <div className="absolute right-3 top-2.5 flex items-center gap-2">
                {searchQuery && (
                  <span className="text-[8px] font-mono text-brand-neon bg-brand-darkgray px-1.5 py-0.5 rounded border border-white/10 uppercase">
                    {filteredProducts.length}
                  </span>
                )}
                {searchQuery && (
                  <button
                    id="search-clear-btn"
                    onClick={() => setSearchQuery('')}
                    className="text-[9px] font-mono text-brand-lightgray hover:text-brand-offwhite cursor-pointer font-bold"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Row: Theme Toggle, Cart Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="flex-1 py-2.5 border border-white/10 rounded-full flex items-center justify-center gap-2 bg-brand-darkgray/40 text-xs font-mono font-bold cursor-pointer text-brand-lightgray hover:text-brand-offwhite"
              >
                {theme === 'night' ? (
                  <>
                    <Sun size={13} className="text-brand-offwhite" />
                    <span>DAY MODE</span>
                  </>
                ) : (
                  <>
                    <Moon size={13} className="text-brand-offwhite" />
                    <span>NIGHT MODE</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex-1 py-2.5 bg-brand-offwhite text-brand-matte rounded-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer hover:opacity-90 shadow-md"
              >
                <ShoppingBag size={13} className="stroke-[3]" />
                <span>BAG ({getCartTotalQty()})</span>
              </button>
            </div>

            {/* Footer / Social Links */}
            <div className="flex justify-between items-center text-[9px] font-mono text-brand-lightgray/60 pt-2 border-t border-white/5">
              <a href="https://instagram.com/gohxrdluxury_" target="_blank" rel="noreferrer" className="hover:text-brand-neon">IG: @gohxrdluxury_</a>
              <a href="https://www.tiktok.com/@gohardluxury" target="_blank" rel="noreferrer" className="hover:text-brand-neon">TT: @gohardluxury</a>
              <span>© {new Date().getFullYear()} GHL</span>
            </div>
          </div>
        ) : (
          // Horizontal Capsule Layout (Desktop / Mobile Closed)
          <div className="flex items-center justify-between w-full h-full">
            {/* Logo/Brand Name */}
            <div className="flex items-center gap-2 shrink-0">
              <div 
                className={`flex flex-col cursor-pointer ${isSearchVisible ? 'hidden sm:flex' : 'flex'}`} 
                onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
              >
                <h1 className="font-display font-black text-sm tracking-tighter text-brand-offwhite uppercase hover:text-white/80 transition-colors">
                  {isScrolled && !isHovered ? 'GHL' : 'GO HARD LUXURY'}
                </h1>
                {!isScrolled && (
                  <span className="font-mono text-[6px] text-brand-lightgray uppercase tracking-[0.4em] leading-none font-bold hidden md:inline">
                    ESTABLISHED IN 2019
                  </span>
                )}
              </div>
            </div>

            {/* Navigation links (Desktop only, hidden when compact/scrolled & not hovered) */}
            {(!isScrolled || isHovered) && !isSearchVisible && (
              <nav className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-black">
                {['ALL', 'POLOS', 'DENIM', 'TEES', 'TRACKSUITS', 'FOOTWEAR', 'ACCESSORIES'].map((cat) => (
                  <button
                    id={`nav-tab-${cat}`}
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      scrollToCollection();
                    }}
                    className={`pb-0.5 hover-line uppercase transition-all relative cursor-pointer ${
                      selectedCategory === cat ? 'text-brand-offwhite font-black underline underline-offset-4 decoration-2' : 'text-brand-lightgray hover:text-brand-offwhite'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            )}

            {/* Search Input inline in header (Desktop only or when search visible) */}
            {isSearchVisible && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 max-w-md mx-2 sm:mx-6 relative flex items-center"
              >
                <input
                  id="search-input-field"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH CATALOG..."
                  className="w-full bg-brand-darkgray border border-white/10 focus:border-white/20 px-4 py-1.5 pr-20 rounded-full text-[10px] sm:text-xs font-mono text-brand-offwhite placeholder-brand-lightgray/40 outline-none uppercase tracking-wider"
                  autoFocus
                />
                <div className="absolute right-3 flex items-center gap-2">
                  {searchQuery && (
                    <span className="text-[8px] font-mono text-brand-neon bg-brand-darkgray px-1.5 py-0.5 rounded border border-white/10 uppercase">
                      {filteredProducts.length}
                    </span>
                  )}
                  {searchQuery && (
                    <button
                      id="search-clear-btn"
                      onClick={() => setSearchQuery('')}
                      className="text-[9px] font-mono text-brand-lightgray hover:text-brand-offwhite cursor-pointer font-bold"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Action buttons (Right side) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Theme Toggle (Desktop only or when header is open/unscrolled) */}
              {(!isScrolled || isHovered) && (
                <button
                  id="toggle-theme-btn"
                  onClick={toggleTheme}
                  className="w-8 h-8 transition-all cursor-pointer border bg-brand-darkgray/40 border-white/10 hover:border-white/30 text-brand-lightgray hover:text-brand-offwhite flex items-center justify-center rounded-full shrink-0 hidden md:flex"
                  title={`Switch to ${theme === 'night' ? 'day' : 'night'} display perspective`}
                >
                  {theme === 'night' ? (
                    <Sun size={13} className="text-brand-offwhite" />
                  ) : (
                    <Moon size={13} className="text-brand-offwhite" />
                  )}
                </button>
              )}

              {/* Quick Search Toggle (Desktop only or when header is open/unscrolled) */}
              {(!isScrolled || isHovered) && (
                <button
                  id="toggle-search-btn"
                  onClick={() => setIsSearchVisible(prev => !prev)}
                  className={`w-8 h-8 transition-all cursor-pointer border rounded-full flex items-center justify-center shrink-0 hidden md:flex ${
                    isSearchVisible 
                      ? 'bg-brand-offwhite text-brand-matte border-brand-offwhite' 
                      : 'bg-brand-darkgray/40 border-white/10 text-brand-lightgray hover:text-brand-offwhite hover:border-white/30'
                  }`}
                  title="Search collection"
                >
                  <Search size={13} />
                </button>
              )}

              {/* Cart Button (Always visible on desktop, or on mobile when not compact) */}
              <button
                id="toggle-cart-btn"
                onClick={() => setIsCartOpen(true)}
                className={`bg-brand-offwhite text-brand-matte hover:opacity-90 px-3.5 py-1.5 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 font-black text-[10px] uppercase tracking-wider rounded-full shadow-md shrink-0
                  ${isScrolled && !isHovered ? 'hidden md:flex' : 'flex'}`}
              >
                <ShoppingBag size={12} className="stroke-[3]" />
                <span className="font-mono text-[10px]">{getCartTotalQty()}</span>
              </button>

              {/* Mobile Search Toggle (Mobile scrolled/compact shortcut) */}
              {isScrolled && !isHovered && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(true);
                  }}
                  className="w-7 h-7 bg-brand-darkgray/40 border border-white/10 hover:border-white/30 text-brand-lightgray hover:text-brand-offwhite flex items-center justify-center rounded-full shrink-0 md:hidden cursor-pointer"
                >
                  <Search size={11} />
                </button>
              )}

              {/* Mobile Menu Toggle button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-8 h-8 transition-all cursor-pointer border bg-brand-darkgray/40 border-white/10 hover:border-white/30 text-brand-lightgray hover:text-brand-offwhite flex items-center justify-center rounded-full shrink-0 md:hidden"
              >
                <Menu size={13} />
              </button>
            </div>
          </div>
        )}
      </motion.header>

      {/* Hero Presentation Drop Segment */}
      <section id="hero-banner-section" className="relative h-[85vh] min-h-[480px] sm:min-h-[580px] flex flex-col justify-between items-stretch pt-28 pb-12 px-6 md:px-12 text-left overflow-hidden border-b border-white/10 z-10 bg-[#080808]">
        {/* Background Video */}
        <video
          key={homepageConfig.heroVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-40"
        >
          <source src={homepageConfig.heroVideoUrl} type="video/mp4" />
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
            <span className="text-xs sm:text-sm md:text-base uppercase tracking-widest block font-black mb-2">{homepageConfig.heroSubheadline}</span>
            <p className="text-xs sm:text-sm leading-relaxed opacity-75">
              {homepageConfig.heroDescription}
            </p>
          </div>
        </div>

        {/* Medium centered message title with extremely bold font sizing style */}
        <div className="my-auto z-10 relative flex flex-col items-center text-center">
          <h2
            className="font-luxury font-extrabold text-5xl sm:text-8xl md:text-9xl tracking-tight uppercase text-white leading-none mb-6"
          >
            {homepageConfig.heroHeadline}
          </h2>
          <p
            className="max-w-xl text-sm md:text-base font-luxury italic tracking-wide leading-relaxed text-zinc-300 opacity-90 mb-8"
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
              {homepageConfig.ctaText}
            </button>
          </div>
        </div>
      </section>

      {/* Main product showcase rack */}
      <main id="collection-rack" className="max-w-7xl mx-auto py-12 px-4 md:px-8 space-y-8 scroll-mt-24">

        {/* Filters and sorting layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-brand-midgray/15">
          {/* Leftside: category tags scrolling container */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <SlidersHorizontal size={13} className="text-brand-lightgray shrink-0 mr-1.5 hidden sm:inline" />
            {['ALL', 'POLOS', 'DENIM', 'TEES', 'TRACKSUITS', 'FOOTWEAR', 'ACCESSORIES'].map((category) => (
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
          <div id="products-interactive-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

      {/* Walk Into Our Store Section */}
      <section id="store-location" className="border-t border-brand-midgray/20 bg-brand-matte py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="font-mono text-[9px] text-brand-lightgray uppercase tracking-[0.25em] block">
              Flagship Experience_
            </span>
            <h2 className="font-display font-black text-2xl md:text-3xl text-brand-offwhite uppercase tracking-tighter">
              WALK INTO OUR STORE_
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Embedded Google Map Frame */}
            <div className="lg:col-span-8 border border-brand-midgray/25 relative min-h-[350px] md:min-h-[450px] bg-black overflow-hidden flex flex-col justify-end">
              {/* Map iframe */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.066750013994!2d4.5152523!3d8.4929871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10364d1f278eb045%3A0x6e2df48677c77c6!2sAtiku%20Rd%2C%20Adewole%2C%20Ilorin%2C%20Kwara!5e0!3m2!1sen!2sng!4v1722430000000!5m2!1sen!2sng"
                className="absolute inset-0 w-full h-full border-none transition-all duration-300"
                style={{ 
                  filter: theme === 'night' ? 'invert(90%) hue-rotate(180deg) grayscale(90%) contrast(100%)' : 'none' 
                }}
                allowFullScreen
                loading="lazy"
                title="GHL Store Location Map"
              />
              {/* Open in Maps Overlay button */}
              <div className="absolute top-4 left-4 z-10">
                <a
                  href="https://maps.google.com/?q=Atiku+Road,+Adewole,+Ilorin,+Kwara+State,+Nigeria"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-black/90 hover:bg-white hover:text-black border border-white/20 text-white font-mono text-[9px] font-black uppercase tracking-widest px-4 py-2.5 transition-all duration-300 inline-flex items-center gap-2 rounded-none shadow-xl"
                >
                  <span>Open in Maps</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
            
            {/* Info details / directions */}
            <div className="lg:col-span-4 border border-brand-midgray/25 p-6 md:p-8 flex flex-col justify-between bg-brand-darkgray space-y-6">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <span className="font-mono text-[8px] text-brand-lightgray uppercase tracking-widest block">HQ Coordinates_</span>
                  <h4 className="font-display font-black text-lg text-brand-offwhite uppercase tracking-tight leading-none">
                    GO HARD LUXURY ILORIN
                  </h4>
                  <p className="text-xs font-sans text-brand-lightgray uppercase font-bold tracking-wider leading-relaxed">
                    Atiku Road, Adewole,<br />
                    Ilorin, Kwara State, Nigeria
                  </p>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-brand-midgray/20">
                  <span className="font-mono text-[8px] text-brand-lightgray uppercase tracking-widest block">Opening Hours_</span>
                  <ul className="text-xs font-mono text-brand-lightgray space-y-1.5 uppercase font-bold tracking-wider">
                    <li className="flex justify-between">
                      <span>Mon - Sat:</span>
                      <span className="text-brand-offwhite">10:00 AM - 8:00 PM</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="text-brand-offwhite">12:00 PM - 6:00 PM</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-brand-midgray/20">
                  <span className="font-mono text-[8px] text-brand-lightgray uppercase tracking-widest block">Attendant Contact_</span>
                  <p className="text-xs font-mono text-brand-lightgray uppercase font-bold tracking-wider">
                    PH: <a href="tel:09038499673" className="text-brand-offwhite hover:underline">09038499673</a><br />
                    EM: <a href="mailto:Gohardluxury4@gmail.com" className="text-brand-offwhite hover:underline">Gohardluxury4@gmail.com</a>
                  </p>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Atiku+Road,+Adewole,+Ilorin,+Kwara+State,+Nigeria"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-brand-offwhite text-brand-matte hover:bg-brand-lightgray text-[10px] font-mono font-black tracking-widest uppercase py-3.5 text-center transition-all duration-300 cursor-pointer block"
              >
                Get Directions ➔
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Premium Footer */}
      <footer id="store-main-footer" className="bg-brand-darkgray border-t border-brand-midgray/25 py-12 px-4 md:px-8 mt-12 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Quick Links Column */}
          <div className="space-y-3">
            <h6 className="text-[10px] font-black text-brand-offwhite uppercase tracking-[0.2em]">
              Navigation_
            </h6>
            <ul className="space-y-1.5 text-[10px] text-brand-lightgray uppercase font-bold tracking-wider">
              <li>
                <a href="#" className="hover:text-brand-offwhite transition-colors duration-200">Home</a>
              </li>
            </ul>
          </div>

          {/* Contact and Location Column */}
          <div className="space-y-3 md:max-w-md">
            <h6 className="text-[10px] font-black text-brand-offwhite uppercase tracking-[0.2em]">
              Contact Us_
            </h6>
            <ul className="space-y-1.5 text-[10px] text-brand-lightgray uppercase font-bold tracking-wider">
              <li className="flex items-center gap-1.5">
                <span>PH:</span>
                <a href="tel:09038499673" className="text-brand-offwhite hover:underline hover:text-brand-neon transition-colors duration-200">09038499673</a>
              </li>
              <li className="flex flex-col gap-0.5">
                <span>LOC:</span>
                <span className="text-brand-offwhite normal-case font-sans font-bold tracking-normal leading-relaxed">
                  Atiku Road, Adewole, Ilorin, Kwara State, Nigeria
                </span>
              </li>
            </ul>
          </div>

          {/* Bottom Copyright */}
          <div className="text-[10px] text-brand-lightgray/80 font-bold uppercase tracking-widest self-end md:self-center">
            <span>© {new Date().getFullYear()} Go Hard Luxury. All Rights Reserved.</span>
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
        onOrderComplete={async (orderData: any) => {
          const newOrder = {
            id: orderData.id || `GHL-REG-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            ...orderData,
            status: orderData.status || 'Paid',
            paymentStatus: orderData.paymentStatus || 'Paid'
          };
          setOrders(prev => [newOrder, ...prev]);

          if (isSupabaseConfigured) {
            try {
              const { error } = await supabase
                .from('orders')
                .insert({
                  id: newOrder.id,
                  date: newOrder.date,
                  customer_name: newOrder.customerName,
                  customer_email: newOrder.customerEmail,
                  items: newOrder.items,
                  total_amount: newOrder.totalAmount,
                  status: newOrder.status,
                  payment_status: newOrder.paymentStatus
                });
              if (error) throw error;
              console.log('Order successfully synced to Supabase:', newOrder.id);
            } catch (err) {
              console.error('Failed to sync checkout transaction to Supabase:', err);
            }
          }
        }}
      />

      {/* Product Spec modal viewer details */}
      <ProductDetailModal
        product={viewedProduct}
        onClose={() => setViewedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Policy Viewer Modal overlay */}
      <AnimatePresence>
        {activePolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-brand-darkgray border border-brand-midgray/30 p-6 md:p-8 max-w-lg w-full relative space-y-6 text-brand-offwhite font-sans max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setActivePolicy(null)}
                className="absolute top-4 right-4 text-brand-lightgray hover:text-brand-offwhite cursor-pointer"
                title="Close policy details"
              >
                <X size={18} />
              </button>

              <div className="space-y-2 border-b border-brand-midgray/20 pb-4">
                <span className="font-mono text-[9px] text-brand-lightgray uppercase tracking-widest block">GHL Legal Coordinates_</span>
                <h3 className="font-display font-black text-xl uppercase tracking-tight">
                  {activePolicy === 'shipping' && 'Shipping Policy_'}
                  {activePolicy === 'refund' && 'Refund Policy_'}
                  {activePolicy === 'privacy' && 'Privacy Policy_'}
                  {activePolicy === 'terms' && 'Terms & Conditions_'}
                </h3>
              </div>

              <div className="text-xs text-brand-lightgray space-y-4 uppercase tracking-wide leading-relaxed font-mono">
                {activePolicy === 'shipping' && (
                  <div className="space-y-4">
                    <p className="font-bold text-brand-offwhite">1. Order Processing</p>
                    <p>All GHL specimens are processed within 24-48 business hours. You will receive email tracking coordinates once dispatched.</p>
                    <p className="font-bold text-brand-offwhite">2. Delivery Timeframes</p>
                    <p>• Lagos Metro: 1-2 business days.<br />• Other Nigerian States: 3-5 business days.<br />• International: 7-10 business days.</p>
                    <p className="font-bold text-brand-offwhite">3. Shipping Rates</p>
                    <p>Flat shipping rates are computed dynamically at checkout based on destination coordinates.</p>
                  </div>
                )}

                {activePolicy === 'refund' && (
                  <div className="space-y-4">
                    <p className="font-bold text-brand-offwhite">1. Exchange Protocol</p>
                    <p>We accept returns or exchanges within 7 days of package receipt. Items must remain in their original unstructured state with all tags attached.</p>
                    <p className="font-bold text-brand-offwhite">2. Non-Refundable Items</p>
                    <p>Limited edition drop releases, customized items, and archive specimens are not eligible for returns or exchanges.</p>
                    <p className="font-bold text-brand-offwhite">3. Return Coordination</p>
                    <p>To initiate a return package, contact our attendant coordination line at 09038499673 or via WhatsApp.</p>
                  </div>
                )}

                {activePolicy === 'privacy' && (
                  <div className="space-y-4">
                    <p className="font-bold text-brand-offwhite">1. Data Coordinates</p>
                    <p>We only collect name, email, and shipping coordinates to process order dispatches and deliver drop notification updates.</p>
                    <p className="font-bold text-brand-offwhite">2. Security System</p>
                    <p>Your details are stored securely. We do not sell or leak coordinates to any third-party marketing entities.</p>
                    <p className="font-bold text-brand-offwhite">3. Consent</p>
                    <p>By registering checkout logs or subscribing to news drops, you consent to our privacy guidelines.</p>
                  </div>
                )}

                {activePolicy === 'terms' && (
                  <div className="space-y-4">
                    <p className="font-bold text-brand-offwhite">1. Proprietary Designs</p>
                    <p>All brand content, clothing illustrations, and digital specimens are copyright under Go Hard Luxury.</p>
                    <p className="font-bold text-brand-offwhite">2. Purchase Policy</p>
                    <p>We reserve the right to limit order quantities on exclusive drops to combat resale bots.</p>
                    <p className="font-bold text-brand-offwhite">3. Pricing Variables</p>
                    <p>Prices are subject to modifications depending on supply chain indices without prior warnings.</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActivePolicy(null)}
                className="w-full py-3 bg-brand-offwhite text-brand-matte font-mono text-[10px] font-black uppercase tracking-widest transition-colors duration-300 hover:bg-brand-lightgray cursor-pointer"
              >
                Close Window
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
