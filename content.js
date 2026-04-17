
(function () {
  const STYLE_ID = 'chromaaid-style';
  const FILTER_ID = 'chromaaid-filters';
  const FILTER_DEFS = {
    none: '',

    protanopia: `
      <filter id="protanopia-filter" color-interpolation-filters="linearRGB">
        <feColorMatrix type="matrix" values="
          0.567, 0.433, 0,     0, 0
          0.558, 0.442, 0,     0, 0
          0,     0.242, 0.758, 0, 0
          0,     0,     0,     1, 0"/>
      </filter>`,

    deuteranopia: `
      <filter id="deuteranopia-filter" color-interpolation-filters="linearRGB">
        <feColorMatrix type="matrix" values="
          0.625, 0.375, 0,   0, 0
          0.7,   0.3,   0,   0, 0
          0,     0.3,   0.7, 0, 0
          0,     0,     0,   1, 0"/>
      </filter>`,

    tritanopia: `
      <filter id="tritanopia-filter" color-interpolation-filters="linearRGB">
        <feColorMatrix type="matrix" values="
          0.95, 0.05,  0,    0, 0
          0,    0.433, 0.567,0, 0
          0,    0.475, 0.525,0, 0
          0,    0,     0,    1, 0"/>
      </filter>`,

    achromatopsia: `
      <filter id="achromatopsia-filter" color-interpolation-filters="linearRGB">
        <feColorMatrix type="matrix" values="
          0.299, 0.587, 0.114, 0, 0
          0.299, 0.587, 0.114, 0, 0
          0.299, 0.587, 0.114, 0, 0
          0,     0,     0,     1, 0"/>
      </filter>`,

    'high-contrast': `
      <filter id="high-contrast-filter">
        <feComponentTransfer>
          <feFuncR type="linear" slope="1.5" intercept="-0.25"/>
          <feFuncG type="linear" slope="1.5" intercept="-0.25"/>
          <feFuncB type="linear" slope="1.5" intercept="-0.25"/>
        </feComponentTransfer>
      </filter>`,
  };

  const FILTER_URLS = {
    protanopia: 'url(#protanopia-filter)',
    deuteranopia: 'url(#deuteranopia-filter)',
    tritanopia: 'url(#tritanopia-filter)',
    achromatopsia: 'url(#achromatopsia-filter)',
    'high-contrast': 'url(#high-contrast-filter)',
    none: 'none',
  };

  // ── Inject hidden SVG with filter definitions ──
  function injectSVGFilters(mode) {
    // Remove old
    const old = document.getElementById(FILTER_ID);
    if (old) old.remove();

    if (mode === 'none') return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', FILTER_ID);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
    svg.innerHTML = `<defs>${FILTER_DEFS[mode] || ''}</defs>`;
    document.body.insertBefore(svg, document.body.firstChild);
  }


  function applyStyles(mode, intensity, enhanceText) {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    const filterUrl = FILTER_URLS[mode] || 'none';
    const opacityFilter = intensity < 1
      ? buildOpacityBlend(mode, intensity)
      : filterUrl;

    let css = '';

    if (mode !== 'none') {
      css += `
        html {
          filter: ${filterUrl} !important;
        }
      `;
    } else {
      css += `html { filter: none !important; }`;
    }

    if (enhanceText) {
      css += `
        p, span, li, td, th, label, h1, h2, h3, h4, h5, h6, a {
          text-shadow: 0 0 0 transparent !important;
          letter-spacing: 0.01em !important;
        }
        * {
          border-color: currentColor !important;
        }
      `;
    }


    if (mode !== 'none' && intensity < 1) {
      css += `
        html::before {
          content: '';
          display: block;
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 2147483647;
          opacity: ${1 - intensity};
          /* Semi-transparent overlay to blend effect */
        }
      `;
    }

    style.textContent = css;
  }

  function buildOpacityBlend(mode, intensity) {
    return FILTER_URLS[mode] || 'none';
  }

  function removeAll() {
    const s = document.getElementById(STYLE_ID);
    if (s) s.remove();
    const f = document.getElementById(FILTER_ID);
    if (f) f.remove();
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action !== 'applyFilter') return;

    const { mode, intensity, enhanceText } = msg;

    if (mode === 'none') {
      removeAll();
      return;
    }

    injectSVGFilters(mode);
    applyStyles(mode, intensity, enhanceText);
  });

  chrome.storage.local.get(['mode', 'intensity', 'enhanceText', 'autoApply'], (data) => {
    if (data.autoApply && data.mode && data.mode !== 'none') {
      const intensity = parseInt(data.intensity || 100) / 100;
      injectSVGFilters(data.mode);
      applyStyles(data.mode, intensity, data.enhanceText || false);
    }
  });
})();
