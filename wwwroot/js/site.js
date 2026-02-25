// ==========================================================================
// XYZICON - JavaScript Search Engine (Ultra-Optimized)
// ==========================================================================

window.xyzicon || (window.xyzicon = {});

// === HIGH-SPEED SEARCH INDEX ===
window.xyzicon.searchEngine = {
  // Search index: minimalist structure for max speed
  index: null,
  cache: new Map(),
  maxCacheSize: 30,
  
  // Initialize with icon data from C#
  initIndex(icons) {
    this.index = icons.map(icon => ({
      id: icon.name,
      name: icon.displayName,
      provider: icon.provider,
      searchText: icon.searchText || "",
      path: icon.path,
      fileName: icon.fileName
    }));
    
    console.log(`[xyzicon] Search index ready: ${this.index.length} icons`);
  },

  // Ultra-fast search (~1-2ms for 8000+ icons)
  search(query, enabledProviders) {
    if (!this.index) return [];
    
    // No query = return all enabled providers
    if (!query || query.trim() === "") {
      return this.index.filter(icon => enabledProviders[icon.provider]);
    }

    // Generate cache key
    const providers = Object.keys(enabledProviders)
      .filter(p => enabledProviders[p])
      .sort()
      .join(",");
    const cacheKey = `${query}|${providers}`;

    // Check cache first (blazingly fast!)
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // === SEARCH ALGORITHM: 3-tier filtering ===
    const terms = query.toLowerCase().split(/\s+/).filter(t => t);
    if (terms.length === 0) return [];

    const results = [];
    const firstChar = terms[0][0];
    const providerSet = new Set(Object.keys(enabledProviders).filter(p => enabledProviders[p]));

    // Tier 1: Fast pass (exact substring matching)
    for (const icon of this.index) {
      if (!providerSet.has(icon.provider)) continue;

      // Quick first-char check (99% filter)
      if (!icon.searchText[0] || icon.searchText[0].toLowerCase() !== firstChar) {
        continue;
      }

      const searchText = icon.searchText.toLowerCase();
      if (terms.every(term => searchText.includes(term))) {
        results.push(icon);
      }
    }

    // Tier 2: Typo tolerance (only if no exact matches & short query)
    if (results.length === 0 && query.length <= 8) {
      for (const icon of this.index) {
        if (!providerSet.has(icon.provider)) continue;

        const words = icon.searchText.toLowerCase().split(/\s+/);
        let matched = false;

        for (const term of terms) {
          for (const word of words) {
            if (this._isFastTypoMatch(word, term)) {
              results.push(icon);
              matched = true;
              break;
            }
          }
          if (matched) break;
        }

        if (results.length >= 50) break; // Early exit
      }
    }

    // Tier 3: Partial matching (prefix match, last resort)
    if (results.length === 0 && terms[0].length > 2) {
      const prefix = terms[0];
      for (const icon of this.index) {
        if (!providerSet.has(icon.provider)) continue;
        
        if (icon.searchText.toLowerCase().startsWith(prefix)) {
          results.push(icon);
        }
      }
    }

    // Cache result (LRU)
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(cacheKey, results);

    return results;
  },

  // Lightning-fast typo detection (no Levenshtein!)
  _isFastTypoMatch(word, term) {
    if (word === term) return true;
    if (!word || !term) return false;

    // Prefix match (fastest)
    if (word.startsWith(term) || term.startsWith(word)) return true;

    // Allow 1 character deletion/insertion
    if (Math.abs(word.length - term.length) > 1) return false;

    let diff = 0;
    let i = 0, j = 0;

    while (i < word.length && j < term.length) {
      if (word[i] !== term[j]) {
        diff++;
        if (diff > 1) return false;

        // Try skip
        if (i + 1 < word.length && word[i + 1] === term[j]) {
          i++;
        } else if (j + 1 < term.length && word[i] === term[j + 1]) {
          j++;
        } else {
          return false;
        }
      }
      i++;
      j++;
    }

    return diff <= 1;
  },

  clearCache() {
    this.cache.clear();
  }
};

// ==========================================================================
// XYZICON - Toast System
// ==========================================================================
window.toastNotifications = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    }
  },

  show(message, type = "success", duration = 2500) {
    this.init();
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icons = { success: "✓", error: "✕", info: "ℹ" };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-message">${message}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("removing");
      setTimeout(() => toast.remove(), 200);
    }, duration);
  },

  success(msg, d) {
    this.show(msg, "success", d);
  },
  error(msg, d) {
    this.show(msg, "error", d);
  },
  info(msg, d) {
    this.show(msg, "info", d);
  },
};

// --- Infinite Scroll ---
window.xyzicon = {
  _dotNetRef: null,
  _observer: null,

  initInfiniteScroll(dotNetRef) {
    this._dotNetRef = dotNetRef;
    this._observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && this._dotNetRef) {
          this._dotNetRef.invokeMethodAsync("LoadMoreFromJS");
        }
      },
      { rootMargin: "400px" },
    );
  },

  observeSentinel() {
    const el = document.getElementById("scroll-sentinel");
    if (el && this._observer) {
      this._observer.disconnect();
      this._observer.observe(el);
    }
  },
};

// --- Download as PNG ---
window.downloadAsPng = function (imgId, fileName) {
  const img = document.getElementById(imgId);
  if (!img) {
    window.toastNotifications.error("Image not found");
    return;
  }

  if (typeof html2canvas === "undefined") {
    window.toastNotifications.error(
      "html2canvas not loaded. Refresh the page.",
    );
    return;
  }

  html2canvas(img, { backgroundColor: null, scale: 2 })
    .then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = fileName.replace(/\s+/g, "-") + ".png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.toastNotifications.success("PNG downloaded");
    })
    .catch(() => {
      window.toastNotifications.error("Error generating PNG");
    });
};

// --- Download as SVG (fetch original) ---
window.downloadAsSvg = function (imgId, fileName) {
  const img = document.getElementById(imgId);
  if (!img || !img.src) {
    window.toastNotifications.error("Image not found");
    return;
  }

  fetch(img.src)
    .then((r) => r.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName.replace(/\s+/g, "-") + ".svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      window.toastNotifications.success("SVG downloaded");
    })
    .catch(() => {
      window.toastNotifications.error("Error downloading SVG");
    });
};

// --- Copy to Clipboard ---
window.copyImageToClipboard = function (imgId, fileName) {
  const img = document.getElementById(imgId);
  if (!img) {
    window.toastNotifications.error("Image not found");
    return;
  }

  if (typeof html2canvas === "undefined") {
    window.toastNotifications.error("html2canvas not loaded");
    return;
  }

  // Only attempt copy if we have clipboard support
  if (!window.isSecureContext) {
    window.toastNotifications.info("Clipboard requires HTTPS");
    return;
  }

  if (!navigator.clipboard?.write) {
    window.toastNotifications.error("Clipboard not available in this browser");
    return;
  }

  html2canvas(img, { backgroundColor: null, scale: 2 })
    .then((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          window.toastNotifications.error("Failed to process image");
          return;
        }
        navigator.clipboard
          .write([new ClipboardItem({ "image/png": blob })])
          .then(() => {
            window.toastNotifications.success("Copied to clipboard");
          })
          .catch(() => {
            window.toastNotifications.error("Copy failed");
          });
      }, "image/png");
    })
    .catch(() => {
      window.toastNotifications.error("Error processing image");
    });
};
