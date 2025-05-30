const fs = require('fs');
const path = require('path');

// Read the index.html file
const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Create the script tag with environment variables
const envScript = `
<script>
  window.EMAILJS_PUBLIC_KEY = "${process.env.EMAILJS_PUBLIC_KEY}";
  window.EMAILJS_SERVICE_ID = "${process.env.EMAILJS_SERVICE_ID}";
  window.EMAILJS_TEMPLATE_ID = "${process.env.EMAILJS_TEMPLATE_ID}";
</script>
`;

// Insert the script tag before the closing </head> tag
html = html.replace('</head>', `${envScript}</head>`);

// Write the modified HTML back to the file
fs.writeFileSync(htmlPath, html); 