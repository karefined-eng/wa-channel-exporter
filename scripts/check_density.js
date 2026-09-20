const fs = require('fs');

function analyzeFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  let stripped = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase();

  const words = stripped.match(/[a-z]{3,}/g) || [];
  const total = words.length;
  const counts = {};
  words.forEach(w => counts[w] = (counts[w] || 0) + 1);
  const freqs = Object.entries(counts)
    .map(([word, count]) => ({ word, count, pct: ((count / total) * 100).toFixed(2) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  console.log(`=== ${filepath} ===`);
  console.log('Total visible words:', total);
  console.table(freqs);
}

analyzeFile('website/index.html');
