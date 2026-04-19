const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const {sql} = require('@databases/sqlite');

// GET all patients
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { search, risk_level, limit = 50 } = req.query;

    let patients;
    if (search && risk_level) {
      patients = await db.query(sql`SELECT * FROM patients WHERE (name LIKE ${'%'+search+'%'} OR email LIKE ${'%'+search+'%'} OR phone LIKE ${'%'+search+'%'}) AND risk_level = ${risk_level} ORDER BY created_at DESC LIMIT ${parseInt(limit)}`);
    } else if (search) {
      patients = await db.query(sql`SELECT * FROM patients WHERE name LIKE ${'%'+search+'%'} OR email LIKE ${'%'+search+'%'} OR phone LIKE ${'%'+search+'%'} ORDER BY created_at DESC LIMIT ${parseInt(limit)}`);
    } else if (risk_level) {
      patients = await db.query(sql`SELECT * FROM patients WHERE risk_level = ${risk_level} ORDER BY created_at DESC LIMIT ${parseInt(limit)}`);
    } else {
      patients = await db.query(sql`SELECT * FROM patients ORDER BY created_at DESC LIMIT ${parseInt(limit)}`);
    }

    res.json({ success: true, data: patients, count: patients.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET patient stats
router.get('/stats/summary', async (req, res) => {
  try {
    const db = await getDb();
    const [totalRow] = await db.query(sql`SELECT COUNT(*) as count FROM patients`);
    const byRisk = await db.query(sql`SELECT risk_level, COUNT(*) as count FROM patients GROUP BY risk_level`);
    const byGender = await db.query(sql`SELECT gender, COUNT(*) as count FROM patients GROUP BY gender`);
    const [recent] = await db.query(sql`SELECT COUNT(*) as count FROM patients WHERE created_at >= datetime('now', '-7 days')`);

    res.json({
      success: true,
      data: { total: totalRow.count, byRisk, byGender, recentWeek: recent.count }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single patient
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const [patient] = await db.query(sql`SELECT * FROM patients WHERE id = ${parseInt(req.params.id)}`);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
    const vitals = await db.query(sql`SELECT * FROM vitals WHERE patient_id = ${patient.id} ORDER BY recorded_at DESC LIMIT 10`);
    const appointments = await db.query(sql`SELECT * FROM appointments WHERE patient_id = ${patient.id} ORDER BY appointment_date DESC LIMIT 5`);
    res.json({ success: true, data: { ...patient, vitals, appointments } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create patient
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { name, age, gender, blood_type, phone, email, address, conditions, allergies, risk_level } = req.body;
    await db.query(sql`
      INSERT INTO patients (name, age, gender, blood_type, phone, email, address, conditions, allergies, risk_level)
      VALUES (${name}, ${age}, ${gender}, ${blood_type}, ${phone||''}, ${email||''}, ${address||''}, ${JSON.stringify(conditions||[])}, ${JSON.stringify(allergies||[])}, ${risk_level||'low'})
    `);
    const patients = await db.query(sql`SELECT * FROM patients ORDER BY id DESC LIMIT 1`);
    const newPatient = patients[0];
    await db.query(sql`INSERT INTO health_logs (patient_id, action, description, severity) VALUES (${newPatient.id}, 'patient_created', ${'New patient ' + name + ' registered'}, 'info')`);
    res.status(201).json({ success: true, data: newPatient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update patient
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { name, age, gender, blood_type, phone, email, address, conditions, allergies, risk_level } = req.body;
    await db.query(sql`
      UPDATE patients SET name=${name}, age=${age}, gender=${gender}, blood_type=${blood_type},
      phone=${phone}, email=${email}, address=${address},
      conditions=${JSON.stringify(conditions||[])}, allergies=${JSON.stringify(allergies||[])},
      risk_level=${risk_level}, updated_at=CURRENT_TIMESTAMP WHERE id=${parseInt(req.params.id)}
    `);
    const [patient] = await db.query(sql`SELECT * FROM patients WHERE id = ${parseInt(req.params.id)}`);
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE patient
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const id = parseInt(req.params.id);
    await db.query(sql`DELETE FROM vitals WHERE patient_id = ${id}`);
    await db.query(sql`DELETE FROM appointments WHERE patient_id = ${id}`);
    await db.query(sql`DELETE FROM patients WHERE id = ${id}`);
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
