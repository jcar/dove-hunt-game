const fs = require('fs');
const { createCanvas } = require('canvas');

// Check if canvas is available, if not, we'll create a simple base64 data URL
let canvas, ctx;
try {
  canvas = createCanvas(32, 32);
  ctx = canvas.getContext('2d');
} catch (error) {
  console.log('Canvas not available, creating simple base64 favicon');
  
  // Simple dove emoji as base64 for favicon
  const simpleFaviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" fill="#87CEEB"/>
    <text x="16" y="20" text-anchor="middle" font-size="20" fill="white">🕊</text>
  </svg>`;
  
  const base64 = Buffer.from(simpleFaviconSVG).toString('base64');
  const dataURL = `data:image/svg+xml;base64,${base64}`;
  
  // Write a simple HTML file to generate the favicon
  const htmlGenerator = `<!DOCTYPE html>
<html>
<head>
    <title>Generate Favicon</title>
</head>
<body>
    <h1>Generating Favicon...</h1>
    <canvas id="canvas" width="32" height="32" style="border: 1px solid black;"></canvas>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Draw sky background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, 32, 32);
        
        // Draw dove shape
        ctx.fillStyle = '#f5f5f5';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        
        // Body
        ctx.beginPath();
        ctx.ellipse(16, 18, 8, 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Wing
        ctx.fillStyle = '#e0e0e0';
        ctx.beginPath();
        ctx.ellipse(12, 16, 6, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Head
        ctx.fillStyle = '#f5f5f5';
        ctx.beginPath();
        ctx.arc(22, 14, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Eye
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(24, 13, 1, 0, 2 * Math.PI);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.moveTo(26, 14);
        ctx.lineTo(29, 13);
        ctx.lineTo(26, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Convert to blob and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'favicon.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
        
        console.log('Favicon generated! Check downloads folder.');
    </script>
</body>
</html>`;
  
  fs.writeFileSync('/Users/jcar/source/dove-hunt-game/public/generate-favicon.html', htmlGenerator);
  console.log('Created generate-favicon.html - open this in a browser to generate the favicon');
  return;
}

// If canvas is available, generate directly
if (canvas && ctx) {
  // Draw sky background
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, 32, 32);
  
  // Draw dove shape
  ctx.fillStyle = '#f5f5f5';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 0.5;
  
  // Body
  ctx.beginPath();
  ctx.ellipse(16, 18, 8, 6, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  // Wing
  ctx.fillStyle = '#e0e0e0';
  ctx.beginPath();
  ctx.ellipse(12, 16, 6, 4, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  // Head
  ctx.fillStyle = '#f5f5f5';
  ctx.beginPath();
  ctx.arc(22, 14, 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  // Eye
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(24, 13, 1, 0, 2 * Math.PI);
  ctx.fill();
  
  // Beak
  ctx.fillStyle = '#ff6b35';
  ctx.beginPath();
  ctx.moveTo(26, 14);
  ctx.lineTo(29, 13);
  ctx.lineTo(26, 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('/Users/jcar/source/dove-hunt-game/public/favicon.png', buffer);
  
  console.log('Favicon generated successfully!');
}
