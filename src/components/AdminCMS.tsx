import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Package, FolderOpen, Users, CreditCard, 
  Settings, Mail, Tags, History, LogOut, Plus, Search, 
  Filter, TrendingUp, Layers, Copy, PlusCircle, X, Lock, 
  AlertCircle, Eye, Video, Trash2, Edit, Check, ExternalLink, 
  EyeOff, RefreshCw, Bell, AlertTriangle, ShieldCheck, Download,
  Laptop, Smartphone, BarChart3
} from 'lucide-react';
import { Product, SortOption } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';


interface AdminCMSProps {
  onCloseStore: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  homepageConfig: any;
  setHomepageConfig: (config: any) => void;
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
}

interface HomepageConfig {
  announcementText: string;
  announcementEnabled: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  heroDescription: string;
  heroVideoUrl: string;
  ctaText: string;
  featuredCollectionCategory: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
}

interface PromoCode {
  code: string;
  discountPercentage: number;
  description: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  expiryDate?: string;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  onCloseStore,
  products,
  setProducts,
  homepageConfig,
  setHomepageConfig,
  orders,
  setOrders
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('GHL_ADMIN_AUTH') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState<string>('admin@gohardluxury.com');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminRole, setAdminRole] = useState<'Super Admin' | 'Staff Manager' | 'Content Manager' | 'Guest'>('Super Admin');
  const [authError, setAuthError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');

  // Media Storage State
  const [mediaList, setMediaList] = useState<any[]>(() => {
    const stored = localStorage.getItem('GHL_MEDIA_LIST');
    if (stored) return JSON.parse(stored);
    return [
      { name: 'Lookbook Loop Video', type: 'video', size: '5.9MB', url: '/video/SaveClip.App_AQMNLLCOZx9fTFK3FwpUwBbLXY_YghRBoOy3hXzNcIETEuC6RS3rLLlRf25T3rHV7gddLaq6yVC83NKbvLi672p_CxBwfD3450dxLQs.mp4' },
      { name: 'Visor Cap Front Vector', type: 'image', size: '124KB', url: '/images/visor-front.png' },
      { name: 'Shortsleeve Polo Knit', type: 'image', size: '256KB', url: '/images/polo-knit.png' },
      { name: 'Industrial Denim Blue', type: 'image', size: '312KB', url: '/images/denim-blue.png' }
    ];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync media list local storage
  useEffect(() => {
    localStorage.setItem('GHL_MEDIA_LIST', JSON.stringify(mediaList));
  }, [mediaList]);

  // Load session & dynamic records from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const loadUserSessionAndRole = async (session: any) => {
      if (session && session.user) {
        setIsAuthenticated(true);
        setAdminEmail(session.user.email || '');
        
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (data && data.role && !error) {
            setAdminRole(data.role);
          } else {
            // Default metadata role if available, otherwise fallback to Guest
            const role = session.user.user_metadata?.role || 'Guest';
            setAdminRole(role);
          }
        } catch (err) {
          console.error('Failed to resolve database user role:', err);
          const role = session.user.user_metadata?.role || 'Guest';
          setAdminRole(role);
        }
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('GHL_ADMIN_AUTH');
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserSessionAndRole(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserSessionAndRole(session);
      if (session) {
        localStorage.setItem('GHL_ADMIN_AUTH', 'true');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync CMS records (Promo Codes, Subscribers, Audits, Media) from Supabase on Login
  useEffect(() => {
    async function loadCMSData() {
      if (!isSupabaseConfigured || !isAuthenticated) return;

      try {
        // Fetch Promo Codes
        const { data: dbPromos } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
        if (dbPromos) {
          const mapped = dbPromos.map((p: any) => ({
            code: p.code,
            discountPercentage: Number(p.discount_percentage),
            description: p.description,
            isActive: !!p.is_active,
            usedCount: p.used_count || 0,
            usageLimit: p.usage_limit,
            expiryDate: p.expiry_date
          }));
          setPromoCodes(mapped);
        }

        // Fetch Subscribers
        const { data: dbSubscribers } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
        if (dbSubscribers) {
          setSubscribers(dbSubscribers);
        }

        // Fetch Audit Logs
        const { data: dbLogs } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        if (dbLogs) {
          setAuditLogs(dbLogs.map((l: any) => ({
            id: l.id,
            action: l.action,
            user: l.user,
            role: l.role,
            timestamp: l.timestamp.replace('T', ' ').substring(0, 19)
          })));
        }

        // Fetch Media library
        const { data: dbMedia, error: mediaError } = await supabase.storage.from('media').list();
        if (!mediaError && dbMedia) {
          const mapped = dbMedia.map(file => {
            const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(file.name);
            return {
              name: file.name,
              type: file.metadata?.mimetype?.startsWith('video') ? 'video' : 'image',
              size: `${(file.metadata?.size / 1024).toFixed(1)}KB`,
              url: publicUrlData.publicUrl
            };
          });
          setMediaList(mapped);
        }
      } catch (err) {
        console.error('Failed to sync CMS data from Supabase live database:', err);
      }
    }

    loadCMSData();
  }, [isAuthenticated]);

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Search & Filter States
  const [productSearch, setProductSearch] = useState<string>('');
  const [productFilterCat, setProductFilterCat] = useState<string>('ALL');

  // Image Source dropdown states
  const [showImageDropdown, setShowImageDropdown] = useState<boolean>(false);
  const [showMobileUplinkModal, setShowMobileUplinkModal] = useState<boolean>(false);
  const [showMediaLibraryModal, setShowMediaLibraryModal] = useState<boolean>(false);
  const [mobileSessionId, setMobileSessionId] = useState<string>(() => Math.random().toString(36).substring(2, 12));

  // Analytics tab state managers
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'overview') {
      fetchAnalyticsEvents();
    }
  }, [activeTab]);

  // Subscribe to real-time events in database
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('realtime-analytics-events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'analytics_events' },
        (payload) => {
          setAnalyticsEvents(prev => [payload.new, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnalyticsEvents = async () => {
    if (!isSupabaseConfigured) {
      // Local fallback
      try {
        const stored = JSON.parse(localStorage.getItem('GHL_ANALYTICS_EVENTS') || '[]');
        stored.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setAnalyticsEvents(stored);
      } catch (e) {
        console.error('Failed to parse local analytics events', e);
      }
      return;
    }

    setLoadingAnalytics(true);
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAnalyticsEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch analytics events:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const getAnalyticsStats = () => {
    const totalSessions = new Set(analyticsEvents.map(e => e.session_id)).size;
    const pageViews = analyticsEvents.filter(e => e.event_name === 'page_view').length;
    const addToCarts = analyticsEvents.filter(e => e.event_name === 'add_to_cart').length;
    const checkouts = analyticsEvents.filter(e => e.event_name === 'checkout_start').length;
    const purchases = analyticsEvents.filter(e => e.event_name === 'purchase').length;
    
    // Unique session metrics for conversion rates
    const cartSessions = new Set(
      analyticsEvents.filter(e => e.event_name === 'add_to_cart').map(e => e.session_id)
    ).size;
    const purchaseSessions = new Set(
      analyticsEvents.filter(e => e.event_name === 'purchase').map(e => e.session_id)
    ).size;

    const conversionRate = totalSessions > 0 ? ((purchaseSessions / totalSessions) * 100).toFixed(1) : '0.0';
    const addToCartRate = totalSessions > 0 ? ((cartSessions / totalSessions) * 100).toFixed(1) : '0.0';
    
    const sources: { [key: string]: number } = {};
    analyticsEvents.forEach(e => {
      const src = e.referrer || 'Direct';
      sources[src] = (sources[src] || 0) + 1;
    });
    
    return {
      totalSessions,
      pageViews,
      addToCarts,
      checkouts,
      purchases,
      conversionRate,
      addToCartRate,
      sources
    };
  };

  const stats = getAnalyticsStats();
  const lookerStudioUrl = import.meta.env.VITE_LOOKER_STUDIO_URL || '';

  const cardData = [
    { label: 'TOTAL SESSIONS', val: stats.totalSessions, change: `${stats.pageViews} Page Views`, icon: Users },
    { label: 'CONVERSION RATE', val: `${stats.conversionRate}%`, change: `${stats.purchases} Purchases`, icon: TrendingUp },
    { label: 'ADD TO BAG RATE', val: `${stats.addToCartRate}%`, change: `${stats.addToCarts} Additions`, icon: Package },
    { label: 'CHECKOUT TRIGGERS', val: stats.checkouts, change: 'Initiated Payments', icon: CreditCard }
  ];

  // Listen to mobile upload uplink broadcasts
  useEffect(() => {
    if (!showMobileUplinkModal) return;

    const channel = supabase.channel(`mobile-upload-${mobileSessionId}`, {
      config: {
        broadcast: { ack: false }
      }
    });

    channel.on('broadcast', { event: 'upload-success' }, ({ payload }) => {
      console.log('Mobile image uplink payload received:', payload);
      if (payload && payload.imageUrl) {
        setProductForm(prev => ({ ...prev, images: [payload.imageUrl] }));
        addNotification('SPECIMEN IMAGE SUCCESSFULLY LINKED FROM MOBILE!', 'success');
        addAuditLog(`Received mobile image uplink: ${payload.imageUrl.substring(0, 50)}...`);
        setShowMobileUplinkModal(false);
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to uplink channel mobile-upload-${mobileSessionId}`);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [showMobileUplinkModal, mobileSessionId]);

  // Forms / Editing states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState<boolean>(false);
  
  // New Product Form Data
  const initialProductState = {
    id: '',
    name: '',
    price: 150000,
    category: 'Tees' as any,
    description: '',
    details: [''],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['tees-black'], // Default mock key
    soldOut: false,
    badge: 'NEW ARRIVAL' as any,
    quotes: '',
    releaseDate: new Date().toISOString().split('T')[0],
    formerPrice: undefined
  };
  const [productForm, setProductForm] = useState<any>(initialProductState);

  // Collections State
  const [collections, setCollections] = useState<string[]>(['ALL', 'POLOS', 'DENIM', 'TEES', 'TRACKSUITS', 'FOOTWEAR', 'ACCESSORIES']);
  const [newCollectionName, setNewCollectionName] = useState<string>('');

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    const stored = localStorage.getItem('GHL_PROMO_CODES');
    if (stored) return JSON.parse(stored);
    return [
      { code: 'GOHARD', discountPercentage: 15, description: '15% OFF Sitewide launch code', isActive: true, usedCount: 142 },
      { code: 'THUG19', discountPercentage: 19, description: '19% OFF - The Official GHL discount', isActive: true, usedCount: 89 },
      { code: 'WORTHIT', discountPercentage: 10, description: '10% OFF - loyal customer bonus', isActive: true, usedCount: 33 }
    ];
  });

  // Newsletter Subscribers State
  const [subscribers, setSubscribers] = useState<any[]>(() => {
    const stored = localStorage.getItem('GHL_SUBSCRIBERS');
    if (stored) return JSON.parse(stored);
    return [
      { email: 'anthony.b@gmail.com', date: '2026-06-01', source: 'Footer Form' },
      { email: 'shade.yusuf@yahoo.com', date: '2026-06-03', source: 'Modal pop-up' },
      { email: 'chidi.okafor@outlook.com', date: '2026-06-04', source: 'Footer Form' },
      { email: 'bello.mustapha@gmail.com', date: '2026-06-06', source: 'Checkout Sync' }
    ];
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const stored = localStorage.getItem('GHL_AUDIT_LOGS');
    if (stored) return JSON.parse(stored);
    return [
      { id: '1', action: 'Admin Portal Session Initialized', user: 'admin@gohardluxury.com', role: 'Super Admin', timestamp: '2026-06-07 10:43:21' },
      { id: '2', action: 'Updated Announcement Bar Toggle to Active', user: 'admin@gohardluxury.com', role: 'Super Admin', timestamp: '2026-06-07 11:12:05' }
    ];
  });

  // Dashboard Notifications
  const [notifications, setNotifications] = useState<any[]>([
    { id: 'n1', message: 'New order #GHL-9812 placed by Amina Yusuf', type: 'info', read: false },
    { id: 'n2', message: 'Low stock warning: Ghl Visor Cap is below 5 units', type: 'warning', read: false }
  ]);

  // Sync states to local storage
  useEffect(() => {
    localStorage.setItem('GHL_PROMO_CODES', JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem('GHL_SUBSCRIBERS', JSON.stringify(subscribers));
  }, [subscribers]);

  useEffect(() => {
    localStorage.setItem('GHL_AUDIT_LOGS', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        });
        const fallbackEmail = import.meta.env.VITE_LOCAL_ADMIN_EMAIL || 'admin@gohardluxury.com';
        const fallbackPassword = import.meta.env.VITE_LOCAL_ADMIN_PASSWORD || 'GOHARDLUX@123';

        if (error) {
          // Fallback credentials check
          if (adminEmail === fallbackEmail && adminPassword === fallbackPassword) {
            setIsAuthenticated(true);
            localStorage.setItem('GHL_ADMIN_AUTH', 'true');
            addAuditLog(`Logged in successfully as ${adminRole} (Local fallback)`);
            return;
          }
          throw error;
        }
        if (data?.user) {
          setIsAuthenticated(true);
          const role = data.user.user_metadata?.role || adminRole;
          setAdminRole(role);
          addAuditLog(`Logged in successfully as ${role}`);
        }
      } catch (err: any) {
        setAuthError(err.message || 'INVALID ADMINISTRATIVE COORDINATES (Email/Password mismatch).');
      }
    } else {
      const fallbackEmail = import.meta.env.VITE_LOCAL_ADMIN_EMAIL || 'admin@gohardluxury.com';
      const fallbackPassword = import.meta.env.VITE_LOCAL_ADMIN_PASSWORD || 'GOHARDLUX@123';

      if (adminEmail === fallbackEmail && adminPassword === fallbackPassword) {
        setIsAuthenticated(true);
        localStorage.setItem('GHL_ADMIN_AUTH', 'true');
        addAuditLog(`Logged in successfully as ${adminRole}`);
      } else {
        setAuthError('INVALID ADMINISTRATIVE COORDINATES (Email/Password mismatch).');
      }
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    localStorage.removeItem('GHL_ADMIN_AUTH');
    addAuditLog('Logged out of system session');
  };

  // Add Audit Log helper
  const addAuditLog = async (action: string) => {
    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLog = {
      id: Date.now().toString(),
      action,
      user: adminEmail,
      role: adminRole,
      timestamp: timestampStr
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('audit_logs').insert({
          action,
          user: adminEmail,
          role: adminRole
        });
      } catch (err) {
        console.error('Failed to save audit log to Supabase:', err);
      }
    }
  };

  // Media Library Actions
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !allowedExts.includes(fileExt)) {
      alert('Unsupported media file format. Allowed formats: jpg, jpeg, png, webp, gif, mp4.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB Limit
      alert('Media size exceeds the 10MB limit.');
      return;
    }

    if (isSupabaseConfigured) {
      try {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        
        // Upload file to bucket 'media'
        const { error } = await supabase.storage.from('media').upload(fileName, file);
        if (error) throw error;

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName);
        const newMedia = {
          name: fileName,
          type: file.type.startsWith('video') ? 'video' : 'image',
          size: `${(file.size / 1024).toFixed(1)}KB`,
          url: publicUrlData.publicUrl
        };
        setMediaList(prev => [newMedia, ...prev]);
        addAuditLog(`Uploaded media asset: ${fileName}`);
        addNotification(`Asset ${fileName} uploaded successfully.`, 'success');
      } catch (err: any) {
        alert('Upload failed: ' + err.message);
      }
    } else {
      // Mock local upload
      const reader = new FileReader();
      reader.onload = () => {
        const newMedia = {
          name: file.name,
          type: file.type.startsWith('video') ? 'video' : 'image',
          size: `${(file.size / 1024).toFixed(1)}KB`,
          url: reader.result as string
        };
        setMediaList(prev => [newMedia, ...prev]);
        addAuditLog(`Uploaded media mock: ${file.name}`);
        addNotification(`Mock upload completed locally.`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteMedia = async (name: string) => {
    if (!confirm(`Are you sure you want to permanently delete media asset "${name}"?`)) return;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.storage.from('media').remove([name]);
        if (error) throw error;
        setMediaList(prev => prev.filter(m => m.name !== name));
        addAuditLog(`Deleted media asset: ${name}`);
        addNotification(`Deleted media asset ${name}.`, 'warning');
      } catch (err: any) {
        alert('Failed to delete media asset: ' + err.message);
      }
    } else {
      setMediaList(prev => prev.filter(m => m.name !== name));
      addAuditLog(`Deleted media mock: ${name}`);
      addNotification(`Deleted local media mock.`, 'warning');
    }
  };

  // Add subscriber email helper (mock triggers)
  const addSubscriber = (email: string) => {
    if (subscribers.some(sub => sub.email.toLowerCase() === email.toLowerCase())) return;
    const newSub = {
      email,
      date: new Date().toISOString().split('T')[0],
      source: 'Admin Add'
    };
    setSubscribers(prev => [newSub, ...prev]);
    addAuditLog(`Added newsletter subscriber: ${email}`);
  };

  // Add notification helper
  const addNotification = (message: string, type: 'info' | 'warning' | 'success') => {
    setNotifications(prev => [{ id: Date.now().toString(), message, type, read: false }, ...prev]);
  };

  // Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.id) {
      alert('Product Name and ID/Slug are required.');
      return;
    }

    if (isSupabaseConfigured) {
      try {
        const dbProductRow = {
          id: productForm.id,
          name: productForm.name,
          price: productForm.price,
          former_price: productForm.formerPrice,
          category: productForm.category,
          description: productForm.description,
          details: productForm.details,
          sizes: productForm.sizes,
          images: productForm.images,
          sold_out: !!productForm.soldOut,
          badge: productForm.badge,
          quotes: productForm.quotes,
          release_date: productForm.releaseDate
        };

        if (isCreatingProduct) {
          if (products.some(p => p.id === productForm.id)) {
            alert('Product ID already exists. Please make it unique.');
            return;
          }
          const { error } = await supabase.from('products').insert(dbProductRow);
          if (error) throw error;
          setProducts(prev => [productForm, ...prev]);
          addAuditLog(`Created product specimen: ${productForm.name} (${productForm.id})`);
          addNotification(`Product "${productForm.name}" created successfully.`, 'success');
        } else {
          const { error } = await supabase.from('products').update(dbProductRow).eq('id', productForm.id);
          if (error) throw error;
          setProducts(prev => prev.map(p => p.id === productForm.id ? productForm : p));
          addAuditLog(`Updated product coordinates: ${productForm.name} (${productForm.id})`);
          addNotification(`Product "${productForm.name}" updated successfully.`, 'success');
        }
      } catch (err: any) {
        alert('Failed to save product in database: ' + err.message);
        return;
      }
    } else {
      if (isCreatingProduct) {
        if (products.some(p => p.id === productForm.id)) {
          alert('Product ID already exists. Please make it unique.');
          return;
        }
        setProducts(prev => [productForm, ...prev]);
        addAuditLog(`Created product specimen: ${productForm.name} (${productForm.id})`);
        addNotification(`Product "${productForm.name}" created successfully.`, 'success');
      } else {
        setProducts(prev => prev.map(p => p.id === productForm.id ? productForm : p));
        addAuditLog(`Updated product coordinates: ${productForm.name} (${productForm.id})`);
        addNotification(`Product "${productForm.name}" updated successfully.`, 'success');
      }
    }
    
    setIsCreatingProduct(false);
    setEditingProduct(null);
    setProductForm(initialProductState);
  };

  const handleEditProductClick = (product: Product) => {
    setProductForm({ ...product });
    setIsCreatingProduct(false);
    setEditingProduct(product);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to permanently delete product "${productName}"?`)) {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('products').delete().eq('id', productId);
          if (error) throw error;
          setProducts(prev => prev.filter(p => p.id !== productId));
          addAuditLog(`Deleted product specimen: ${productName} (${productId})`);
          addNotification(`Product "${productName}" deleted.`, 'warning');
        } catch (err: any) {
          alert('Failed to delete product: ' + err.message);
        }
      } else {
        setProducts(prev => prev.filter(p => p.id !== productId));
        addAuditLog(`Deleted product specimen: ${productName} (${productId})`);
        addNotification(`Product "${productName}" deleted.`, 'warning');
      }
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    const duplicated = {
      ...product,
      id: `${product.id}-copy-${Math.floor(100 + Math.random() * 900)}`,
      name: `${product.name} (Copy)`
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('products').insert({
          id: duplicated.id,
          name: duplicated.name,
          price: duplicated.price,
          former_price: duplicated.formerPrice,
          category: duplicated.category,
          description: duplicated.description,
          details: duplicated.details,
          sizes: duplicated.sizes,
          images: duplicated.images,
          sold_out: !!duplicated.soldOut,
          badge: duplicated.badge,
          quotes: duplicated.quotes,
          release_date: duplicated.releaseDate
        });
        if (error) throw error;
        setProducts(prev => [duplicated, ...prev]);
        addAuditLog(`Duplicated product specimen: ${product.name} to ${duplicated.name}`);
        addNotification(`Duplicated "${product.name}" as "${duplicated.name}".`, 'success');
      } catch (err: any) {
        alert('Failed to duplicate product: ' + err.message);
      }
    } else {
      setProducts(prev => [duplicated, ...prev]);
      addAuditLog(`Duplicated product specimen: ${product.name} to ${duplicated.name}`);
      addNotification(`Duplicated "${product.name}" as "${duplicated.name}".`, 'success');
    }
  };

  // Collection Actions
  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName) return;
    const cleanName = newCollectionName.trim().toUpperCase();
    if (collections.includes(cleanName)) {
      alert('Collection already exists.');
      return;
    }
    setCollections(prev => [...prev, cleanName]);
    setNewCollectionName('');
    addAuditLog(`Added collection category: ${cleanName}`);
  };

  const handleDeleteCollection = (name: string) => {
    if (name === 'ALL') return;
    if (confirm(`Are you sure you want to delete collection "${name}"?`)) {
      setCollections(prev => prev.filter(c => c !== name));
      addAuditLog(`Deleted collection category: ${name}`);
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (error) throw error;
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        addAuditLog(`Updated order status for ${orderId} to: ${newStatus}`);
        addNotification(`Order ${orderId} updated to ${newStatus}.`, 'info');
      } catch (err: any) {
        alert('Failed to update order status: ' + err.message);
      }
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      addAuditLog(`Updated order status for ${orderId} to: ${newStatus}`);
      addNotification(`Order ${orderId} updated to ${newStatus}.`, 'info');
    }
  };

  // Promo Code Actions
  const handleCreatePromoCode = async (code: string, discount: number, desc: string) => {
    if (!code || isNaN(discount)) return;
    const cleanCode = code.trim().toUpperCase();
    if (promoCodes.some(p => p.code === cleanCode)) {
      alert('Coupon code already exists.');
      return;
    }
    const newPromo: PromoCode = {
      code: cleanCode,
      discountPercentage: discount,
      description: desc,
      isActive: true,
      usedCount: 0
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('promo_codes').insert({
          code: newPromo.code,
          discount_percentage: newPromo.discountPercentage,
          description: newPromo.description,
          is_active: newPromo.isActive,
          used_count: newPromo.usedCount
        });
        if (error) throw error;
        setPromoCodes(prev => [newPromo, ...prev]);
        addAuditLog(`Created promo code discount: ${cleanCode} (${discount}%)`);
      } catch (err: any) {
        alert('Failed to create promo code: ' + err.message);
      }
    } else {
      setPromoCodes(prev => [newPromo, ...prev]);
      addAuditLog(`Created promo code discount: ${cleanCode} (${discount}%)`);
    }
  };

  // Calculate Metrics
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const totalCustomers = Array.from(new Set(orders.map(o => o.customerEmail))).length;
  const lowStockProducts = products.filter(p => p.sizes.includes('OS') ? false : false); // Mock count or real
  const activeProducts = products.filter(p => !p.soldOut).length;

  // Real visitor counter read from localStorage
  const visitorCount = parseInt(localStorage.getItem('GHL_VISITOR_COUNT') || '0');

  // Total quantity of items sold across all orders
  const totalProductsSold = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => {
      const itemsCount = o.items ? o.items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) : 0;
      return sum + itemsCount;
    }, 0);

  // Generate a dynamic SVG path for products sold
  const getSalesChartPath = () => {
    if (orders.length === 0) {
      return {
        path: "M 0 170 L 600 170",
        areaPath: "M 0 170 L 600 170 L 600 200 L 0 200 Z",
        points: []
      };
    }
    
    // Sort orders by date (oldest first for line chart)
    const sortedOrders = [...orders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate running sold count
    let runningTotal = 0;
    const dataPoints = sortedOrders.map((o) => {
      const qty = o.items ? o.items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) : 0;
      runningTotal += qty;
      return runningTotal;
    });

    const maxVal = Math.max(...dataPoints, 5);
    const minVal = 0;
    const range = maxVal - minVal;

    // Map to SVG coordinates (600x150, padding at top 20, bottom 170)
    const points = dataPoints.map((val, idx) => {
      const x = sortedOrders.length > 1 ? (idx / (sortedOrders.length - 1)) * 600 : 300;
      const y = 170 - ((val - minVal) / range) * 130;
      return { x, y, val };
    });

    let path = `M 0 170`;
    if (points.length > 0) {
      path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
    }
    
    const startX = points[0]?.x || 0;
    const endX = points[points.length - 1]?.x || 600;
    
    const areaPath = `${path} L ${endX} 200 L ${startX} 200 Z`;

    return { path, areaPath, points };
  };

  const chartData = getSalesChartPath();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#39FF88] selection:text-black font-sans relative flex flex-col justify-stretch">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#39FF88]/5 rounded-full filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-12 left-1/4 w-[400px] h-[400px] bg-white/5 rounded-full filter blur-[100px] pointer-events-none z-0" />

      {/* LOGIN OVERLAY PANEL */}
      {!isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A] p-4 overflow-hidden">
          {/* Logo element back */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none select-none opacity-[0.02] leading-none font-black text-[30vw] outline-text uppercase tracking-tighter">
            GHL
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-[#141414] border border-[#262626] p-8 relative z-10 rounded-2xl shadow-2xl"
          >
            <div className="text-center mb-8">
              <h2 className="font-display font-black text-2xl tracking-tighter uppercase text-white">
                GHL_ADMIN_PORTAL
              </h2>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
                Security clearance level: Content & Operations
              </p>
            </div>

            {authError && (
              <div className="bg-red-950/40 border border-red-800 text-red-400 p-3.5 mb-6 text-xs font-mono rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5 font-bold">
                  ADMIN EMAIL COORDINATES:
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-4 py-3 text-xs font-mono rounded-lg outline-none text-white transition-colors"
                  placeholder="admin@gohardluxury.com"
                />
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                    SECURITY CODE DECK (PASSWORD):
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[9px] font-mono text-zinc-500 hover:text-white uppercase"
                  >
                    [Forgot Code?]
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-4 py-3 pr-10 text-xs font-mono rounded-lg outline-none text-white transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5 font-bold">
                  ASSIGNED CLEARANCE ROLE:
                </label>
                <select
                  value={adminRole}
                  onChange={(e: any) => setAdminRole(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-3 text-xs font-mono rounded-lg outline-none text-white cursor-pointer"
                >
                  <option value="Super Admin">SUPER ADMIN (All access)</option>
                  <option value="Staff Manager">STAFF MANAGER (Inventory / Orders)</option>
                  <option value="Content Manager">CONTENT MANAGER (Hero / Products)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#39FF88] text-black font-mono text-xs font-black tracking-widest rounded-lg transition-all duration-200 cursor-pointer uppercase hover:opacity-95 hover:shadow-[0_0_15px_rgba(57,255,136,0.3)]"
              >
                REQUEST SYSTEM ACCESS_
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#262626] flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-[#39FF88]" />
                SECURE AES_256 PORT
              </span>
              <button 
                onClick={onCloseStore} 
                className="hover:text-white"
              >
                ← Back to Storefront
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#141414] border border-[#262626] p-6 rounded-xl relative">
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
            <h3 className="font-display font-black text-sm uppercase text-white mb-2">
              RECOVER SECURITY DECK CODE
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-4">
              Enter your admin email address. If authorized, a recovery link will be simulated.
            </p>
            <input 
              type="email" 
              placeholder="ENTER REGISTERED EMAIL"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg text-xs font-mono outline-none mb-4 uppercase tracking-wider"
            />
            <button
              onClick={() => {
                alert(`If administrative coordinates match, recovery codes will be dispatched to ${forgotEmail || 'registered address'}.`);
                setShowForgotModal(false);
              }}
              className="w-full py-2.5 bg-white text-black font-mono text-[10px] font-black rounded-lg uppercase tracking-widest hover:opacity-90"
            >
              DISPATCH CODES_
            </button>
          </div>
        </div>
      )}

      {/* MAIN CORE ADMIN LAYOUT */}
      {isAuthenticated && (
        <div className="flex-1 flex flex-col md:flex-row relative z-10">
          {adminRole === 'Guest' ? (
            <div className="flex-1 flex items-center justify-center p-8 bg-[#0A0A0A]">
              <div className="w-full max-w-md bg-[#141414] border border-red-900/40 p-8 rounded-2xl text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
                <div className="w-16 h-16 bg-red-950/40 border border-red-800 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={28} />
                </div>
                <h2 className="font-display font-black text-xl tracking-tighter uppercase text-white mb-2">
                  Access Denied
                </h2>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">
                  Security Clearance: None
                </p>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-6">
                  Your account coordinates are not authorized with administrative access. Please contact system coordinators for clearance.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-black rounded-lg uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Disconnect Session_
                  </button>
                  <button
                    onClick={onCloseStore}
                    className="w-full py-2.5 bg-[#262626] hover:bg-[#333] text-zinc-300 font-mono text-[10px] font-black rounded-lg uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    ← Back to Storefront
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* LEFT SIDEBAR PANEL */}
              <aside className="w-full md:w-64 bg-[#0E0E0E] border-r border-[#262626] flex flex-col justify-between shrink-0">
            <div>
              {/* Brand Header */}
              <div className="p-6 border-b border-[#262626] flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-base tracking-tighter text-white uppercase">
                    GHL BACKOFFICE
                  </h2>
                  <span className="font-mono text-[8px] text-[#39FF88] uppercase tracking-widest block font-bold mt-0.5">
                    {adminRole}
                  </span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#39FF88] animate-pulse" title="System operational" />
              </div>

              {/* Navigation Links */}
              <nav className="p-4 space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { id: 'products', label: 'Products', icon: Package },
                  { id: 'collections', label: 'Collections', icon: Layers },
                  { id: 'homepage', label: 'Homepage Editor', icon: Video },
                  { id: 'orders', label: 'Orders Logs', icon: CreditCard },
                  { id: 'customers', label: 'Customers', icon: Users },
                  { id: 'media', label: 'Media Library', icon: FolderOpen },
                  { id: 'discounts', label: 'Discount Codes', icon: Tags },
                  { id: 'newsletters', label: 'Newsletters', icon: Mail },
                  { id: 'audit', label: 'Audit Logs', icon: History }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg font-mono text-xs uppercase cursor-pointer tracking-wider transition-colors ${
                        activeTab === item.id 
                          ? 'bg-[#141414] text-[#39FF88] border border-[#262626] font-bold' 
                          : 'text-zinc-400 hover:text-white hover:bg-[#141414]/40'
                      }`}
                    >
                      <Icon size={14} className={activeTab === item.id ? 'text-[#39FF88]' : 'text-zinc-500'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#262626] space-y-3">
              <button
                onClick={onCloseStore}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#262626] text-white hover:bg-[#141414] rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              >
                <Eye size={12} />
                <span>View Storefront</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/40 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              >
                <LogOut size={12} />
                <span>Kill Session</span>
              </button>
            </div>
          </aside>

          {/* RIGHT CONTENT WORKSPACE */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
            
            {/* Header row details */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#262626] mb-8">
              <div>
                <h1 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight">
                  {activeTab === 'overview' && 'SYSTEM OVERVIEW'}
                  {activeTab === 'analytics' && 'ANALYTICS & INSIGHTS'}
                  {activeTab === 'products' && 'PRODUCT CATALOG'}
                  {activeTab === 'collections' && 'COLLECTION CLASSIFIER'}
                  {activeTab === 'homepage' && 'HOMEPAGE VISUAL EDITOR'}
                  {activeTab === 'orders' && 'ORDERS DISPATCH'}
                  {activeTab === 'customers' && 'CUSTOMER LIFETIME'}
                  {activeTab === 'media' && 'CENTRALIZED MEDIA LIBRARY'}
                  {activeTab === 'discounts' && 'DISCOUNTS & PROMOTIONS'}
                  {activeTab === 'newsletters' && 'SUBSCRIBER INDEX'}
                  {activeTab === 'audit' && 'AUDIT LEDGER'}
                </h1>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  NODE REF: GHL_{activeTab.toUpperCase()}_VAULT
                </p>
              </div>

              {/* Micro widgets */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#262626]">
                <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[9px] font-bold tracking-widest uppercase ${
                  isSupabaseConfigured 
                    ? 'bg-[#39FF88]/10 border-[#39FF88]/30 text-[#39FF88]' 
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-[#39FF88]' : 'bg-yellow-500 animate-pulse'}`} />
                  <span>{isSupabaseConfigured ? 'DB: Live Sync' : 'DB: Local Offline'}</span>
                </div>

                <div className="flex items-center gap-2 bg-[#141414] border border-[#262626] px-3.5 py-2 rounded-lg">
                  <ClockTicker />
                </div>

                <div className="relative group cursor-pointer bg-[#141414] border border-[#262626] p-2 rounded-lg hover:border-[#39FF88] transition-colors relative">
                  <Bell size={14} className="text-white" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#39FF88]" />
                  )}
                </div>
              </div>
            </header>

            {/* TAB CONTENT WIDGETS */}
            <div className="space-y-8">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Grid cards statistics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: 'NUMBER OF SALES', val: totalOrders, change: 'Total Completed', icon: CreditCard },
                      { label: 'PRODUCTS AVAILABLE', val: activeProducts, change: `${products.length} catalog items`, icon: Package },
                      { label: 'PRODUCT UNITS SOLD', val: totalProductsSold, change: 'Units Dispatched', icon: TrendingUp },
                      { label: 'VISITORS LOGGED', val: visitorCount, change: 'Simulated Count', icon: Users }
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="bg-[#141414] border border-[#262626] p-5 rounded-xl flex items-center justify-between relative overflow-hidden group hover:border-zinc-700 transition-colors">
                          <div className="space-y-1">
                            <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">{card.label}</span>
                            <h3 className="font-display font-black text-xl md:text-2xl text-white">{card.val}</h3>
                            <span className="font-mono text-[9px] text-[#39FF88] font-bold block">{card.change} VS PREV COORDS</span>
                          </div>
                          <div className="bg-[#0A0A0A] border border-[#262626] p-3 rounded-lg text-zinc-400 group-hover:text-[#39FF88] group-hover:border-[#39FF88] transition-colors">
                            <Icon size={18} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Revenue Line Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* SVG Chart display */}
                    <div className="lg:col-span-12 bg-[#141414] border border-[#262626] p-6 rounded-xl space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-[#262626]">
                        <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                          PRODUCT UNITS SOLD STREAM
                        </h3>
                        <span className="font-mono text-[10px] text-[#39FF88] font-black uppercase">LIVE UPDATES ACTIVE</span>
                      </div>
                      
                      {/* Premium Custom SVG Chart */}
                      <div className="w-full h-64 relative pt-4 flex flex-col justify-between">
                        {/* Chart Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03] py-4">
                          <div className="w-full h-px bg-white" />
                          <div className="w-full h-px bg-white" />
                          <div className="w-full h-px bg-white" />
                          <div className="w-full h-px bg-white" />
                        </div>
                        
                        {/* SVG Drawing */}
                        <svg className="w-full h-full z-10 relative" viewBox="0 0 600 200" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#39FF88" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#39FF88" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {/* Area path */}
                          <path 
                            d={chartData.areaPath} 
                            fill="url(#chart-grad)"
                          />
                          {/* Line path */}
                          <path 
                            d={chartData.path} 
                            fill="none" 
                            stroke="#39FF88" 
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        </svg>

                        {/* Chart labels */}
                        <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 pt-2 border-t border-[#262626] uppercase">
                          {orders.length === 0 ? (
                            <>
                              <span>Start (0 Units)</span>
                              <span>Active Tracking Period</span>
                              <span>Current (0 Units)</span>
                            </>
                          ) : (
                            <>
                              <span>{orders[orders.length - 1]?.date || 'Start'}</span>
                              <span>Cumulative Sales Trend</span>
                              <span>{orders[0]?.date || 'Current'} ({chartData.points[chartData.points.length - 1]?.val || 0} Units)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Ledger & Subscriber Signups */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Orders stream widget */}
                    <div className="bg-[#141414] border border-[#262626] p-6 rounded-xl space-y-4">
                      <h3 className="font-display font-black text-sm uppercase text-white tracking-wide pb-3 border-b border-[#262626]">
                        RECENT ORDERS PIPELINE
                      </h3>
                      <div className="space-y-3 max-h-72 overflow-y-auto">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="bg-[#0A0A0A] border border-[#262626] p-3.5 flex justify-between items-center rounded-xl">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-black text-white">{order.id}</span>
                                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                  order.status === 'Paid' || order.status === 'Delivered' 
                                    ? 'bg-[#39FF88]/10 text-[#39FF88] border border-[#39FF88]/20' 
                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <span className="text-[10px] font-sans text-zinc-400 block mt-1">{order.customerName} ({order.customerEmail})</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-xs font-black text-white block">₦{order.totalAmount.toLocaleString()}</span>
                              <span className="text-[8px] font-mono text-zinc-500 block">{order.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subscriber indices */}
                    <div className="bg-[#141414] border border-[#262626] p-6 rounded-xl space-y-4">
                      <h3 className="font-display font-black text-sm uppercase text-white tracking-wide pb-3 border-b border-[#262626]">
                        NEWSLETTER INBOX SUBSCRIBERS
                      </h3>
                      <div className="space-y-3 max-h-72 overflow-y-auto">
                        {subscribers.slice(0, 5).map((sub, idx) => (
                          <div key={idx} className="bg-[#0A0A0A] border border-[#262626] p-3 flex justify-between items-center rounded-xl">
                            <span className="text-xs font-mono font-bold text-white lowercase">{sub.email}</span>
                            <div className="text-right flex items-center gap-3">
                              <span className="text-[9px] font-mono text-[#39FF88] bg-[#39FF88]/10 px-1.5 py-0.5 rounded border border-[#39FF88]/25 uppercase font-bold">
                                {sub.source}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-500">{sub.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 1.5: ANALYTICS (GA4 & Looker Studio) */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Overview Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cardData.map((card, idx) => (
                      <div key={idx} className="bg-[#141414] border border-[#262626] rounded-xl p-5 relative overflow-hidden transition-all hover:border-zinc-700/80">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">{card.label}</span>
                            <span className="text-2xl font-black font-display text-white mt-1 block">{card.val}</span>
                          </div>
                          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400">
                            <card.icon size={16} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-4 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                          <TrendingUp size={10} className="text-[#39FF88]" />
                          <span>{card.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main section: Looker Studio Frame and Traffic Split */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Looker Studio Embed */}
                    <div className="lg:col-span-8 bg-[#141414] border border-[#262626] rounded-xl p-6 space-y-4">
                      <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                        Google Looker Studio Report
                      </h3>
                      {lookerStudioUrl ? (
                        <div className="w-full h-[550px] border border-[#262626] rounded-lg overflow-hidden bg-black relative">
                          <iframe
                            src={lookerStudioUrl}
                            className="w-full h-full border-none"
                            allowFullScreen
                            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-[550px] border border-[#262626] border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center bg-[#0a0a0a]">
                          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-full mb-4">
                            <ExternalLink size={24} className="text-zinc-500 animate-pulse" />
                          </div>
                          <h4 className="font-display font-black text-sm uppercase text-white tracking-wider mb-2">
                            LINK GOOGLE LOOKER STUDIO
                          </h4>
                          <p className="max-w-md text-xs font-mono text-zinc-500 leading-relaxed mb-6 uppercase">
                            To render your deep-dive visual analytics reports, embed your Looker Studio report URL in the project environment variables.
                          </p>
                          <div className="bg-[#141414] border border-[#262626] p-5 rounded-lg text-left max-w-md w-full font-mono text-[10px] space-y-3 uppercase tracking-wider text-zinc-400">
                            <p className="text-[#39FF88] font-bold text-xs pb-1.5 border-b border-[#262626]">SETUP STEPS:</p>
                            <div className="flex gap-2">
                              <span className="text-[#39FF88] font-black">01.</span>
                              <span>Open your report in <a href="https://lookerstudio.google.com" target="_blank" rel="noreferrer" className="text-white hover:underline">Looker Studio</a></span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-[#39FF88] font-black">02.</span>
                              <span>Click Share ▾ &rarr; Embed report</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-[#39FF88] font-black">03.</span>
                              <span>Enable embedding and copy the Embed URL (inside src="")</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-[#39FF88] font-black">04.</span>
                              <span>Add it as VITE_LOOKER_STUDIO_URL in .env.local</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Traffic Referrals Split */}
                    <div className="lg:col-span-4 bg-[#141414] border border-[#262626] rounded-xl p-6 space-y-6">
                      <div>
                        <h3 className="font-display font-black text-sm uppercase text-white tracking-wide mb-1">
                          Traffic Channels
                        </h3>
                        <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                          Acquisition sources tracked
                        </p>
                      </div>

                      <div className="space-y-4">
                        {['Instagram', 'TikTok', 'Google', 'Direct', 'X / Twitter'].map((channel) => {
                          const count = stats.sources[channel] || 0;
                          const total = Object.values(stats.sources).reduce((a, b) => a + b, 0) || 1;
                          const pct = ((count / total) * 100).toFixed(0);

                          return (
                            <div key={channel} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs font-mono">
                                <span className="text-zinc-400 font-bold uppercase">{channel}</span>
                                <span className="text-white font-black">{pct}% <span className="text-zinc-500 font-normal">({count})</span></span>
                              </div>
                              <div className="w-full h-1.5 bg-zinc-900 border border-[#262626] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#39FF88] transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-[#0A0A0A] border border-[#262626] p-4 rounded-xl text-center">
                        <span className="font-mono text-[9px] text-[#39FF88] uppercase tracking-widest font-bold block mb-1">GA4 Property Linked</span>
                        <span className="font-mono text-xs text-white block truncate uppercase">
                          {import.meta.env.VITE_GA_MEASUREMENT_ID || 'UNLINKED // OPTIONAL'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Activity Feed */}
                  <div className="bg-[#141414] border border-[#262626] rounded-xl p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#262626] mb-4">
                      <h3 className="font-display font-black text-sm uppercase text-white tracking-wide flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#39FF88] animate-pulse" />
                        Live Event Log
                      </h3>
                      <button 
                        onClick={fetchAnalyticsEvents} 
                        className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        title="Reload logs"
                      >
                        <RefreshCw size={12} className={loadingAnalytics ? 'animate-spin' : ''} />
                      </button>
                    </div>

                    {loadingAnalytics && analyticsEvents.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 font-mono text-xs animate-pulse">
                        LOADING LIVE STREAMS...
                      </div>
                    ) : analyticsEvents.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 font-mono text-xs">
                        AWAITING CUSTOMER TELEMETRY EVENT STREAMS...
                      </div>
                    ) : (
                      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
                        {analyticsEvents.slice(0, 20).map((ev, index) => {
                          const dateObj = ev.created_at ? new Date(ev.created_at) : new Date();
                          const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                          const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: '2-digit' });
                          
                          let text = '';
                          let colorClass = 'text-zinc-400';
                          
                          if (ev.event_name === 'page_view') {
                            text = `Visitor loaded page ${ev.path || '#home'} (Source: ${ev.referrer || 'Direct'})`;
                            colorClass = 'text-zinc-500';
                          } else if (ev.event_name === 'product_view') {
                            text = `Customer viewed product detail: "${ev.product_name || ev.product_id}"`;
                            colorClass = 'text-zinc-300';
                          } else if (ev.event_name === 'add_to_cart') {
                            text = `Added "${ev.product_name || ev.product_id}" to shopping bag`;
                            colorClass = 'text-[#39FF88] font-bold';
                          } else if (ev.event_name === 'checkout_start') {
                            text = `Initiated payment checkout sequence (Subtotal: ₦${Number(ev.total || 0).toLocaleString()})`;
                            colorClass = 'text-yellow-400 font-bold';
                          } else if (ev.event_name === 'purchase') {
                            text = `ORDER PLACED SUCCESSFULLY (Ref ID: ${ev.order_id || 'GHL-REG'}, Revenue: ₦${Number(ev.total || 0).toLocaleString()})`;
                            colorClass = 'text-black bg-[#39FF88] px-2 py-0.5 rounded font-black';
                          } else {
                            text = `Triggered custom event: ${ev.event_name}`;
                          }
                          
                          return (
                            <div key={ev.id || index} className="flex gap-4 items-start text-xs border-b border-[#262626]/20 pb-3 last:border-b-0 last:pb-0">
                              <span className="font-mono text-[9px] text-[#39FF88] shrink-0 mt-0.5">[{dateStr} {timeStr}]</span>
                              <div className={`font-mono leading-relaxed ${colorClass}`}>
                                {text}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS (CRUD) */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  
                  {/* Search and Action Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-[#141414] border border-[#262626] p-4 rounded-xl">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      <div className="relative flex-1 max-w-xs">
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="SEARCH SPECIMEN LABELS..."
                          className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] pl-8 pr-4 py-2 text-xs font-mono rounded-lg outline-none text-white uppercase tracking-wider"
                        />
                        <Search size={12} className="absolute left-3.5 top-3.5 text-zinc-500" />
                      </div>
                      
                      <select
                        value={productFilterCat}
                        onChange={(e) => setProductFilterCat(e.target.value)}
                        className="bg-[#0A0A0A] border border-[#262626] text-zinc-400 text-xs font-mono px-3.5 py-2.5 rounded-lg cursor-pointer outline-none focus:border-[#39FF88]"
                      >
                        <option value="ALL">ALL CATEGORIES</option>
                        {collections.filter(c => c !== 'ALL').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setProductForm(initialProductState);
                        setIsCreatingProduct(true);
                        setEditingProduct({} as any); // Trigger modal/view
                      }}
                      className="bg-[#39FF88] text-black hover:opacity-90 px-4 py-2.5 rounded-lg font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                    >
                      <PlusCircle size={14} className="stroke-[2.5]" />
                      <span>NEW PRODUCT_</span>
                    </button>
                  </div>

                  {/* Add / Edit Form Modal Panel Overlay */}
                  {editingProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#141414] border border-[#262626] p-6 md:p-8 w-full max-w-2xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                      >
                        <button
                          onClick={() => setEditingProduct(null)}
                          className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                        
                        <h2 className="font-display font-black text-xl text-white uppercase tracking-tight mb-6">
                          {isCreatingProduct ? 'INITIATE NEW PRODUCT SPECIMEN' : `EDIT PRODUCT: ${productForm.name.toUpperCase()}`}
                        </h2>

                        <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
                          
                          {/* Col 1 */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-zinc-400 uppercase tracking-wider mb-1">SPECIMEN ID / SLUG:</label>
                              <input
                                type="text"
                                required
                                disabled={!isCreatingProduct}
                                value={productForm.id}
                                onChange={(e) => setProductForm({ ...productForm, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] disabled:opacity-50 px-3.5 py-2.5 rounded-lg outline-none text-white lowercase"
                                placeholder="ghl-cargo-vest"
                              />
                            </div>

                            <div>
                              <label className="block text-zinc-400 uppercase tracking-wider mb-1">SPECIMEN LABEL NAME:</label>
                              <input
                                type="text"
                                required
                                value={productForm.name}
                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white uppercase"
                                placeholder="GHL CARGO VEST"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-zinc-400 uppercase tracking-wider mb-1">PRICE (₦):</label>
                                <input
                                  type="number"
                                  required
                                  value={productForm.price}
                                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                                  className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-zinc-400 uppercase tracking-wider mb-1">FORMER PRICE (₦):</label>
                                <input
                                  type="number"
                                  value={productForm.formerPrice || ''}
                                  onChange={(e) => setProductForm({ ...productForm, formerPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                  className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white"
                                  placeholder="None"
                                />
                              </div>

                              <div>
                                <label className="block text-zinc-400 uppercase tracking-wider mb-1">CATEGORY:</label>
                                <select
                                  value={productForm.category}
                                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                  className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3 py-2.5 rounded-lg outline-none text-white cursor-pointer"
                                >
                                  <option value="Polos">Polos</option>
                                  <option value="Denim">Denim</option>
                                  <option value="Tees">Tees</option>
                                  <option value="Accessories">Accessories</option>
                                  <option value="Footwear">Footwear</option>
                                  <option value="Tracksuits">Tracksuits</option>
                                  <option value="Eyewear">Eyewear</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-zinc-400 uppercase tracking-wider mb-1">DESCRIPTION BRIEF:</label>
                              <textarea
                                required
                                value={productForm.description}
                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                className="w-full h-24 bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white font-sans normal-case resize-none"
                                placeholder="Product description narratives..."
                              />
                            </div>
                          </div>

                          {/* Col 2 */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-zinc-400 uppercase tracking-wider mb-1">MANTRA / QUOTE INSPIRATION:</label>
                              <input
                                type="text"
                                value={productForm.quotes || ''}
                                onChange={(e) => setProductForm({ ...productForm, quotes: e.target.value })}
                                className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white normal-case"
                                placeholder="'Silenced in combat. Born in war.'"
                              />
                            </div>
                            <div>
                               <label className="block text-zinc-400 uppercase tracking-wider mb-1">PRODUCT CATALOG IMAGE:</label>
                               
                               <div className="flex gap-2 relative">
                                 <input
                                   type="text"
                                   value={productForm.images[0] || ''}
                                   onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                                   className="flex-1 bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white text-xs font-mono"
                                   placeholder="Enter image URL or choose source..."
                                 />
                                 
                                 <input 
                                   type="file"
                                   id="product-image-uploader-laptop"
                                   accept="image/*"
                                   className="hidden"
                                   onChange={async (e) => {
                                     const file = e.target.files?.[0];
                                     if (!file) return;
                                     
                                     if (isSupabaseConfigured) {
                                       try {
                                         const fileExt = file.name.split('.').pop();
                                         const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
                                         
                                         // Upload to Supabase Storage
                                         const { error } = await supabase.storage.from('media').upload(fileName, file);
                                         if (error) throw error;
                                         
                                         const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName);
                                         setProductForm({ ...productForm, images: [publicUrlData.publicUrl] });
                                         addAuditLog(`Uploaded product image: ${fileName}`);
                                         addNotification(`Product image uploaded.`, 'success');
                                       } catch (err: any) {
                                         alert('Upload failed: ' + err.message);
                                       }
                                     } else {
                                       // Local fallback (Base64)
                                       const reader = new FileReader();
                                       reader.onload = () => {
                                         setProductForm({ ...productForm, images: [reader.result as string] });
                                         addNotification(`Local mock image uploaded.`, 'success');
                                       };
                                       reader.readAsDataURL(file);
                                     }
                                   }}
                                 />

                                 <div className="relative">
                                   <button
                                     type="button"
                                     onClick={() => setShowImageDropdown(!showImageDropdown)}
                                     className="bg-white text-black px-4 py-3 font-mono text-[10px] font-black rounded-lg uppercase tracking-widest hover:opacity-90 cursor-pointer shrink-0 flex items-center gap-1.5 h-full"
                                   >
                                     <span>Add Image</span>
                                     <span className="text-[7px]">▼</span>
                                   </button>
                                   
                                   {showImageDropdown && (
                                     <div className="absolute right-0 mt-2 w-52 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl z-30 p-1.5 font-mono text-[9px] uppercase tracking-wider">
                                       <button
                                         type="button"
                                         onClick={() => {
                                           setShowImageDropdown(false);
                                           document.getElementById('product-image-uploader-laptop')?.click();
                                         }}
                                         className="w-full text-left px-3 py-2 text-zinc-300 hover:text-white hover:bg-[#262626] rounded-lg transition-colors flex items-center gap-2"
                                       >
                                         <Laptop size={12} className="text-[#39FF88]" />
                                         <span>Upload from Laptop</span>
                                       </button>
                                       <button
                                         type="button"
                                         onClick={() => {
                                           setShowImageDropdown(false);
                                           // Reset session ID and open mobile uplink modal
                                           setMobileSessionId(Math.random().toString(36).substring(2, 12));
                                           setShowMobileUplinkModal(true);
                                         }}
                                         className="w-full text-left px-3 py-2 text-zinc-300 hover:text-white hover:bg-[#262626] rounded-lg transition-colors flex items-center gap-2"
                                       >
                                         <Smartphone size={12} className="text-[#39FF88]" />
                                         <span>Mobile Camera Uplink</span>
                                       </button>
                                       <button
                                         type="button"
                                         onClick={() => {
                                           setShowImageDropdown(false);
                                           setShowMediaLibraryModal(true);
                                         }}
                                         className="w-full text-left px-3 py-2 text-zinc-300 hover:text-white hover:bg-[#262626] rounded-lg transition-colors flex items-center gap-2"
                                       >
                                         <FolderOpen size={12} className="text-[#39FF88]" />
                                         <span>From Media Library</span>
                                       </button>
                                     </div>
                                   )}
                                 </div>
                               </div>
                               <span className="text-[8px] text-zinc-500 uppercase mt-1.5 block tracking-wider font-mono">
                                 Select source from dropdown to add images from Laptop or Mobile camera.
                               </span>
                             </div>

                            <div>
                              <label className="block text-zinc-400 uppercase tracking-wider mb-1">SIZING GRIDS AVAILABLE:</label>
                              <div className="flex gap-3 flex-wrap">
                                {['S', 'M', 'L', 'XL', 'OS'].map(sz => {
                                  const included = productForm.sizes.includes(sz);
                                  return (
                                    <button
                                      key={sz}
                                      type="button"
                                      onClick={() => {
                                        const nextSizes = included 
                                          ? productForm.sizes.filter((s: string) => s !== sz)
                                          : [...productForm.sizes, sz];
                                        setProductForm({ ...productForm, sizes: nextSizes });
                                      }}
                                      className={`px-3 py-1.5 border text-[10px] font-bold transition-colors ${
                                        included 
                                          ? 'bg-white text-black border-white' 
                                          : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
                                      }`}
                                    >
                                      {sz}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div>
                                <label className="block text-zinc-400 uppercase tracking-wider mb-1">STATUS BADGE:</label>
                                <select
                                  value={productForm.badge || 'NEW ARRIVAL'}
                                  onChange={(e) => setProductForm({ ...productForm, badge: e.target.value as any })}
                                  className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-2 py-2 rounded-lg outline-none text-white cursor-pointer"
                                >
                                  <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                                  <option value="ARCHIVE PIECE">ARCHIVE PIECE</option>
                                  <option value="1of1">1of1 SPECIAL</option>
                                  <option value="BEST SELLER">BEST SELLER</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-zinc-400 uppercase tracking-wider mb-1">DISMISS INVENTORY:</label>
                                <div className="flex items-center gap-2 mt-2">
                                  <input
                                    type="checkbox"
                                    id="soldout-checkbox"
                                    checked={productForm.soldOut || false}
                                    onChange={(e) => setProductForm({ ...productForm, soldOut: e.target.checked })}
                                    className="accent-[#39FF88]"
                                  />
                                  <label htmlFor="soldout-checkbox" className="text-zinc-300 uppercase cursor-pointer select-none">
                                    SOLD OUT
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Submit Actions */}
                          <div className="md:col-span-2 pt-6 border-t border-[#262626] flex justify-end gap-3.5">
                            <button
                              type="button"
                              onClick={() => setEditingProduct(null)}
                              className="px-4 py-2.5 border border-[#262626] text-white hover:bg-zinc-900 rounded-lg cursor-pointer font-bold uppercase tracking-wider text-[10px]"
                            >
                              Abort Coordinates
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2.5 bg-[#39FF88] text-black font-black uppercase rounded-lg hover:opacity-90 cursor-pointer tracking-wider text-[10px]"
                            >
                              Commit Product Specimen_
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}

                  {/* Main Interactive Products Table */}
                  <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#0A0A0A] border-b border-[#262626] font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-black">
                            <th className="py-4 px-6">SPECIMEN ID</th>
                            <th className="py-4 px-6">LABEL NAME</th>
                            <th className="py-4 px-6">CATEGORY</th>
                            <th className="py-4 px-6">PRICE</th>
                            <th className="py-4 px-6">SIZES</th>
                            <th className="py-4 px-6">STATUS</th>
                            <th className="py-4 px-6 text-right">OPERATIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#262626] text-xs font-mono">
                          {products
                            .filter(p => {
                              const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.id.toLowerCase().includes(productSearch.toLowerCase());
                              const matchCat = productFilterCat === 'ALL' || p.category.toUpperCase() === productFilterCat.toUpperCase();
                              return matchSearch && matchCat;
                            })
                            .map((p) => (
                              <tr key={p.id} className="hover:bg-[#0A0A0A]/40 transition-colors">
                                <td className="py-4 px-6 font-bold text-zinc-400 select-all">{p.id}</td>
                                <td className="py-4 px-6 font-display font-black text-white uppercase tracking-tight">{p.name}</td>
                                <td className="py-4 px-6 text-zinc-300 font-bold uppercase">{p.category}</td>
                                <td className="py-4 px-6 font-black text-white">₦{p.price.toLocaleString()}</td>
                                <td className="py-4 px-6 text-zinc-500 font-bold">{p.sizes.join(', ')}</td>
                                <td className="py-4 px-6">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                    p.soldOut 
                                      ? 'bg-red-950/20 border-red-900 text-red-500' 
                                      : 'bg-[#39FF88]/10 border-[#39FF88]/30 text-[#39FF88]'
                                  }`}>
                                    {p.soldOut ? 'SOLD OUT' : 'ACTIVE'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right space-x-2 shrink-0">
                                  <button
                                    onClick={() => handleEditProductClick(p)}
                                    className="p-2 border border-[#262626] hover:border-[#39FF88] text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title="Edit coordinates"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateProduct(p)}
                                    className="p-2 border border-[#262626] hover:border-[#39FF88] text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title="Duplicate product"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                    className="p-2 border border-[#262626] hover:border-red-500 text-zinc-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                    title="Delete specimen"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: COLLECTIONS */}
              {activeTab === 'collections' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Side: Create Collection */}
                  <div className="md:col-span-5 bg-[#141414] border border-[#262626] p-6 rounded-xl space-y-4 h-fit">
                    <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                      INITIATE BRAND DROP CATEGORY
                    </h3>
                    <form onSubmit={handleAddCollection} className="space-y-4 text-xs font-mono">
                      <div>
                        <label className="block text-zinc-400 uppercase tracking-widest mb-1.5 font-bold">
                          COLLECTION / CATEGORY NAME:
                        </label>
                        <input
                          type="text"
                          required
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          placeholder="e.g. FOOTWEAR"
                          className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white uppercase"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#39FF88] text-black font-black uppercase tracking-widest rounded-lg hover:opacity-90 cursor-pointer"
                      >
                        CREATE DROP INDEX_
                      </button>
                    </form>
                  </div>

                  {/* Right Side: Collections list */}
                  <div className="md:col-span-7 bg-[#141414] border border-[#262626] p-6 rounded-xl space-y-4">
                    <h3 className="font-display font-black text-sm uppercase text-white tracking-wide pb-3 border-b border-[#262626]">
                      ACTIVE DEPLOYED CHANNELS ({collections.length})
                    </h3>
                    
                    <div className="space-y-3.5">
                      {collections.map((col) => (
                        <div key={col} className="bg-[#0A0A0A] border border-[#262626] p-4 flex justify-between items-center rounded-xl">
                          <div>
                            <span className="font-display font-black text-sm text-white uppercase tracking-wider">{col}</span>
                            <span className="font-mono text-[9px] text-zinc-500 block uppercase mt-0.5">
                              Matches {products.filter(p => p.category.toUpperCase() === col).length} active products
                            </span>
                          </div>
                          
                          {col !== 'ALL' && (
                            <button
                              onClick={() => handleDeleteCollection(col)}
                              className="p-2.5 border border-[#262626] hover:border-red-500 text-zinc-500 hover:text-red-500 rounded-lg cursor-pointer"
                              title="Delete collection"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: HOMEPAGE CONTENT MANAGER */}
              {activeTab === 'homepage' && (
                <div className="bg-[#141414] border border-[#262626] p-6 md:p-8 rounded-xl space-y-6">
                  <div className="border-b border-[#262626] pb-4">
                    <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                      HOMEPAGE LIVE CONTENT EDIT CONFIG
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans mt-1">
                      Modify visual headers, backgrounds, announcement ticker texts, and featured catalog categories instantly.
                    </p>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setHomepageConfig(homepageConfig);
                      addAuditLog('Saved customized homepage content configurations');
                      addNotification('Homepage visual configs saved.', 'success');

                      if (isSupabaseConfigured) {
                        try {
                          const { error } = await supabase
                            .from('homepage_config')
                            .update({
                              announcement_text: homepageConfig.announcementText,
                              announcement_enabled: !!homepageConfig.announcementEnabled,
                              hero_headline: homepageConfig.heroHeadline,
                              hero_subheadline: homepageConfig.heroSubheadline,
                              hero_description: homepageConfig.heroDescription,
                              hero_video_url: homepageConfig.heroVideoUrl,
                              cta_text: homepageConfig.ctaText,
                              featured_collection_category: homepageConfig.featuredCollectionCategory
                            })
                            .eq('id', 'singleton');
                          if (error) throw error;
                          console.log('Homepage configuration successfully saved to Supabase.');
                        } catch (err: any) {
                          alert('Failed to save configuration to live database: ' + err.message);
                        }
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono"
                  >
                    {/* Announcement Ticker Row */}
                    <div className="space-y-4 bg-[#0A0A0A] p-5 border border-[#262626] rounded-xl md:col-span-2">
                      <div className="flex justify-between items-center pb-2 border-b border-[#262626] mb-3">
                        <span className="font-display font-black text-xs uppercase text-[#39FF88]">ANNOUNCEMENT BAR COORDINATOR</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="ann-enabled" 
                            checked={homepageConfig.announcementEnabled}
                            onChange={(e) => setHomepageConfig({ ...homepageConfig, announcementEnabled: e.target.checked })}
                            className="accent-[#39FF88]"
                          />
                          <label htmlFor="ann-enabled" className="text-zinc-300 font-bold uppercase select-none cursor-pointer">ENABLED</label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-zinc-400 uppercase tracking-widest mb-1.5 font-bold">
                          ANNOUNCEMENT SCROLL MANTRA TEXT:
                        </label>
                        <input
                          type="text"
                          required
                          value={homepageConfig.announcementText}
                          onChange={(e) => setHomepageConfig({ ...homepageConfig, announcementText: e.target.value })}
                          className="w-full bg-[#141414] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white uppercase"
                        />
                      </div>
                    </div>

                    {/* Hero Section settings */}
                    <div className="space-y-4 bg-[#0A0A0A] p-5 border border-[#262626] rounded-xl">
                      <span className="font-display font-black text-xs uppercase text-white block pb-2 border-b border-[#262626] mb-3">HERO SEGMENT OVERLAYS</span>
                      
                      <div>
                        <label className="block text-zinc-400 uppercase tracking-widest mb-1 font-bold">HERO CENTERPIECE TITLE:</label>
                        <input
                          type="text"
                          required
                          value={homepageConfig.heroHeadline}
                          onChange={(e) => setHomepageConfig({ ...homepageConfig, heroHeadline: e.target.value })}
                          className="w-full bg-[#141414] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase tracking-widest mb-1 font-bold">HERO TOP REFERENCE TAG:</label>
                        <input
                          type="text"
                          required
                          value={homepageConfig.heroSubheadline}
                          onChange={(e) => setHomepageConfig({ ...homepageConfig, heroSubheadline: e.target.value })}
                          className="w-full bg-[#141414] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase tracking-widest mb-1 font-bold">HERO DESCRIPTION MANTRA:</label>
                        <textarea
                          required
                          value={homepageConfig.heroDescription}
                          onChange={(e) => setHomepageConfig({ ...homepageConfig, heroDescription: e.target.value })}
                          className="w-full h-20 bg-[#141414] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white font-sans normal-case resize-none"
                        />
                      </div>
                    </div>

                    {/* Hero Visual Media settings */}
                    <div className="space-y-4 bg-[#0A0A0A] p-5 border border-[#262626] rounded-xl">
                      <span className="font-display font-black text-xs uppercase text-white block pb-2 border-b border-[#262626] mb-3">BACKGROUND DESIGN MEDIA</span>

                      <div>
                        <label className="block text-zinc-400 uppercase tracking-widest mb-1 font-bold">BACKGROUND MOCK VIDEO URL:</label>
                        <input
                          type="text"
                          required
                          value={homepageConfig.heroVideoUrl}
                          onChange={(e) => setHomepageConfig({ ...homepageConfig, heroVideoUrl: e.target.value })}
                          className="w-full bg-[#141414] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white lowercase"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase tracking-widest mb-1 font-bold">PRIMARY CALL TO ACTION BUTTON LABEL:</label>
                        <input
                          type="text"
                          required
                          value={homepageConfig.ctaText}
                          onChange={(e) => setHomepageConfig({ ...homepageConfig, ctaText: e.target.value })}
                          className="w-full bg-[#141414] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase tracking-widest mb-1 font-bold">FEATURED HOMEPAGE COLLECTION CATEGORY:</label>
                        <select
                          value={homepageConfig.featuredCollectionCategory}
                          onChange={(e) => setHomepageConfig({ ...homepageConfig, featuredCollectionCategory: e.target.value })}
                          className="w-full bg-[#141414] border border-[#262626] focus:border-[#39FF88] px-3 py-2.5 rounded-lg outline-none text-white cursor-pointer"
                        >
                          {collections.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2 pt-6 border-t border-[#262626] flex justify-end">
                      <button
                        type="submit"
                        className="px-8 py-3 bg-[#39FF88] text-black font-black uppercase tracking-widest rounded-lg hover:opacity-95 cursor-pointer shadow-md"
                      >
                        SAVE HOMEPAGE CONFIGS_
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 5: ORDERS */}
              {activeTab === 'orders' && (
                <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0A0A0A] border-b border-[#262626] font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-black">
                          <th className="py-4 px-6">ORDER NUMBER</th>
                          <th className="py-4 px-6">DATE</th>
                          <th className="py-4 px-6">CUSTOMER</th>
                          <th className="py-4 px-6">ITEMS QUANTITY</th>
                          <th className="py-4 px-6">GRAND TOTAL</th>
                          <th className="py-4 px-6">DISPATCH STATUS</th>
                          <th className="py-4 px-6 text-right">CHANGE STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#262626] text-xs font-mono">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-[#0A0A0A]/40 transition-colors">
                            <td className="py-4 px-6 font-bold text-[#39FF88] select-all">{o.id}</td>
                            <td className="py-4 px-6 text-zinc-400">{o.date}</td>
                            <td className="py-4 px-6">
                              <span className="text-white font-bold block">{o.customerName}</span>
                              <span className="text-[10px] text-zinc-500 lowercase block">{o.customerEmail}</span>
                            </td>
                            <td className="py-4 px-6 text-zinc-300 font-bold uppercase">
                              {o.items.map((i: any, idx: number) => (
                                <span key={idx} className="block text-[10px]">
                                  {i.productName} ({i.size}) × {i.quantity}
                                </span>
                              ))}
                            </td>
                            <td className="py-4 px-6 font-black text-white">₦{o.totalAmount.toLocaleString()}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                o.status === 'Cancelled'
                                  ? 'bg-red-950/20 border-red-900 text-red-500'
                                  : o.status === 'Paid' || o.status === 'Delivered'
                                    ? 'bg-[#39FF88]/10 border-[#39FF88]/30 text-[#39FF88]'
                                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="bg-[#0A0A0A] border border-[#262626] text-white text-[10px] font-mono px-2 py-1 rounded cursor-pointer outline-none focus:border-[#39FF88]"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0A0A0A] border-b border-[#262626] font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-black">
                          <th className="py-4 px-6">CUSTOMER DETAILS</th>
                          <th className="py-4 px-6">EMAIL ACCOUNT</th>
                          <th className="py-4 px-6">TOTAL COORDS ORDERED</th>
                          <th className="py-4 px-6">LIFETIME REVENUE INVESTMENT</th>
                          <th className="py-4 px-6">ANALYTIC RATING</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#262626] text-xs font-mono">
                        {Array.from(new Set(orders.map(o => o.customerEmail))).map((email) => {
                          const customerOrders = orders.filter(o => o.customerEmail === email);
                          const customerName = customerOrders[0]?.customerName || 'N/A';
                          const totalVal = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                          return (
                            <tr key={email} className="hover:bg-[#0A0A0A]/40 transition-colors">
                              <td className="py-4 px-6 font-display font-black text-white uppercase tracking-tight">{customerName}</td>
                              <td className="py-4 px-6 text-zinc-400 select-all lowercase">{email}</td>
                              <td className="py-4 px-6 font-bold text-zinc-300">{customerOrders.length} ORDERS</td>
                              <td className="py-4 px-6 font-black text-[#39FF88]">₦{totalVal.toLocaleString()}</td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                  totalVal >= 1000000 
                                    ? 'bg-[#39FF88]/20 text-[#39FF88]' 
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}>
                                  {totalVal >= 1000000 ? 'VIP CLIENT' : 'REGULAR CLIENT'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: MEDIA LIBRARY */}
              {activeTab === 'media' && (
                <div className="bg-[#141414] border border-[#262626] p-6 rounded-xl space-y-6">
                  
                  {/* File Upload drag card */}
                  <div 
                    className="border border-dashed border-[#262626] rounded-xl p-8 text-center space-y-3.5 bg-[#0A0A0A]/50 relative hover:border-[#39FF88]/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleUploadFile} 
                      className="hidden" 
                      accept="image/*,video/mp4" 
                    />
                    <div className="text-zinc-500 font-mono text-xs uppercase font-bold">
                      CLICK OR DRAG STREETWEAR MEDIA ARCHIVE FILES TO UPLOAD
                    </div>
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                      Accepts: JPEGs, PNGs, and compressed mp4 loops (Max 80MB)
                    </p>
                    <button className="bg-white text-black px-4 py-2 font-mono text-[10px] font-black rounded-lg uppercase tracking-widest mx-auto block cursor-pointer">
                      CHOOSE FILES_
                    </button>
                  </div>

                  {/* Media gallery grid */}
                  <div className="space-y-4">
                    <span className="font-display font-black text-xs uppercase text-zinc-400 tracking-wider block pb-2 border-b border-[#262626]">
                      STORED MEDIA SPECIMENS ({mediaList.length})
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                      {mediaList.map((file, idx) => (
                        <div key={idx} className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-3 flex flex-col justify-between h-40 hover:border-zinc-700 transition-colors relative group">
                          
                          {/* Delete action overlay */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMedia(file.name);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-950/80 border border-red-800 text-red-400 hover:bg-red-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 size={12} />
                          </button>

                          {/* Image/Video preview context */}
                          <div className="bg-zinc-900/40 rounded-lg flex-1 flex items-center justify-center text-zinc-600 group-hover:text-[#39FF88] transition-colors mb-2.5 border border-white/5 overflow-hidden h-24">
                            {file.type === 'video' ? (
                              <Video size={24} />
                            ) : file.url.startsWith('data:') || file.url.startsWith('http') || file.url.startsWith('/') ? (
                              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <FolderOpen size={24} />
                            )}
                          </div>
                          
                          <div className="space-y-0.5">
                            <span className="font-mono text-[9px] text-white block truncate uppercase font-bold" title={file.name}>
                              {file.name}
                            </span>
                            <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(file.url);
                                  alert('Public URL copied to clipboard!');
                                }}
                                className="hover:text-white transition-colors cursor-pointer text-[7px] uppercase font-bold"
                              >
                                [Copy Coords]
                              </button>
                              <span>{file.size}</span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 8: DISCOUNTS */}
              {activeTab === 'discounts' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Create Discount Code */}
                  <div className="md:col-span-5 bg-[#141414] border border-[#262626] p-6 rounded-xl space-y-4 h-fit">
                    <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                      CREATE PROMO DISCOUNT CODE
                    </h3>
                    
                    <form 
                      onSubmit={(e: any) => {
                        e.preventDefault();
                        const code = e.target.promo_code.value;
                        const disc = parseFloat(e.target.promo_discount.value);
                        const desc = e.target.promo_desc.value;
                        handleCreatePromoCode(code, disc, desc);
                        e.target.reset();
                      }}
                      className="space-y-4 text-xs font-mono"
                    >
                      <div>
                        <label className="block text-zinc-400 uppercase tracking-widest mb-1 font-bold">CODE LABEL (e.g. GHL15):</label>
                        <input
                          name="promo_code"
                          type="text"
                          required
                          placeholder="e.g. GHL20"
                          className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase tracking-widest mb-1 font-bold">DISCOUNT PROPORTION (%):</label>
                        <input
                          name="promo_discount"
                          type="number"
                          required
                          min="1"
                          max="100"
                          placeholder="20"
                          className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 uppercase tracking-widest mb-1 font-bold">DESCRIPTION COORDINATES:</label>
                        <input
                          name="promo_desc"
                          type="text"
                          required
                          placeholder="20% OFF Summer drops"
                          className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-2.5 rounded-lg outline-none text-white normal-case"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#39FF88] text-black font-black uppercase tracking-widest rounded-lg hover:opacity-90 cursor-pointer"
                      >
                        SAVE DISCOUNT CODE_
                      </button>
                    </form>
                  </div>

                  {/* Discount list table */}
                  <div className="md:col-span-7 bg-[#141414] border border-[#262626] p-6 rounded-xl space-y-4">
                    <h3 className="font-display font-black text-sm uppercase text-white tracking-wide pb-3 border-b border-[#262626]">
                      ACTIVE DISCOUNTS INDEX
                    </h3>

                    <div className="space-y-3.5">
                      {promoCodes.map((promo) => (
                        <div key={promo.code} className="bg-[#0A0A0A] border border-[#262626] p-4 flex justify-between items-center rounded-xl">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-sm text-[#39FF88] uppercase tracking-wider">{promo.code}</span>
                              <span className="text-[9px] font-mono font-bold bg-[#39FF88]/10 text-[#39FF88] px-1.5 py-0.5 rounded border border-[#39FF88]/25">
                                {promo.discountPercentage}% OFF
                              </span>
                            </div>
                            <span className="font-mono text-[9px] text-zinc-500 block uppercase mt-1">
                              {promo.description} // {promo.usedCount} USAGES LOGGED
                            </span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setPromoCodes(prev => prev.filter(p => p.code !== promo.code));
                              addAuditLog(`Deleted promo code discount: ${promo.code}`);
                            }}
                            className="p-2.5 border border-[#262626] hover:border-red-500 text-zinc-500 hover:text-red-500 rounded-lg cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 9: NEWSLETTER INDEX */}
              {activeTab === 'newsletters' && (
                <div className="bg-[#141414] border border-[#262626] p-6 rounded-xl space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-[#262626]">
                    <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                      SUBSCRIBERS DATABASE
                    </h3>
                    
                    {/* Add Subscriber Form */}
                    <form 
                      onSubmit={(e: any) => {
                        e.preventDefault();
                        const email = e.target.sub_email.value;
                        addSubscriber(email);
                        e.target.reset();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input 
                        name="sub_email"
                        type="email"
                        required
                        placeholder="ADD SUBSCRIBER EMAIL"
                        className="bg-[#0A0A0A] border border-[#262626] focus:border-[#39FF88] px-3.5 py-1.5 rounded-lg text-xs font-mono outline-none lowercase"
                      />
                      <button 
                        type="submit"
                        className="px-3.5 py-2 bg-white text-black font-mono text-[10px] font-black rounded-lg uppercase tracking-wider cursor-pointer"
                      >
                        Add_
                      </button>
                    </form>
                  </div>

                  <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#141414] border-b border-[#262626] font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-black">
                          <th className="py-3 px-5">EMAIL ADDRESS</th>
                          <th className="py-3 px-5">REGISTRATION DATE</th>
                          <th className="py-3 px-5">SOURCE COORDINATE</th>
                          <th className="py-3 px-5 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#262626] text-xs font-mono">
                        {subscribers.map((sub, idx) => (
                          <tr key={idx} className="hover:bg-[#141414]/20">
                            <td className="py-3.5 px-5 text-white lowercase select-all font-bold">{sub.email}</td>
                            <td className="py-3.5 px-5 text-zinc-400">{sub.date}</td>
                            <td className="py-3.5 px-5">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase">{sub.source}</span>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                onClick={() => {
                                  setSubscribers(prev => prev.filter((_, i) => i !== idx));
                                  addAuditLog(`Deleted newsletter subscriber: ${sub.email}`);
                                }}
                                className="text-zinc-500 hover:text-red-500 cursor-pointer"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        // Simulated CSV export
                        const csvContent = "data:text/csv;charset=utf-8," 
                          + ["Email,Date,Source"].concat(subscribers.map(s => `${s.email},${s.date},${s.source}`)).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "ghl_newsletter_subscribers.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        addAuditLog('Exported newsletter subscribers index as CSV file');
                      }}
                      className="px-4 py-2.5 border border-[#262626] text-white hover:bg-[#0A0A0A] rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Export Database (CSV)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 10: AUDIT LOGS */}
              {activeTab === 'audit' && (
                <div className="bg-[#141414] border border-[#262626] p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#262626]">
                    <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                      LEDGER AUDIT HISTORY
                    </h3>
                    <button
                      onClick={() => {
                        if (confirm('Clear audit logs ledger?')) {
                          setAuditLogs([]);
                          localStorage.setItem('GHL_AUDIT_LOGS', JSON.stringify([]));
                        }
                      }}
                      className="text-[9px] font-mono text-zinc-500 hover:text-red-500 uppercase cursor-pointer"
                    >
                      [CLEAR ALL COORDINATES]
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="bg-[#0A0A0A] border border-[#262626] p-3 flex flex-col sm:flex-row justify-between gap-3 text-xs font-mono rounded-lg">
                        <div className="space-y-1">
                          <span className="text-white block font-bold uppercase tracking-wide">{log.action}</span>
                          <span className="text-[10px] text-zinc-500 block uppercase">
                            EXEC: {log.user} ({log.role})
                          </span>
                        </div>
                        <span className="text-zinc-500 text-[10px] self-start sm:self-center font-bold">
                          {log.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </main>
        </>
        )}
      </div>
    )}

      {/* Admin Footer bar */}
      <footer className="bg-[#0E0E0E] border-t border-[#262626] py-3.5 px-6 font-mono text-[9px] text-zinc-500 text-center flex flex-col sm:flex-row justify-between items-center gap-2 z-10">
        <span>© {new Date().getFullYear()} GO HARD LUXURY // ADMIN CMS V1.2.0 STABLE</span>
        <span className="text-zinc-600">AUTHORIZED ACCESS PORT COORDINATES ONLY</span>
      </footer>
      {/* Mobile Uplink Modal */}
      {showMobileUplinkModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-[#141414] border border-[#262626] p-6 rounded-2xl relative text-center space-y-5 shadow-2xl">
            <button 
              onClick={() => setShowMobileUplinkModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
            
            <div className="space-y-1">
              <h3 className="font-display font-black text-sm uppercase text-white tracking-wider">
                MOBILE UPLINK RADAR
              </h3>
              <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                Scan this QR code with your phone camera to initialize secure mobile transmission channel.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl mx-auto w-fit border border-[#262626]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=000000&bgcolor=ffffff&data=${encodeURIComponent(
                  `${window.location.origin}${window.location.pathname}#mobile-upload?session=${mobileSessionId}`
                )}`}
                alt="Scan Uplink QR"
                className="w-40 h-40"
              />
            </div>

            <div className="bg-[#0A0A0A] border border-[#262626] p-3 rounded-lg text-left space-y-1">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Manual Link Coordinates:</span>
              <span className="text-[8px] font-mono text-zinc-400 break-all block select-all">
                {`${window.location.origin}${window.location.pathname}#mobile-upload?session=${mobileSessionId}`}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-[9px] font-mono text-[#39FF88] uppercase tracking-widest font-black animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#39FF88] animate-ping" />
              <span>Awaiting mobile broadcast...</span>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Selection Modal */}
      {showMediaLibraryModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-[#141414] border border-[#262626] p-6 rounded-2xl relative shadow-2xl space-y-4">
            <button 
              onClick={() => setShowMediaLibraryModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
            
            <div>
              <h3 className="font-display font-black text-sm uppercase text-white tracking-wider">
                CHOOSE FROM STORED MEDIA
              </h3>
              <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                Select an image file from the centralized vault to associate with this product.
              </p>
            </div>

            <div className="border-t border-[#262626] pt-4">
              {mediaList.filter(m => m.type === 'image').length === 0 ? (
                <div className="text-center py-12 font-mono text-[10px] text-zinc-500 uppercase">
                  No images stored in library. Use Laptop or Mobile upload first.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {mediaList.filter(m => m.type === 'image').map((file, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setProductForm(prev => ({ ...prev, images: [file.url] }));
                        setShowMediaLibraryModal(false);
                        addNotification(`Selected image: ${file.name}`, 'success');
                      }}
                      className="border border-[#262626] hover:border-[#39FF88] bg-[#0A0A0A] p-2 rounded-xl cursor-pointer transition-all duration-200 relative group flex flex-col justify-between"
                    >
                      <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center mb-1.5 border border-white/5">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400 truncate block text-center uppercase font-bold" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Live UTC time ticker widget component
const ClockTicker: React.FC = () => {
  const [time, setTime] = useState<string>('');
  useEffect(() => {
    const update = () => {
      setTime(new Date().toISOString().replace('T', ' ').substring(0, 19));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="font-mono text-[9px] font-bold text-zinc-400">
      UTC SECURE: {time}
    </span>
  );
};
