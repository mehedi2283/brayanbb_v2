const fs = require('fs');
let content = fs.readFileSync('src/components/Tutorial.tsx', 'utf8');

content = content.replace(
    'portalElement="#root" // or try undefined',
    ''
);

// Actually just make sure it's high z-index and body
content = content.replace(
    'options={{ zIndex: 10000, primaryColor: "#2563eb" }}',
    'options={{ zIndex: 99999, primaryColor: "#2563eb" }}\n      styles={{ options: { zIndex: 99999 } }}\n      floaterProps={{ disableAnimation: true }}'
);

fs.writeFileSync('src/components/Tutorial.tsx', content);
