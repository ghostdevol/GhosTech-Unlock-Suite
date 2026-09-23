const { runUnlock } = require('./unlock');

document.getElementById('unlockBtn').addEventListener('click', () => {
  const selected = modelSelect.value;
  if (!selected) return alert('Select a model first.');

  const [brand, model] = selected.split('\\');
  status.innerHTML = `🔓 Attempting network unlock for ${brand} / ${model}...`;

  runUnlock(brand, model, (err, stdout) => {
    status.innerHTML = err
      ? `❌ Unlock error: ${err.message}`
      : `✅ Unlock complete:\n${stdout}`;
  });
});
