'use client';

import { useEffect, useRef } from 'react';

export default function AdsterraBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl29274520.profitablecpmratenetwork.com/08be583048cef6b76fe7a2921e271b82/invoke.js';
    
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="adsterra-banner w-full flex justify-center my-4">
      <div ref={containerRef}>
        <div id="container-08be583048cef6b76fe7a2921e271b82"></div>
      </div>
    </div>
  );
}
