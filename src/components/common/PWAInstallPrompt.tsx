import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // Check for iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const hasDismissed = localStorage.getItem('fleetpulse_pwa_dismissed');
    if (hasDismissed) {
      // Don't re-prompt if dismissed in last 7 days
      const dismissedAt = Number(hasDismissed);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If iOS and not standalone, show after a short delay
    if (isIosDevice && !isRunningStandalone && !hasDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSGuide(false);
    localStorage.setItem('fleetpulse_pwa_dismissed', Date.now().toString());
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border-2 border-amber-400/80 rounded-2xl p-4 shadow-2xl text-left relative backdrop-blur-md">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close install prompt"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1 pr-6">
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              Install FleetPulse Mobile App
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Faster 1-tap launch, offline support, and dedicated mobile driver interface.
            </p>
          </div>
        </div>

        {showIOSGuide ? (
          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <Share2 className="w-4 h-4 text-amber-700" /> To install on iOS Safari:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
              <li>Tap the <span className="font-semibold text-slate-900">Share</span> button in Safari toolbar.</li>
              <li>Scroll down and tap <span className="font-semibold text-slate-900">Add to Home Screen</span> (<PlusSquare className="w-3 h-3 inline text-slate-900" />).</li>
              <li>Tap <span className="font-semibold text-slate-900">Add</span> to install FleetPulse app.</li>
            </ol>
          </div>
        ) : (
          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isIOS ? 'Instructions for iPhone' : 'Install App'}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
