const fs = require('fs');
let content = fs.readFileSync('src/components/Tutorial.tsx', 'utf8');

content = content.replace(
    'options={{ zIndex: 10000, primaryColor: "#2563eb" }}',
    'options={{ zIndex: 10000, primaryColor: "#2563eb" }}\n      portalElement="#root" // or try undefined'
);

fs.writeFileSync('src/components/Tutorial.tsx', content);
