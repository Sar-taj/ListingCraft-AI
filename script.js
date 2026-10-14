/*
 ListingCraft AI — frontend prototype.
 Demo mode is offline and uses a local template.
 Optional local model: Ollama running at http://localhost:11434.
 Browser access to Ollama may require enabling CORS for the page's origin.
 This is a prototype, not a guarantee that generated product claims are accurate.
*/
const $ = (id) => document.getElementById(id);
const form = $('listingForm');
let lastInput = null;
let toastTimer;

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}
function clean(text) {
  return String(text || '').trim().replace(/\s+/g, ' ');
}
function splitFeatures(text) {
  return text.split(/\n|,|;|•/).map(clean).filter(Boolean).slice(0, 8);
}
function makeTags(input) {
  const fromKeywords = clean(input.keywords).split(/[,;#]/).map(clean).filter(Boolean);
  const fromName = input.productName.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);
  const fromCategory = input.category.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3);
  return [...new Set([...fromKeywords, ...fromName, ...fromCategory, 'gift idea', 'small business'])].slice(0, 8);
}
function demoListing(input) {
  const features = splitFeatures(input.features);
  const audience = input.audience ? ` Designed with ${clean(input.audience)} in mind.` : '';
  const toneStart = input.tone.includes('Premium') ? 'A thoughtful, refined choice' :
    input.tone.includes('Playful') ? 'Give your everyday routine a little personality with' :
    input.tone.includes('Simple') ? 'Meet a practical option:' : 'Discover';
  const titleBase = clean(input.productName);
  const title = titleBase.length > 115 ? titleBase.slice(0, 112).trim() + '…' : titleBase;
  const description = `${toneStart} ${titleBase}. ${features.length ? `Highlights include ${features.join(', ')}.` : ''}${audience}\n\nWhether you're shopping for yourself or choosing a gift, this ${input.category.toLowerCase()} find brings together the details that matter. Review the specifications and photos before purchasing to make sure it fits your needs.`;
  return { title, description, features: features.length ? features : ['Add a few specific product features for a stronger listing.'], tags: makeTags(input), mode: 'Demo template' };
}
async function tryOllama(input) {
  // Optional: requires Ollama installed and its local API accessible from the browser.
  const prompt = `You are a careful ecommerce listing assistant. Create an honest listing using only facts supplied below. Never invent measurements, materials, certifications, shipping promises, or benefits. Return valid JSON only with keys: title (string), description (string), features (array of strings), tags (array of strings). Keep title concise and tags useful. Platform: ${input.platform}. Category: ${input.category}. Style: ${input.tone}. Audience: ${input.audience || 'general shoppers'}. Keywords: ${input.keywords || 'choose relevant tags'}. Product name: ${input.productName}. Product details: ${input.features}`;
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'qwen2.5:3b', prompt, stream: false, format: 'json' })
  });
  if (!response.ok) throw new Error('Local model did not respond');
  const data = await response.json();
  const result = JSON.parse(data.response);
  if (!result.title || !result.description) throw new Error('Model response was incomplete');
  return { title: result.title, description: result.description,
    features: Array.isArray(result.features) ? result.features : splitFeatures(input.features),
    tags: Array.isArray(result.tags) ? result.tags.slice(0, 10) : makeTags(input),
    mode: 'Local model · Ollama' };
}
function readForm() {
  return {
    productName: clean($('productName').value),
    category: $('category').value,
    platform: $('platform').value,
    features: $('features').value.trim(),
    audience: clean($('audience').value),
    tone: $('tone').value,
    keywords: clean($('keywords').value)
  };
}
function renderListing(listing) {
  $('emptyState').classList.add('hidden');
  $('resultContent').classList.remove('hidden');
  $('statusPill').textContent = listing.mode;
  $('outTitle').textContent = listing.title;
  $('outDescription').textContent = listing.description;
  const list = $('outFeatures');
  list.replaceChildren();
  listing.features.forEach(feature => {
    const li = document.createElement('li');
    li.textContent = feature;
    list.appendChild(li);
  });
  const tagContainer = $('outTags');
  tagContainer.replaceChildren();
  listing.tags.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = String(tag).replace(/^#/, '');
    tagContainer.appendChild(span);
  });
  $('generationNote').textContent = listing.mode === 'Demo template'
    ? 'Demo mode: generated locally with a template, not an AI model. Connect Ollama for local open-weight generation.'
    : 'Generated by your local model. Review claims and details before publishing.';
}

async function generate() {
  if (!form.reportValidity()) return;

  lastInput = readForm();
  $('statusPill').textContent = 'Connecting to local AI…';
  $('generationNote').textContent =
    'Trying to generate your listing with Ollama on this computer.';

  try {
    const listing = await tryOllama(lastInput);
    renderListing(listing);

    $('statusPill').textContent = 'Local model · Ollama';
    $('generationNote').textContent =
      'Connected successfully. This listing was generated by your local model. Review all claims before publishing.';

    showToast('Listing generated with your local model.');
  } catch (error) {
    console.error('Ollama generation failed:', error);

    const listing = demoListing(lastInput);
    renderListing(listing);

    $('statusPill').textContent = 'Demo template';
    $('generationNote').textContent =
      'Ollama could not generate this listing. A browser-based demo template was used instead. Check that Ollama is running and that browser access is allowed.';

    if (error instanceof SyntaxError) {
      showToast('AI returned an invalid response. Demo used instead.');
    } else if (error instanceof TypeError) {
      showToast('Could not connect to local AI. Demo used instead.');
    } else {
      showToast('Local AI unavailable. Demo used instead.');
    }
  }
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  generate();
});
$('regenerateBtn').addEventListener('click', () => {
  if (lastInput) generate();
});
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const target = $(button.dataset.copy);
    const text = target.id === 'outTags'
      ? [...target.querySelectorAll('.tag')].map(tag => tag.textContent).join(', ')
      : target.textContent;
    try { await navigator.clipboard.writeText(text); showToast('Copied to clipboard.'); }
    catch { showToast('Clipboard unavailable. Select and copy the text manually.'); }
  });
});
$('copyAllBtn').addEventListener('click', async () => {
  const tags = [...$('outTags').querySelectorAll('.tag')].map(tag => tag.textContent).join(', ');
  const features = [...$('outFeatures').querySelectorAll('li')].map(li => `- ${li.textContent}`).join('\n');
  const full = `TITLE\n${$('outTitle').textContent}\n\nDESCRIPTION\n${$('outDescription').textContent}\n\nKEY FEATURES\n${features}\n\nSEARCH TAGS\n${tags}`;
  try { await navigator.clipboard.writeText(full); showToast('Full listing copied.'); }
  catch { showToast('Clipboard unavailable. Copy each section manually.'); }
});
$('helpBtn').addEventListener('click', () => {
  alert('Enter your product details and choose Generate. The app first tries a local Ollama model (qwen2.5:3b). If it is unavailable, a template demo runs in your browser. See README.txt for setup notes.');
});
