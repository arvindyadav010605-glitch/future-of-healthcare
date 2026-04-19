const express = require('express');
const router = express.Router();
const https = require('https');

router.get('/', (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey || apiKey === 'your_newsapi_key_here') {
    return res.json({ success: true, demo_mode: true, data: getDemoNews() });
  }

  const options = {
    hostname: 'newsapi.org',
    path: `/v2/top-headlines?category=health&language=en&pageSize=8&apiKey=${apiKey}`,
    method: 'GET',
    headers: { 'User-Agent': 'MedAI-Nexus/1.0' }
  };

  const newsReq = https.request(options, (newsRes) => {
    let data = '';
    newsRes.on('data', chunk => data += chunk);
    newsRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.status !== 'ok') {
          return res.json({ success: true, demo_mode: true, data: getDemoNews() });
        }
        const articles = parsed.articles?.map(a => ({
          title: a.title,
          description: a.description,
          url: a.url,
          source: a.source?.name,
          publishedAt: a.publishedAt,
          urlToImage: a.urlToImage
        })) || [];
        res.json({ success: true, demo_mode: false, data: articles });
      } catch (e) {
        res.json({ success: true, demo_mode: true, data: getDemoNews() });
      }
    });
  });

  newsReq.on('error', () => {
    res.json({ success: true, demo_mode: true, data: getDemoNews() });
  });

  newsReq.end();
});

function getDemoNews() {
  return [
    {
      title: 'AI Diagnoses Diabetic Retinopathy with 97% Accuracy in New Study',
      description: 'Researchers at Stanford have developed an AI model that outperforms ophthalmologists in detecting early-stage diabetic retinopathy using retinal scans.',
      url: '#', source: 'MedAI News', publishedAt: new Date().toISOString(),
      category: 'AI & Diagnostics'
    },
    {
      title: 'Wearable Health Monitors Reduce Hospital Readmissions by 35%',
      description: 'A landmark clinical trial shows continuous monitoring through smart wearables significantly reduces readmission rates for cardiac patients.',
      url: '#', source: 'Health Tech Weekly', publishedAt: new Date(Date.now() - 86400000).toISOString(),
      category: 'Digital Health'
    },
    {
      title: 'mRNA Technology Beyond COVID: New Cancer Vaccines Enter Phase 3 Trials',
      description: 'Personalized mRNA cancer vaccines for melanoma and lung cancer show remarkable 60% reduction in recurrence in Phase 2 trials.',
      url: '#', source: 'Biotech Insider', publishedAt: new Date(Date.now() - 172800000).toISOString(),
      category: 'Immunotherapy'
    },
    {
      title: 'Digital Therapeutics Approved for Treating Insomnia Without Medication',
      description: 'FDA approves first prescription digital therapeutic app using CBT-I protocols to treat chronic insomnia, showing equal efficacy to sleep medications.',
      url: '#', source: 'FDA Today', publishedAt: new Date(Date.now() - 259200000).toISOString(),
      category: 'Digital Therapeutics'
    },
    {
      title: 'Gut Microbiome Linked to Mental Health: Probiotics Show Promise in Depression',
      description: 'New research confirms the gut-brain axis connection with probiotic supplementation reducing depression symptoms by 40% in controlled trials.',
      url: '#', source: 'Neuroscience Daily', publishedAt: new Date(Date.now() - 345600000).toISOString(),
      category: 'Mental Health'
    },
    {
      title: 'Robotic Surgery Platform Achieves Zero-Error Rate in 10,000 Procedures',
      description: 'The Da Vinci 5 robotic surgery system reports unprecedented precision statistics across major medical centers worldwide.',
      url: '#', source: 'Surgical Innovation', publishedAt: new Date(Date.now() - 432000000).toISOString(),
      category: 'Robotics'
    }
  ];
}

module.exports = router;
