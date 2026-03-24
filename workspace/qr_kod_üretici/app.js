import { generateQRCode } from './api.js';
import { showQRCode, showError, showLoading, hideLoading, updateCharCounter } from './ui.js';

const MAX_CHARS = 500;
const DEBOUNCE_DELAY = 600;

const form = document.getElementById('qr-form');
const textInput = document.getElementById('qr-text');
const generateBtn = document.getElementById('generate-btn');
const charCounter = document.getElementById('char-counter');

let debounceTimer = null;
let isGenerating = false;

function debounce(fn, delay) {
  return function (...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function validateInput(text) {
  if (!text || text.trim().length === 0) {
    return { valid: false, message: 'Lütfen bir metin veya URL girin.' };
  }
  if (text.length > MAX_CHARS) {
    return { valid: false, message: `Metin en fazla ${MAX_CHARS} karakter olabilir.` };
  }
  return { valid: true, message: null };
}

async function handleGenerate(text, isPreview = false) {
  const trimmedText = text.trim();
  const validation = validateInput(trimmedText);

  if (!validation.valid) {
    if (!isPreview) {
      showError(validation.message);
    }
    return;
  }

  if (isGenerating) return;

  try {
    isGenerating = true;
    if (!isPreview) {
      showLoading();
    }

    const qrDataURL = await generateQRCode(trimmedText);
    showQRCode(qrDataURL, trimmedText);
  } catch (error) {
    showError(error.message || 'QR kod oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    isGenerating = false;
    if (!isPreview) {
      hideLoading();
    }
  }
}

const debouncedPreview = debounce(function (text) {
  if (text.trim().length > 0 && text.length <= MAX_CHARS) {
    handleGenerate(text, true);
  }
}, DEBOUNCE_DELAY);

function handleInputChange() {
  const text = textInput.value;
  const currentLength = text.length;

  updateCharCounter(currentLength, MAX_CHARS);

  if (currentLength > MAX_CHARS) {
    charCounter?.classList.add('over-limit');
    generateBtn.disabled = true;
  } else {
    charCounter?.classList.remove('over-limit');
    generateBtn.disabled = false;
  }

  debouncedPreview(text);
}

function handleFormSubmit(event) {
  event.preventDefault();
  clearTimeout(debounceTimer);

  const text = textInput.value;
  const validation = validateInput(text);

  if (!validation.valid) {
    showError(validation.message);
    textInput.focus();
    return;
  }

  handleGenerate(text, false);
}

function handleKeyDown(event) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    clearTimeout(debounceTimer);
    handleGenerate(textInput.value, false);
  }
}

function init() {
  updateCharCounter(0, MAX_CHARS);

  form.addEventListener('submit', handleFormSubmit);

  textInput.addEventListener('input', handleInputChange);

  textInput.addEventListener('keydown', handleKeyDown);

  generateBtn.addEventListener('click', function (event) {
    if (form.contains(generateBtn)) return;
    event.preventDefault();
    clearTimeout(debounceTimer);
    handleGenerate(textInput.value, false);
  });

  textInput.focus();
}

document.addEventListener('DOMContentLoaded', init);