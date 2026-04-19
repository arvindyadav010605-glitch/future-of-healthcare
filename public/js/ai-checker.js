/* ============================================================
   AI Symptom Checker Page
   ============================================================ */

async function renderAIChecker(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title gradient-text">AI Symptom Checker</h1>
        <p class="page-subtitle">Powered by Google Gemini — Advanced AI health assessment</p>
      </div>
      <span class="badge badge-primary" style="font-size: 13px; padding: 8px 16px;">
        <i data-lucide="brain-circuit" size="14"></i> &nbsp;Gemini AI
      </span>
    </div>

    <!-- Warning banner -->
    <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 24px; display: flex; gap: 10px; align-items: flex-start;">
      <span style="font-size: 18px; flex-shrink: 0;">⚠️</span>
      <span style="font-size: 13px; color: var(--accent-amber); line-height: 1.5;"><strong>Medical Disclaimer:</strong> This AI tool provides informational guidance only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.</span>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
      <!-- Input Form -->
      <div class="card">
        <h2 class="section-title" style="margin-bottom: 20px;">Patient Information</h2>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Age</label>
            <input type="number" id="aiAge" class="form-input" placeholder="e.g. 35" min="1" max="120" />
          </div>
          <div class="form-group">
            <label class="form-label">Gender</label>
            <select id="aiGender" class="form-input">
              <option value="">Select</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Existing Medical Conditions</label>
          <input type="text" id="aiConditions" class="form-input" placeholder="e.g. Diabetes, Hypertension (optional)" />
        </div>
        <div class="form-group">
          <label class="form-label">Describe Your Symptoms *</label>
          <textarea id="aiSymptoms" class="form-input" rows="5" placeholder="Describe your symptoms in detail...&#10;e.g. I have had persistent headache for 3 days, mild fever of 38°C, and fatigue. Pain worsens in the morning."></textarea>
        </div>

        <!-- Quick symptom buttons -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">Quick Add Symptoms</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${['Headache', 'Fever', 'Chest Pain', 'Fatigue', 'Shortness of Breath', 'Nausea', 'Back Pain', 'Cough'].map(s =>
              `<button class="btn btn-secondary btn-xs symptom-quick" data-symptom="${s}">${s}</button>`
            ).join('')}
          </div>
        </div>

        <button class="btn btn-primary btn-full" id="aiCheckBtn" onclick="runSymptomCheck()">
          <i data-lucide="brain-circuit" size="16"></i> Analyze Symptoms with AI
        </button>
      </div>

      <!-- Results Panel -->
      <div>
        <div class="card" id="aiResultCard" style="min-height: 400px;">
          <div id="aiResultContent">
            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
              <div style="font-size: 64px; margin-bottom: 16px;">🤖</div>
              <div style="font-size: 16px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">AI Awaiting Input</div>
              <div style="font-size: 13px;">Fill in patient details and describe symptoms, then click "Analyze Symptoms"</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat history -->
    <div class="card" style="margin-top: 24px;">
      <div class="section-header">
        <h2 class="section-title">💬 Consultation Chat</h2>
        <button class="btn btn-secondary btn-sm" onclick="clearAIChat()"><i data-lucide="trash-2" size="14"></i> Clear</button>
      </div>
      <div class="chat-container" style="height: 340px;">
        <div class="chat-messages" id="aiChatMessages">
          <div class="chat-message ai">
            <div class="chat-avatar ai">🤖</div>
            <div class="chat-bubble">Hello! I'm your AI medical assistant powered by Google Gemini. Please describe your symptoms using the form above, and I'll provide a comprehensive health assessment. Remember, I'm here to assist — not replace — your healthcare provider.</div>
          </div>
        </div>
        <div class="chat-input-area">
          <input type="text" class="form-input" id="aiChatInput" placeholder="Ask a follow-up health question..." style="flex:1;" />
          <button class="btn btn-primary" onclick="sendChatMessage()"><i data-lucide="send" size="16"></i></button>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();

  // Quick symptom buttons
  document.querySelectorAll('.symptom-quick').forEach(btn => {
    btn.addEventListener('click', () => {
      const ta = document.getElementById('aiSymptoms');
      const s = btn.dataset.symptom;
      ta.value = ta.value ? ta.value + ', ' + s : s;
    });
  });

  // Enter to send chat
  document.getElementById('aiChatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });
}

async function runSymptomCheck() {
  const symptoms = document.getElementById('aiSymptoms').value.trim();
  if (!symptoms) { showToast('Please describe your symptoms', 'warning'); return; }

  const btn = document.getElementById('aiCheckBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div> Analyzing with AI...';

  const resultContent = document.getElementById('aiResultContent');
  resultContent.innerHTML = `
    <div style="text-align: center; padding: 60px 20px;">
      <div class="loading-spinner" style="width: 48px; height: 48px; margin: 0 auto 16px;"></div>
      <div style="font-size: 14px; color: var(--text-secondary);">AI analyzing symptoms...</div>
    </div>`;

  try {
    const payload = {
      symptoms,
      age: document.getElementById('aiAge').value || '',
      gender: document.getElementById('aiGender').value || '',
      existing_conditions: document.getElementById('aiConditions').value || ''
    };

    const res = await apiPost('/ai/symptom-check', payload);

    if (res.success) {
      displayAIResults(res.data, res.demo_mode);
      addAIChatMessage('user', symptoms);
      addAIChatMessage('ai', res.data.ai_summary + (res.demo_mode ? ' _(Demo Mode — Add Gemini API key for real AI responses)_' : ''));
    } else {
      showToast('AI check failed: ' + res.error, 'error');
    }
  } catch(err) {
    showToast('AI service unavailable', 'error');
    resultContent.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Service Unavailable</div><div class="empty-desc">${err.message}</div></div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="brain-circuit" size="16"></i> Analyze Symptoms with AI';
    lucide.createIcons();
  }
}

function displayAIResults(data, demoMode) {
  const colorMap = { green: 'triage-green', yellow: 'triage-yellow', orange: 'triage-orange', red: 'triage-red' };
  const triageClass = colorMap[data.triage_color] || 'triage-green';
  const resultContent = document.getElementById('aiResultContent');

  resultContent.innerHTML = `
    ${demoMode ? `<div style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: var(--radius-sm); padding: 8px 12px; margin-bottom: 16px; font-size: 12px; color: var(--primary-light);">
      🔵 Demo Mode — <a href="#" style="color: var(--primary-light);">Add Gemini API key</a> for real AI responses
    </div>` : ''}

    <div style="margin-bottom: 20px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">Triage Level</div>
      <span class="triage-badge ${triageClass}">
        ${{ green: '🟢', yellow: '🟡', orange: '🟠', red: '🔴' }[data.triage_color] || '⚪'}
        ${data.triage_level} Priority
      </span>
    </div>

    <div style="margin-bottom: 16px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">AI Summary</div>
      <div style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">${data.ai_summary}</div>
    </div>

    <div style="margin-bottom: 16px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">Possible Conditions</div>
      ${(data.possible_conditions || []).map(c => `
        <div style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--bg-card); border-radius: var(--radius-sm); margin-bottom: 6px;">
          <span class="badge ${c.probability === 'High' ? 'badge-danger' : c.probability === 'Medium' ? 'badge-warning' : 'badge-muted'}">${c.probability}</span>
          <div><div style="font-weight: 600; font-size: 13px;">${c.name}</div><div style="font-size: 12px; color: var(--text-muted);">${c.description}</div></div>
        </div>
      `).join('')}
    </div>

    <div style="margin-bottom: 16px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">Immediate Recommendations</div>
      ${(data.immediate_recommendations || []).map(r => `
        <div style="display: flex; gap: 8px; padding: 6px 0; font-size: 13px; color: var(--text-secondary);">
          <span style="color: var(--accent-emerald); flex-shrink: 0;">✓</span> ${r}
        </div>
      `).join('')}
    </div>

    <div style="background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 12px; color: var(--text-muted); line-height: 1.5;">
      ${data.disclaimer}
    </div>
  `;
}

function addAIChatMessage(role, text) {
  const messages = document.getElementById('aiChatMessages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = `chat-message ${role}`;
  div.innerHTML = `
    <div class="chat-avatar ${role}">${role === 'user' ? '👤' : '🤖'}</div>
    <div class="chat-bubble">${text}</div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('aiChatInput');
  const text = input.value.trim();
  if (!text) return;
  addAIChatMessage('user', text);
  input.value = '';

  // Simple health Q&A responses
  const lowerText = text.toLowerCase();
  let reply = '';

  if (lowerText.includes('emergency') || lowerText.includes('911') || lowerText.includes('ambulance')) {
    reply = '🚨 If this is a medical emergency, please call emergency services (112 in India / 911 in the US) immediately. Do not delay getting professional help.';
  } else if (lowerText.includes('fever') || lowerText.includes('temperature')) {
    reply = 'A fever above 38°C (100.4°F) is generally concerning. Stay hydrated, rest, and take paracetamol if appropriate. Seek medical attention if fever exceeds 39.5°C, lasts more than 3 days, or is accompanied by severe symptoms.';
  } else if (lowerText.includes('diet') || lowerText.includes('nutrition') || lowerText.includes('eat')) {
    reply = 'A balanced diet rich in fruits, vegetables, whole grains, and lean protein supports overall health. For specific dietary advice related to your condition, consult a registered dietitian or your doctor.';
  } else if (lowerText.includes('exercise') || lowerText.includes('workout')) {
    reply = 'Regular physical activity (150 min/week of moderate exercise) is excellent for health. However, always consult your doctor before starting a new exercise program, especially with existing conditions.';
  } else if (lowerText.includes('medication') || lowerText.includes('medicine') || lowerText.includes('drug')) {
    reply = 'For medication queries, use our Drug Lookup tool for detailed information. Never change medication dosages without consulting your prescribing physician.';
  } else {
    reply = `Thank you for your question about "${text}". I recommend discussing this specific concern with your healthcare provider who can evaluate your complete medical history. Would you like me to run a full symptom assessment?`;
  }

  setTimeout(() => addAIChatMessage('ai', reply), 600);
}

function clearAIChat() {
  const messages = document.getElementById('aiChatMessages');
  if (messages) {
    messages.innerHTML = `
      <div class="chat-message ai">
        <div class="chat-avatar ai">🤖</div>
        <div class="chat-bubble">Chat cleared. How can I help you with your health concerns today?</div>
      </div>`;
  }
}
