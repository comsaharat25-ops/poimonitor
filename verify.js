// Static verification for index.html (replicates the handoff Python check,
// minus the DOM-nesting assert which is done live in the browser).
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index.html', 'utf8');
let fail = 0;
function check(cond, msg){ if(!cond){ console.log('FAIL: '+msg); fail++; } else { console.log('ok  : '+msg); } }
const count = (s) => html.split(s).length - 1;

check(count('const D={') === 1, "exactly 1 'const D={'");
check(count('function switchView') === 1, "exactly 1 'function switchView'");
check(count('const SC=') === 1, "exactly 1 'const SC='");
check(count('id="forecastView"') === 0, "no forecastView");
check(count('</html>') === 1, "exactly 1 </html>");

// JS syntax check each <script> block
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((src, i) => {
  try { new vm.Script(src, { filename: `script${i}.js` }); check(true, `script ${i} parses (${src.length} chars)`); }
  catch (e) { check(false, `script ${i} syntax: ${e.message}`); }
});

// AP_DATA date format
const apStart = html.indexOf('var AP_DATA=');
const apEnd = html.indexOf('\nvar apStatusFilter=', apStart);
const ap = JSON.parse(html.slice(apStart + 'var AP_DATA='.length, apEnd));
const bad = ap.filter(e => !e.submit_date.includes('AM') && !e.submit_date.includes('PM'));
check(bad.length === 0, `AP_DATA dates 12h-normalized (${bad.length} bad of ${ap.length})`);

console.log(`\n${fail===0?'ALL PASSED':fail+' FAILED'} | ${html.length.toLocaleString()} chars | ${ap.length} AP entries | ${scripts.length} scripts`);
process.exit(fail ? 1 : 0);
