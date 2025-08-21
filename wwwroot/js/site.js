window.downloadAsPng = function (svgId, fileName) {
    var svgElement = document.getElementById(svgId);
    
    if (!svgElement) {
        console.error('SVG element not found:', svgId);
        alert('Image element not found. Please try again.');
        return;
    }

    // Check if html2canvas is available
    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas library not loaded');
        alert('Image processing library not available. Please refresh the page and try again.');
        return;
    }

    html2canvas(svgElement).then(function (canvas) {
        var link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = fileName + '.png';
        
        // Append to body, click and remove (for better browser compatibility)
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }).catch(function(error) {
        console.error('Error generating PNG:', error);
        alert('Error processing image for download. Please try again.');
    });
}

window.copyImageToClipboard = function (svgId, fileName) {
    var svgElement = document.getElementById(svgId);
    
    if (!svgElement) {
        console.error('SVG element not found:', svgId);
        alert('Image element not found. Please try again.');
        return;
    }

    // Check if html2canvas is available
    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas library not loaded');
        alert('Image processing library not available. Please refresh the page and try again.');
        return;
    }

    // Check if we're in a secure context (HTTPS)
    if (!window.isSecureContext) {
        console.warn('Clipboard API requires HTTPS. Falling back to download.');
        alert('Clipboard functionality requires HTTPS. The image will be downloaded instead.');
        // Fallback to download
        window.downloadAsPng(svgId, fileName);
        return;
    }

    // Check if clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.write) {
        console.warn('Clipboard API not available. Falling back to download.');
        alert('Clipboard functionality is not available in this browser. The image will be downloaded instead.');
        // Fallback to download
        window.downloadAsPng(svgId, fileName);
        return;
    }

    html2canvas(svgElement).then(function (canvas) {
        canvas.toBlob(function(blob) {
            if (!blob) {
                console.error('Failed to create blob from canvas');
                alert('Failed to process image. Please try again.');
                return;
            }

            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]).then(function() {
                console.log('Image copied to clipboard');
                alert('Image copied to clipboard successfully!');
            }).catch(function(err) {
                console.error('Failed to copy image: ', err);
                alert('Failed to copy image to clipboard. Your browser might not support this feature.');
            });
        }, 'image/png');
    }).catch(function(error) {
        console.error('Error generating PNG:', error);
        alert('Error processing image. Please try again.');
    });
}