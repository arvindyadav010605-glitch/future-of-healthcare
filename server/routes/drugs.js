const express = require('express');
const router = express.Router();
const https = require('https');

// GET drug information from OpenFDA
router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: 'Query parameter q is required' });

  const encodedQuery = encodeURIComponent(q);
  const path = `/drug/label.json?search=openfda.brand_name:"${encodedQuery}"+openfda.generic_name:"${encodedQuery}"&limit=3`;

  const options = {
    hostname: 'api.fda.gov',
    path,
    method: 'GET',
    headers: { 'User-Agent': 'MedAI-Nexus/1.0' }
  };

  const fdaReq = https.request(options, (fdaRes) => {
    let data = '';
    fdaRes.on('data', chunk => data += chunk);
    fdaRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.error) {
          return res.json({ success: false, error: 'Drug not found in FDA database', data: null });
        }

        const results = parsed.results?.map(drug => ({
          brand_name: drug.openfda?.brand_name?.[0] || 'Unknown',
          generic_name: drug.openfda?.generic_name?.[0] || 'Unknown',
          manufacturer: drug.openfda?.manufacturer_name?.[0] || 'Unknown',
          purpose: drug.purpose?.[0]?.substring(0, 300) || 'Not specified',
          warnings: drug.warnings?.[0]?.substring(0, 500) || 'See full label',
          dosage: drug.dosage_and_administration?.[0]?.substring(0, 400) || 'Consult healthcare provider',
          indications: drug.indications_and_usage?.[0]?.substring(0, 400) || 'Not available',
          adverse_reactions: drug.adverse_reactions?.[0]?.substring(0, 400) || 'Not available',
          drug_interactions: drug.drug_interactions?.[0]?.substring(0, 400) || 'Consult your pharmacist',
          route: drug.openfda?.route?.[0] || 'Unknown',
          product_type: drug.openfda?.product_type?.[0] || 'Unknown'
        })) || [];

        res.json({ success: true, data: results, count: results.length });
      } catch (e) {
        res.status(500).json({ success: false, error: 'Failed to parse FDA response' });
      }
    });
  });

  fdaReq.on('error', (e) => {
    res.status(500).json({ success: false, error: `FDA API error: ${e.message}` });
  });

  fdaReq.end();
});

// GET drug adverse events
router.get('/adverse-events', (req, res) => {
  const { drug } = req.query;
  if (!drug) return res.status(400).json({ success: false, error: 'Drug parameter required' });

  const encodedDrug = encodeURIComponent(drug);
  const options = {
    hostname: 'api.fda.gov',
    path: `/drug/event.json?search=patient.drug.medicinalproduct:"${encodedDrug}"&count=patient.reaction.reactionmeddrapt.exact&limit=8`,
    method: 'GET',
    headers: { 'User-Agent': 'MedAI-Nexus/1.0' }
  };

  const fdaReq = https.request(options, (fdaRes) => {
    let data = '';
    fdaRes.on('data', chunk => data += chunk);
    fdaRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const events = parsed.results?.map(r => ({
          reaction: r.term,
          count: r.count
        })) || [];
        res.json({ success: true, data: events });
      } catch (e) {
        res.json({ success: true, data: [], message: 'No adverse event data available' });
      }
    });
  });

  fdaReq.on('error', () => {
    res.json({ success: true, data: [], message: 'FDA adverse events unavailable' });
  });

  fdaReq.end();
});

// GET popular drugs list
router.get('/popular', (req, res) => {
  const popularDrugs = [
    { name: 'Aspirin', use: 'Pain relief, blood thinner', category: 'Analgesic', icon: '💊' },
    { name: 'Ibuprofen', use: 'Anti-inflammatory, pain relief', category: 'NSAID', icon: '💊' },
    { name: 'Metformin', use: 'Type 2 diabetes management', category: 'Antidiabetic', icon: '💉' },
    { name: 'Lisinopril', use: 'Blood pressure control', category: 'ACE Inhibitor', icon: '❤️' },
    { name: 'Atorvastatin', use: 'Cholesterol lowering', category: 'Statin', icon: '🫀' },
    { name: 'Amoxicillin', use: 'Bacterial infections', category: 'Antibiotic', icon: '🦠' },
    { name: 'Omeprazole', use: 'Acid reflux, GERD', category: 'PPI', icon: '🫁' },
    { name: 'Levothyroxine', use: 'Thyroid hormone replacement', category: 'Hormone', icon: '🔬' }
  ];
  res.json({ success: true, data: popularDrugs });
});

module.exports = router;
