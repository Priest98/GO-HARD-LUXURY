import React, { useState, useEffect } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, Smartphone } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export const MobileUploadUplink: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'compressing' | 'uploading' | 'broadcasting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Parse session ID from hash route
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const session = params.get('session') || '';
    setSessionId(session);
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800; // Limit dimensions for broadcast/performance
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // Export as JPEG with 0.65 quality to keep size under 150KB
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!sessionId) {
      setStatus('error');
      setErrorMsg('No active uplink session found. Please scan the QR code again.');
      return;
    }

    try {
      setStatus('compressing');
      
      // Compress image first for local preview and fallback
      const compressedDataUrl = await compressImage(file);
      setPreviewUrl(compressedDataUrl);

      let finalUrl = compressedDataUrl;

      if (isSupabaseConfigured) {
        setStatus('uploading');
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `uplink-${sessionId}-${Date.now()}.${fileExt}`;
        
        // Upload to Supabase Storage in 'media' bucket
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);

        finalUrl = publicUrlData.publicUrl;
      }

      setStatus('broadcasting');

      // Initialize realtime channel and broadcast the URL
      const channel = supabase.channel(`mobile-upload-${sessionId}`, {
        config: {
          broadcast: { self: true }
        }
      });

      channel.subscribe(async (statusSubscription) => {
        if (statusSubscription === 'SUBSCRIBED') {
          const resp = await channel.send({
            type: 'broadcast',
            event: 'upload-success',
            payload: { imageUrl: finalUrl }
          });
          
          if (resp === 'ok') {
            setStatus('success');
          } else {
            setStatus('error');
            setErrorMsg('Uplink transmission failed. Please try again.');
          }
        }
      });
    } catch (err: any) {
      console.error('Uplink failed', err);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to transmit media asset.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between p-6 md:p-8 font-sans selection:bg-[#39FF88] selection:text-black">
      {/* Decorative Matrix grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5 z-0">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-white" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-white" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#262626] pb-4 flex justify-between items-center">
        <div>
          <h1 className="font-display font-black text-lg uppercase tracking-wider text-white">
            GO HARD LUXURY
          </h1>
          <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
            Mobile Uplink Terminal
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#39FF88]/10 border border-[#39FF88]/20 text-[#39FF88] text-[8px] font-mono font-bold tracking-widest uppercase">
          <Smartphone size={8} />
          <span>Active Session</span>
        </div>
      </header>

      {/* Main Action Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-12 max-w-sm mx-auto w-full">
        {status === 'idle' && (
          <div className="w-full text-center space-y-8">
            <div className="space-y-3">
              <h2 className="font-display font-black text-xl uppercase tracking-tight text-white">
                TRANSMIT CAMERA ASSETS
              </h2>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Take a photo or choose an existing product image to upload. It will appear on your desktop editor instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label className="flex flex-col items-center justify-center gap-3 bg-[#141414] border border-[#262626] hover:border-[#39FF88] p-10 rounded-2xl cursor-pointer transition-colors duration-200 group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Camera size={36} className="text-zinc-500 group-hover:text-[#39FF88] transition-colors" />
                <span className="font-mono text-[10px] font-bold text-white uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg group-hover:border-[#39FF88] transition-colors">
                  Take Photo / Gallery_
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Loading / Processing States */}
        {(status === 'compressing' || status === 'uploading' || status === 'broadcasting') && (
          <div className="text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <Loader2 size={36} className="text-[#39FF88] animate-spin" />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover rounded-full opacity-25 border border-[#262626]"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                {status === 'compressing' && 'COMPRESSING OPTICAL ASSET'}
                {status === 'uploading' && 'UPLOADING TO STOREFRONT VAULT'}
                {status === 'broadcasting' && 'UPLINK TRANSMITTING SIGNAL'}
              </h3>
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                DO NOT CLOSE THIS TERMINAL OR NAVIGATE AWAY
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center space-y-6 w-full">
            <div className="w-16 h-16 bg-[#39FF88]/10 border border-[#39FF88]/30 rounded-full flex items-center justify-center mx-auto text-[#39FF88]">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-black text-base uppercase tracking-wider text-white animate-pulse">
                UPLINK COMPLETED SUCCESSFULLY
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                The image has been parsed and transmitted directly to the product catalog form on your laptop editor.
              </p>
            </div>
            {previewUrl && (
              <div className="w-full aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden border border-[#262626]">
                <img src={previewUrl} alt="Uploaded specimen" className="w-full h-full object-cover" />
              </div>
            )}
            <button
              onClick={() => {
                setPreviewUrl('');
                setStatus('idle');
              }}
              className="bg-white text-black px-6 py-2.5 font-mono text-[10px] font-black rounded-lg uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Upload Another_
            </button>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-950/20 border border-red-900 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-red-500">
                TRANSMISSION ERROR
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                {errorMsg}
              </p>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="bg-[#141414] border border-[#262626] text-white px-6 py-2.5 font-mono text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-[#262626]"
            >
              Try Again_
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#262626] pt-4 text-center">
        <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest">
          SYSTEM REF: GHL_UPLINK_SECURE_COORDS // POWERED BY SUPABASE REALTIME
        </span>
      </footer>
    </div>
  );
};
