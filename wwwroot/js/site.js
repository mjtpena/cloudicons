// Toast notification system
window.toastNotifications = {
    container: null,
    
    init: function() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    
    show: function(message, type = 'success', duration = 3000) {
        this.init();
        
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        
        const icons = {
            'success': '✓',
            'error': '✕',
            'info': 'ℹ'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons['info']}</div>
            <div class="toast-message">${message}</div>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    },
    
    success: function(message, duration) {
        this.show(message, 'success', duration);
    },
    
    error: function(message, duration) {
        this.show(message, 'error', duration);
    },
    
    info: function(message, duration) {
        this.show(message, 'info', duration);
    }
};

window.downloadAsPng = function (svgId, fileName) {
    var svgElement = document.getElementById(svgId);
    
    if (!svgElement) {
        console.error('SVG element not found:', svgId);
        window.toastNotifications.error('Image element not found. Please try again.');
        return;
    }

    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas library not loaded');
        window.toastNotifications.error('Image processing library not available. Please refresh the page.');
        return;
    }

    html2canvas(svgElement).then(function (canvas) {
        var link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = fileName + '.png';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.toastNotifications.success('PNG downloaded successfully!');
    }).catch(function(error) {
        console.error('Error generating PNG:', error);
        window.toastNotifications.error('Error processing image for download.');
    });
}

window.copyImageToClipboard = function (svgId, fileName) {
    var svgElement = document.getElementById(svgId);
    
    if (!svgElement) {
        console.error('SVG element not found:', svgId);
        window.toastNotifications.error('Image element not found. Please try again.');
        return;
    }

    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas library not loaded');
        window.toastNotifications.error('Image processing library not available. Please refresh.');
        return;
    }

    if (!window.isSecureContext) {
        console.warn('Clipboard API requires HTTPS. Falling back to download.');
        window.toastNotifications.info('Clipboard requires HTTPS. Downloading instead.');
        window.downloadAsPng(svgId, fileName);
        return;
    }

    if (!navigator.clipboard || !navigator.clipboard.write) {
        console.warn('Clipboard API not available. Falling back to download.');
        window.toastNotifications.info('Clipboard not available. Downloading instead.');
        window.downloadAsPng(svgId, fileName);
        return;
    }

    html2canvas(svgElement).then(function (canvas) {
        canvas.toBlob(function(blob) {
            if (!blob) {
                console.error('Failed to create blob from canvas');
                window.toastNotifications.error('Failed to process image. Please try again.');
                return;
            }

            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]).then(function() {
                console.log('Image copied to clipboard');
                window.toastNotifications.success('Icon copied to clipboard! 📋');
            }).catch(function(err) {
                console.error('Failed to copy image: ', err);
                window.toastNotifications.error('Failed to copy. Browser may not support this.');
            });
        }, 'image/png');
    }).catch(function(error) {
        console.error('Error generating PNG:', error);
        window.toastNotifications.error('Error processing image.');
    });
}