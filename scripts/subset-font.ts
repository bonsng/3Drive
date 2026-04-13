import subsetFont from 'subset-font';
import { readFileSync, writeFileSync } from 'fs';

// Korean basic syllables (가-힣) + ASCII printable (0x20-0x7E)
const KOREAN_SYLLABLES_START = 0xac00;
const KOREAN_SYLLABLES_END = 0xd7a3;
const ASCII_START = 0x20;
const ASCII_END = 0x7e;

let chars = '';
for (let i = ASCII_START; i <= ASCII_END; i++) chars += String.fromCharCode(i);
for (let i = KOREAN_SYLLABLES_START; i <= KOREAN_SYLLABLES_END; i++)
  chars += String.fromCharCode(i);

const inputBuffer = readFileSync('/tmp/Pretendard-Bold.woff2');
const subset = await subsetFont(inputBuffer, chars, { targetFormat: 'woff2' });
writeFileSync('public/fonts/Pretendard-Bold.subset.woff2', subset);
console.log(`Subset font created: ${(subset.byteLength / 1024).toFixed(0)}KB`);
