const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const {sql} = require('@databases/sqlite');

// GET all appointments
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { status, date, department } = req.query;

    let appointments;
    if (status && date && department) {
      appointments = await db.query(sql`SELECT * FROM appointments WHERE status=${status} AND appointment_date=${date} AND department=${department} ORDER BY appointment_date ASC, appointment_time ASC`);
    } else if (status && date) {
      appointments = await db.query(sql`SELECT * FROM appointments WHERE status=${status} AND appointment_date=${date} ORDER BY appointment_date ASC, appointment_time ASC`);
    } else if (status && department) {
      appointments = await db.query(sql`SELECT * FROM appointments WHERE status=${status} AND department=${department} ORDER BY appointment_date ASC, appointment_time ASC`);
    } else if (date && department) {
      appointments = await db.query(sql`SELECT * FROM appointments WHERE appointment_date=${date} AND department=${department} ORDER BY appointment_date ASC, appointment_time ASC`);
    } else if (status) {
      appointments = await db.query(sql`SELECT * FROM appointments WHERE status=${status} ORDER BY appointment_date ASC, appointment_time ASC`);
    } else if (date) {
      appointments = await db.query(sql`SELECT * FROM appointments WHERE appointment_date=${date} ORDER BY appointment_date ASC, appointment_time ASC`);
    } else if (department) {
      appointments = await db.query(sql`SELECT * FROM appointments WHERE department=${department} ORDER BY appointment_date ASC, appointment_time ASC`);
    } else {
      appointments = await db.query(sql`SELECT * FROM appointments ORDER BY appointment_date ASC, appointment_time ASC`);
    }

    res.json({ success: true, data: appointments, count: appointments.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET today's appointments
router.get('/today', async (req, res) => {
  try {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    const appointments = await db.query(sql`SELECT * FROM appointments WHERE appointment_date = ${today} ORDER BY appointment_time ASC`);
    res.json({ success: true, data: appointments, count: appointments.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET stats
router.get('/stats/summary', async (req, res) => {
  try {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    const [todayCount] = await db.query(sql`SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ${today}`);
    const byStatus = await db.query(sql`SELECT status, COUNT(*) as count FROM appointments GROUP BY status`);
    const byDept = await db.query(sql`SELECT department, COUNT(*) as count FROM appointments GROUP BY department ORDER BY count DESC`);
    const [upcoming] = await db.query(sql`SELECT COUNT(*) as count FROM appointments WHERE appointment_date >= ${today} AND status != 'cancelled'`);
    res.json({ success: true, data: { today: todayCount.count, byStatus, byDepartment: byDept, upcoming: upcoming.count } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create appointment
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { patient_id, patient_name, doctor, department, appointment_date, appointment_time, notes } = req.body;
    await db.query(sql`
      INSERT INTO appointments (patient_id, patient_name, doctor, department, appointment_date, appointment_time, notes)
      VALUES (${patient_id}, ${patient_name}, ${doctor}, ${department}, ${appointment_date}, ${appointment_time}, ${notes||''})
    `);
    const [appt] = await db.query(sql`SELECT * FROM appointments ORDER BY id DESC LIMIT 1`);
    await db.query(sql`INSERT INTO health_logs (patient_id, action, description, severity) VALUES (${patient_id}, 'appointment_booked', ${'Appointment with ' + doctor + ' on ' + appointment_date}, 'info')`);
    res.status(201).json({ success: true, data: appt });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update appointment
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { status, notes, doctor, department, appointment_date, appointment_time } = req.body;
    await db.query(sql`
      UPDATE appointments SET status=${status}, notes=${notes||''}, doctor=${doctor}, department=${department}, appointment_date=${appointment_date}, appointment_time=${appointment_time}
      WHERE id=${parseInt(req.params.id)}
    `);
    const [appt] = await db.query(sql`SELECT * FROM appointments WHERE id = ${parseInt(req.params.id)}`);
    res.json({ success: true, data: appt });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE appointment
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.query(sql`DELETE FROM appointments WHERE id = ${parseInt(req.params.id)}`);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
