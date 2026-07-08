const fs = require('fs');
let content = fs.readFileSync('src/components/Tutorial.tsx', 'utf8');

content = content.replace(
    'floaterProps={{ disableAnimation: true }}',
    ''
);

fs.writeFileSync('src/components/Tutorial.tsx', content);
