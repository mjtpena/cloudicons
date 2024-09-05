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