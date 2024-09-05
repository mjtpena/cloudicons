window.downloadAsPng = function (svgId, fileName) {
    var svgElement = document.getElementById(svgId);
    
    if (!svgElement) {
        console.error('SVG element not found:', svgId);
        return;
    }

    html2canvas(svgElement).then(function (canvas) {
        var link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = fileName + '.png';
        link.click();
    }).catch(function(error) {
        console.error('Error generating PNG:', error);
    });
}

window.copyImageToClipboard = function (svgId, fileName) {
    var svgElement = document.getElementById(svgId);
    
    if (!svgElement) {
        console.error('SVG element not found:', svgId);
        return;
    }

    html2canvas(svgElement).then(function (canvas) {
        canvas.toBlob(function(blob) {
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]).then(function() {
                console.log('Image copied to clipboard');
                alert('Image copied to clipboard. You can now paste it in other applications.');
            }).catch(function(err) {
                console.error('Failed to copy image: ', err);
                alert('Failed to copy image. Please try again.');
            });
        }, 'image/png');
    }).catch(function(error) {
        console.error('Error generating PNG:', error);
        alert('Error generating PNG. Please try again.');
    });
}