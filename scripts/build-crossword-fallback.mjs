// Regenerate after vocabulary/engine changes; commit alongside those changes.
import {writeFileSync} from 'node:fs';
import {generate} from '../web/engine.js';
const puzzles=Array.from({length:30},(_,i)=>generate(i+1));
writeFileSync(new URL('../web/fallback.js',import.meta.url),'// Prevalidated layouts for v0.1. Regenerate with node scripts/build-crossword-fallback.mjs\nexport const fallback = '+JSON.stringify(puzzles)+';\n');
