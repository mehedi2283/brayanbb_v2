const fs = require('fs');
let content = fs.readFileSync('src/components/Tutorial.tsx', 'utf8');

content = content.replace(
    'styles={{ options: { zIndex: 99999 } }}',
    ''
);

fs.writeFileSync('src/components/Tutorial.tsx', content);
