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
    this.index = icons.map((icon) => ({
      id: icon.name,
      name: icon.displayName,
      provider: icon.provider,
      searchText: icon.searchText || "",
      path: icon.path,
      fileName: icon.fileName,
    }));

    console.log(`[xyzicon] Search index ready: ${this.index.length} icons`);
  },

  // Fast ranked search
  search(query, enabledProviders) {
    if (!this.index) return [];

    const providerSet = new Set(
      Object.keys(enabledProviders).filter((p) => enabledProviders[p]),
    );

    // No query = return all enabled providers
    if (!query || query.trim() === "") {
      return this.index.filter((icon) => providerSet.has(icon.provider));
    }

    // Generate cache key
    const providers = Object.keys(enabledProviders)
      .filter((p) => enabledProviders[p])
      .sort()
      .join(",");
    const cacheKey = `${query}|${providers}`;

    // Check cache first (blazingly fast!)
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // === SEARCH ALGORITHM: 3-tier filtering ===
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t);
    if (terms.length === 0) return [];

    const ranked = [];
    for (const icon of this.index) {
      if (!providerSet.has(icon.provider)) continue;

      const displayName = (icon.name || "").toLowerCase();
      const searchText = (icon.searchText || "").toLowerCase();
      const firstTerm = terms[0];

      let score = 0;
      if (terms.every((term) => searchText.includes(term))) {
        score += 40;
      } else if (
        terms.length === 1 &&
        terms[0].length <= 8 &&
        searchText
          .split(/\s+/)
          .some((word) => this._isFastTypoMatch(word, terms[0]))
      ) {
        score += 8;
      } else {
        continue;
      }

      if (displayName === query.toLowerCase()) score += 100;
      else if (displayName.startsWith(firstTerm)) score += 55;
      else if (displayName.includes(firstTerm)) score += 30;

      if (searchText.startsWith(firstTerm)) score += 20;

      ranked.push({ icon, score });
    }

    ranked.sort(
      (a, b) => b.score - a.score || a.icon.name.localeCompare(b.icon.name),
    );
    const results = ranked.map((r) => r.icon);

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
    let i = 0,
      j = 0;

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
  },
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
window.xyzicon._dotNetRef = null;
window.xyzicon._observer = null;
Object.assign(window.xyzicon, {
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

  scrollToCard(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
      card.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  },
});

// --- Download as PNG ---
window.downloadAsPng = async function (imgId, fileName) {
  const img = document.getElementById(imgId);
  if (!img) {
    window.toastNotifications.error("Image not found");
    return false;
  }

  if (typeof html2canvas === "undefined") {
    window.toastNotifications.error(
      "html2canvas not loaded. Refresh the page.",
    );
    return false;
  }

  try {
    const canvas = await html2canvas(img, { backgroundColor: null, scale: 2 });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = fileName.replace(/\s+/g, "-") + ".png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.toastNotifications.success("PNG downloaded");
    return true;
  } catch {
    window.toastNotifications.error("Error generating PNG");
    return false;
  }
};

// --- Download as SVG (fetch original) ---
window.downloadAsSvg = async function (imgId, fileName) {
  const img = document.getElementById(imgId);
  if (!img || !img.src) {
    window.toastNotifications.error("Image not found");
    return false;
  }

  try {
    const response = await fetch(img.src);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName.replace(/\s+/g, "-") + ".svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    window.toastNotifications.success("SVG downloaded");
    return true;
  } catch {
    window.toastNotifications.error("Error downloading SVG");
    return false;
  }
};

// --- Copy to Clipboard (Safari-compatible) ---
window.copyImageToClipboard = async function (imgId, fileName) {
  const img = document.getElementById(imgId);
  if (!img) {
    window.toastNotifications.error("Image not found");
    return false;
  }

  if (typeof html2canvas === "undefined") {
    window.toastNotifications.error("html2canvas not loaded");
    return false;
  }

  // Check HTTPS requirement
  if (!window.isSecureContext) {
    window.toastNotifications.info("Clipboard requires HTTPS");
    return false;
  }

  try {
    // Generate PNG via canvas
    const canvas = await new Promise((resolve, reject) => {
      html2canvas(img, { backgroundColor: null, scale: 2 })
        .then(resolve)
        .catch(reject);
    });

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      window.toastNotifications.error("Failed to process image");
      return false;
    }

    // === STRATEGY 1: Modern Clipboard API (Chrome, Firefox, Safari 13.1+) ===
    if (navigator.clipboard?.write) {
      try {
        // Check if ClipboardItem is available (Safari may not support it)
        if (typeof ClipboardItem !== "undefined") {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          window.toastNotifications.success("Copied to clipboard");
          return true;
        }
      } catch (e) {
        console.warn("ClipboardItem write failed:", e);
        // Fall through to next strategy
      }
    }

    // === STRATEGY 2: Fallback for Safari/older browsers ===
    // Try using a temporary hidden image element
    const tempImg = document.createElement("img");
    tempImg.src = URL.createObjectURL(blob);
    tempImg.style.display = "none";
    document.body.appendChild(tempImg);

    // Wait for image to load
    await new Promise((resolve, reject) => {
      tempImg.onload = resolve;
      tempImg.onerror = reject;
      setTimeout(reject, 2000); // Timeout after 2s
    });

    // Try to copy the image URL instead (Safari workaround)
    const imageUrl = tempImg.src;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(`![${fileName}](${imageUrl})`);
        window.toastNotifications.success("Image link copied to clipboard");
        document.body.removeChild(tempImg);
        URL.revokeObjectURL(imageUrl);
        return true;
      } catch (e) {
        console.warn("WriteText failed:", e);
      }
    }

    // === STRATEGY 3: Ultra-fallback for older Safari (use document.execCommand) ===
    const tempDiv = document.createElement("div");
    tempDiv.contentEditable = true;
    tempDiv.style.position = "fixed";
    tempDiv.style.opacity = "0";
    tempDiv.textContent = `Image: ![${fileName}](${imageUrl})`;
    document.body.appendChild(tempDiv);

    try {
      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      const successful = document.execCommand("copy");
      selection.removeAllRanges();
      document.body.removeChild(tempDiv);

      if (successful) {
        window.toastNotifications.success("Copied to clipboard");
        return true;
      } else {
        throw new Error("execCommand failed");
      }
    } catch (e) {
      document.body.removeChild(tempDiv);
      window.toastNotifications.error(
        "Clipboard not available. Try right-click → Copy instead.",
      );
      return false;
    }

    if (tempImg.parentNode) {
      document.body.removeChild(tempImg);
    }
    URL.revokeObjectURL(imageUrl);
    return false;
  } catch (err) {
    console.error("Copy failed:", err);
    window.toastNotifications.error(
      "Copy failed. Try right-click → Copy Image instead.",
    );
    return false;
  }
};
