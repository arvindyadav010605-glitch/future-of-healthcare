const express = require('express');
const router = express.Router();
const https = require('https');

// POST: AI Symptom Checker using Gemini API
router.post('/symptom-check', async (req, res) => {
  try {
    const { symptoms, age, gender, existing_conditions } = req.body;

    if (!symptoms || symptoms.trim() === '') {
      return res.status(400).json({ success: false, error: 'Symptoms are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `You are an advanced AI medical assistant. Analyze the following patient information and provide a structured health assessment.

Patient Details:
- Age: ${age || 'Not provided'}
- Gender: ${gender || 'Not provided'}
- Existing Conditions: ${existing_conditions || 'None reported'}
- Reported Symptoms: ${symptoms}

Provide a JSON response with this exact structure:
{
  "triage_level": "one of: Low, Moderate, High, Critical",
  "triage_color": "one of: green, yellow, orange, red",
  "possible_conditions": [
    {"name": "condition name", "probability": "High/Medium/Low", "description": "brief description"}
  ],
  "immediate_recommendations": ["action 1", "action 2"],
  "lifestyle_advice": ["advice 1", "advice 2"],
  "when_to_see_doctor": "description of urgency",
  "disclaimer": "standard medical disclaimer",
  "ai_summary": "2-3 sentence human-readable summary of the assessment"
}

Respond ONLY with valid JSON, no markdown.`;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Demo mode response
      return res.json({
        success: true,
        demo_mode: true,
        data: getDemoResponse(symptoms)
      });
    }

    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const geminiReq = https.request(options, (geminiRes) => {
      let data = '';
      geminiRes.on('data', chunk => data += chunk);
      geminiRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const aiResponse = JSON.parse(cleanText);
          res.json({ success: true, demo_mode: false, data: aiResponse });
        } catch (e) {
          res.json({ success: true, demo_mode: true, data: getDemoResponse(symptoms), parse_error: true });
        }
      });
    });

    geminiReq.on('error', () => {
      res.json({ success: true, demo_mode: true, data: getDemoResponse(symptoms) });
    });

    geminiReq.write(requestBody);
    geminiReq.end();

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function getDemoResponse(symptoms) {
  const symptomsLower = symptoms.toLowerCase();
  let triage = 'Low';
  let color = 'green';

  if (symptomsLower.includes('chest') || symptomsLower.includes('breath') || symptomsLower.includes('severe')) {
    triage = 'High'; color = 'orange';
  } else if (symptomsLower.includes('fever') || symptomsLower.includes('pain') || symptomsLower.includes('vomit')) {
    triage = 'Moderate'; color = 'yellow';
  }

  return {
    triage_level: triage,
    triage_color: color,
    possible_conditions: [
      { name: 'Viral Infection', probability: 'Medium', description: 'Common viral illness affecting multiple body systems' },
      { name: 'Stress-Related Condition', probability: 'Low', description: 'Physical symptoms stemming from stress or anxiety' },
      { name: 'Gastrointestinal Issue', probability: 'Low', description: 'Digestive system related complaint' }
    ],
    immediate_recommendations: [
      'Rest and stay hydrated with plenty of fluids',
      'Monitor symptoms for any significant worsening',
      'Take over-the-counter medication for symptom relief if appropriate',
      'Consult a healthcare provider if symptoms persist beyond 48-72 hours'
    ],
    lifestyle_advice: [
      'Maintain a regular sleep schedule of 7-9 hours',
      'Eat balanced, nutritious meals to support immune function',
      'Avoid strenuous physical activity until symptoms improve',
      'Practice stress-reduction techniques'
    ],
    when_to_see_doctor: 'Seek immediate medical attention if symptoms worsen significantly, you develop new severe symptoms, or symptoms persist beyond 3 days.',
    disclaimer: '⚠️ This AI assessment is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.',
    ai_summary: `Based on the reported symptoms, this appears to be a ${triage.toLowerCase()} priority situation. The symptoms suggest a possible common condition that may resolve with proper rest and care. However, continued monitoring is recommended and professional medical consultation is advised if symptoms persist or worsen.`
  };
}

// GET: AI Health Tips
router.get('/health-tips', (req, res) => {
  const tips = [
    { category: 'Nutrition', tip: 'Eat a rainbow of vegetables daily to get diverse phytonutrients and antioxidants.', icon: '🥗' },
    { category: 'Exercise', tip: 'Aim for 150 minutes of moderate aerobic activity per week — even brisk walking counts.', icon: '🏃' },
    { category: 'Sleep', tip: 'Consistent sleep schedules regulate your circadian rhythm and boost immune function.', icon: '😴' },
    { category: 'Mental Health', tip: 'Practice mindfulness for 10 minutes daily to reduce cortisol levels by up to 25%.', icon: '🧠' },
    { category: 'Hydration', tip: 'Drink at least 8 glasses of water daily. Dehydration affects cognitive performance by 20%.', icon: '💧' },
    { category: 'Prevention', tip: 'Regular health screenings catch 80% of serious conditions before they become critical.', icon: '🏥' },
    { category: 'Heart Health', tip: 'Reducing sodium intake to under 2300mg/day significantly lowers blood pressure risk.', icon: '❤️' },
    { category: 'Immunity', tip: 'Vitamin D deficiency affects 40% of adults — get 15 minutes of sunlight daily.', icon: '☀️' }
  ];

  const shuffled = tips.sort(() => Math.random() - 0.5).slice(0, 4);
  res.json({ success: true, data: shuffled });
});

module.exports = router;
