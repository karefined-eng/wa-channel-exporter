const fs = require('fs');
const path = require('path');

const websiteDir = path.join(__dirname, '..', 'website');
const htmlFiles = fs.readdirSync(websiteDir).filter(f => f.endsWith('.html'));

for (const file of htmlFiles) {
  const filePath = path.join(websiteDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  let modified = false;

  // Replace twitter property
  if (content.includes('property="twitter:')) {
    content = content.replace(/property="twitter:/g, 'name="twitter:');
    modified = true;
  }

  // Inject meta robots if not present
  if (!content.includes('<meta name="robots"')) {
    // Inject it before canonical
    if (content.includes('<link rel="canonical"')) {
      content = content.replace(
        '<link rel="canonical"',
        '<meta name="robots" content="index, follow" />\n    <link rel="canonical"'
      );
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
