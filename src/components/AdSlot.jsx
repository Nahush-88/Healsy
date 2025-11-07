import React, { useEffect, useRef } from "react";

const ADS_SCRIPT_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4899012716770343";

function loadAdsScript() {
  return new Promise((resolve) => {
    // already loaded?
    const existing = document.querySelector(`script[src^="${ADS_SCRIPT_SRC}"]`);
    if (existing && existing.dataset.loaded === "true") return resolve();

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }

    const s = document.createElement("script");
    s.src = ADS_SCRIPT_SRC;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.addEventListener("load", () => {
      s.dataset.loaded = "true";
      resolve();
    });
    document.head.appendChild(s);
  });
}

export default function AdSlot({
  slot = "6136802313",                  // your ad unit slot
  className = "",
  style = { display: "block", width: "100%", minHeight: 280 },
  format = "auto",                      // responsive (Google docs) 
  fullWidthResponsive = "true",
  test = false,                         // set <AdSlot test /> on localhost
}) {
  const insRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loadAdsScript();
      if (cancelled || !insRef.current) return;

      // if this <ins> already initialized, don't push again
      const alreadyInit = insRef.current.getAttribute("data-adsbygoogle-status");
      if (!alreadyInit) {
        try {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
        } catch (e) {
          // noisy but harmless on rapid remounts
          // console.warn("AdSense push error:", e);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client="ca-pub-4899012716770343"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive}
      {...(test ? { "data-adtest": "on" } : {})}
    />
  );
}
