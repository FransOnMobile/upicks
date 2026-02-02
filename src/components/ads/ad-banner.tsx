'use client';

import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface AdBannerProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
    responsive?: boolean;
    className?: string;
}

/**
 * Google AdSense Banner Component
 * 
 * Usage:
 * <AdBanner slot="1234567890" format="auto" responsive />
 * 
 * Get your ad slot ID from Google AdSense dashboard after creating an ad unit.
 */
export function AdBanner({ slot, format = 'auto', responsive = true, className = '' }: AdBannerProps) {
    const adRef = useRef<HTMLModElement>(null);
    const isLoaded = useRef(false);

    useEffect(() => {
        // Only load once
        if (isLoaded.current) return;

        try {
            if (typeof window !== 'undefined' && adRef.current) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                isLoaded.current = true;
            }
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <div className={`ad-container ${className}`}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-3086021868950910"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? 'true' : 'false'}
            />
        </div>
    );
}

/**
 * Horizontal banner ad - good for between content sections
 */
export function HorizontalAd({ slot, className = '' }: { slot: string; className?: string }) {
    return (
        <div className={`w-full max-w-4xl mx-auto my-6 ${className}`}>
            <AdBanner slot={slot} format="horizontal" responsive />
        </div>
    );
}

/**
 * Sidebar ad - good for sidebars
 */
export function SidebarAd({ slot, className = '' }: { slot: string; className?: string }) {
    return (
        <div className={`w-full ${className}`}>
            <AdBanner slot={slot} format="rectangle" responsive={false} />
        </div>
    );
}

/**
 * In-feed ad - blends with content feed
 */
export function InFeedAd({ slot, className = '' }: { slot: string; className?: string }) {
    return (
        <div className={`w-full my-4 ${className}`}>
            <AdBanner slot={slot} format="fluid" responsive />
        </div>
    );
}
