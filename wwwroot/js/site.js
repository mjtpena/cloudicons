// ==========================================================================
// XYZICON - Site JavaScript
// ==========================================================================

// --- Toast System ---
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

  if (!window.isSecureContext || !navigator.clipboard?.write) {
    window.toastNotifications.info(
      "Clipboard needs HTTPS. Downloading instead.",
    );
    window.downloadAsPng(imgId, fileName);
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
