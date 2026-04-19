require('dotenv').config();
const { getDb, initializeDatabase } = require('./database');
const {sql} = require('@databases/sqlite');

async function seed() {
  await initializeDatabase();
  const db = await getDb();

  console.log('🌱 Seeding MedAI Nexus database...\n');

  // Clear existing data
  await db.query(sql`DELETE FROM health_logs`);
  await db.query(sql`DELETE FROM vitals`);
  await db.query(sql`DELETE FROM appointments`);
  await db.query(sql`DELETE FROM patients`);

  // Patient data
  const patients = [
    { name: 'Arjun Sharma', age: 45, gender: 'Male', blood_type: 'B+', phone: '+91 98765 43210', email: 'arjun.sharma@email.com', address: 'Mumbai, Maharashtra', conditions: ['Type 2 Diabetes', 'Hypertension'], allergies: ['Penicillin'], risk_level: 'high' },
    { name: 'Priya Patel', age: 32, gender: 'Female', blood_type: 'O+', phone: '+91 87654 32109', email: 'priya.patel@email.com', address: 'Ahmedabad, Gujarat', conditions: ['Asthma'], allergies: [], risk_level: 'medium' },
    { name: 'Rahul Verma', age: 58, gender: 'Male', blood_type: 'A+', phone: '+91 76543 21098', email: 'rahul.verma@email.com', address: 'Delhi, NCR', conditions: ['Coronary Artery Disease', 'High Cholesterol'], allergies: ['Aspirin', 'Sulfa'], risk_level: 'high' },
    { name: 'Sneha Reddy', age: 27, gender: 'Female', blood_type: 'AB+', phone: '+91 65432 10987', email: 'sneha.reddy@email.com', address: 'Hyderabad, Telangana', conditions: [], allergies: ['Latex'], risk_level: 'low' },
    { name: 'Vikram Singh', age: 52, gender: 'Male', blood_type: 'O-', phone: '+91 54321 09876', email: 'vikram.singh@email.com', address: 'Jaipur, Rajasthan', conditions: ['COPD', 'Type 2 Diabetes'], allergies: ['NSAIDs'], risk_level: 'high' },
    { name: 'Ananya Nair', age: 38, gender: 'Female', blood_type: 'B-', phone: '+91 43210 98765', email: 'ananya.nair@email.com', address: 'Kochi, Kerala', conditions: ['Hypothyroidism'], allergies: [], risk_level: 'low' },
    { name: 'Rohit Kumar', age: 44, gender: 'Male', blood_type: 'A-', phone: '+91 32109 87654', email: 'rohit.kumar@email.com', address: 'Bangalore, Karnataka', conditions: ['Migraine', 'Anxiety'], allergies: ['Codeine'], risk_level: 'medium' },
    { name: 'Kavita Joshi', age: 61, gender: 'Female', blood_type: 'O+', phone: '+91 21098 76543', email: 'kavita.joshi@email.com', address: 'Pune, Maharashtra', conditions: ['Osteoporosis', 'Hypertension', 'Type 2 Diabetes'], allergies: [], risk_level: 'high' },
    { name: 'Aditya Mehta', age: 29, gender: 'Male', blood_type: 'B+', phone: '+91 10987 65432', email: 'aditya.mehta@email.com', address: 'Surat, Gujarat', conditions: [], allergies: [], risk_level: 'low' },
    { name: 'Deepa Krishnan', age: 36, gender: 'Female', blood_type: 'A+', phone: '+91 09876 54321', email: 'deepa.k@email.com', address: 'Chennai, Tamil Nadu', conditions: ['PCOS', 'Iron Deficiency Anemia'], allergies: ['Sulfa'], risk_level: 'medium' },
    { name: 'Suresh Iyer', age: 67, gender: 'Male', blood_type: 'AB-', phone: '+91 88776 65544', email: 'suresh.iyer@email.com', address: 'Coimbatore, Tamil Nadu', conditions: ['Heart Failure', 'CKD Stage 3', 'Atrial Fibrillation'], allergies: ['Aspirin'], risk_level: 'high' },
    { name: 'Meera Agarwal', age: 24, gender: 'Female', blood_type: 'O+', phone: '+91 77665 54433', email: 'meera.a@email.com', address: 'Lucknow, UP', conditions: [], allergies: [], risk_level: 'low' },
    { name: 'Nikhil Desai', age: 41, gender: 'Male', blood_type: 'B+', phone: '+91 66554 43322', email: 'nikhil.d@email.com', address: 'Nagpur, Maharashtra', conditions: ['Hypertension', 'Obesity'], allergies: [], risk_level: 'medium' },
    { name: 'Sunita Bhatt', age: 53, gender: 'Female', blood_type: 'A+', phone: '+91 55443 32211', email: 'sunita.b@email.com', address: 'Indore, MP', conditions: ['Rheumatoid Arthritis'], allergies: ['Methotrexate'], risk_level: 'medium' },
    { name: 'Rajesh Pandey', age: 49, gender: 'Male', blood_type: 'O-', phone: '+91 44332 21100', email: 'rajesh.p@email.com', address: 'Varanasi, UP', conditions: ['Chronic Hepatitis B', 'Liver Cirrhosis'], allergies: [], risk_level: 'high' }
  ];

  const patientIds = [];
  for (const p of patients) {
    await db.query(sql`
      INSERT INTO patients (name, age, gender, blood_type, phone, email, address, conditions, allergies, risk_level)
      VALUES (${p.name}, ${p.age}, ${p.gender}, ${p.blood_type}, ${p.phone}, ${p.email}, ${p.address},
              ${JSON.stringify(p.conditions)}, ${JSON.stringify(p.allergies)}, ${p.risk_level})
    `);
    const [row] = await db.query(sql`SELECT id FROM patients ORDER BY id DESC LIMIT 1`);
    patientIds.push(row.id);
  }
  console.log(`✅ Inserted ${patients.length} patients`);

  // Appointments
  const doctors = [
    { name: 'Dr. Kavya Rao', dept: 'Cardiology' },
    { name: 'Dr. Amit Sinha', dept: 'Endocrinology' },
    { name: 'Dr. Preethi Menon', dept: 'Pulmonology' },
    { name: 'Dr. Suhas Gupta', dept: 'Neurology' },
    { name: 'Dr. Nisha Kapoor', dept: 'General Medicine' },
    { name: 'Dr. Rahul Jain', dept: 'Orthopedics' },
    { name: 'Dr. Divya Reddy', dept: 'Gynecology' },
    { name: 'Dr. Arun Pillai', dept: 'Nephrology' }
  ];
  const times = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00'];
  const today = new Date();
  let apptCount = 0;

  for (let i = 0; i < 25; i++) {
    const daysOffset = Math.floor(Math.random() * 14) - 3;
    const date = new Date(today);
    date.setDate(date.getDate() + daysOffset);
    const dateStr = date.toISOString().split('T')[0];

    const patientIdx = Math.floor(Math.random() * patients.length);
    const doctorData = doctors[Math.floor(Math.random() * doctors.length)];
    const status = daysOffset < 0 ? (Math.random() > 0.2 ? 'completed' : 'cancelled') :
                   daysOffset === 0 ? 'confirmed' :
                   ['confirmed', 'confirmed', 'pending', 'pending', 'cancelled'][Math.floor(Math.random() * 5)];
    const time = times[Math.floor(Math.random() * times.length)];
    const notes = ['Follow-up consultation', 'Routine checkup', 'Lab results review', 'Medication adjustment', ''][Math.floor(Math.random() * 5)];

    await db.query(sql`
      INSERT INTO appointments (patient_id, patient_name, doctor, department, appointment_date, appointment_time, status, notes)
      VALUES (${patientIds[patientIdx]}, ${patients[patientIdx].name}, ${doctorData.name}, ${doctorData.dept}, ${dateStr}, ${time}, ${status}, ${notes})
    `);
    apptCount++;
  }
  console.log(`✅ Inserted ${apptCount} appointments`);

  // Vitals
  let vitalsCount = 0;
  for (let i = 0; i < patientIds.length; i++) {
    const isHighRisk = patients[i].risk_level === 'high';
    for (let day = 10; day >= 0; day--) {
      const d = new Date(today);
      d.setDate(d.getDate() - day);
      const hr = isHighRisk ? Math.floor(Math.random() * 30 + 85) : Math.floor(Math.random() * 20 + 65);
      const sys = isHighRisk ? Math.floor(Math.random() * 40 + 130) : Math.floor(Math.random() * 20 + 110);
      const dia = isHighRisk ? Math.floor(Math.random() * 20 + 85) : Math.floor(Math.random() * 15 + 70);
      const temp = parseFloat((Math.random() * 1.5 + 36.5).toFixed(1));
      const spo2 = isHighRisk ? Math.floor(Math.random() * 5 + 93) : Math.floor(Math.random() * 3 + 96);
      const glucose = isHighRisk ? Math.floor(Math.random() * 80 + 120) : Math.floor(Math.random() * 40 + 80);

      await db.query(sql`
        INSERT INTO vitals (patient_id, heart_rate, systolic, diastolic, temperature, spo2, glucose, recorded_at)
        VALUES (${patientIds[i]}, ${hr}, ${sys}, ${dia}, ${temp}, ${spo2}, ${glucose}, ${d.toISOString()})
      `);
      vitalsCount++;
    }
  }
  console.log(`✅ Inserted ${vitalsCount} vitals records`);

  // Health logs
  const logEntries = [
    [patientIds[0], 'alert_triggered', 'Blood glucose spike detected: 287 mg/dL', 'critical'],
    [patientIds[2], 'alert_triggered', 'Irregular heartbeat pattern detected', 'high'],
    [patientIds[4], 'medication_reminder', 'Inhaler prescribed, follow-up in 2 weeks', 'info'],
    [patientIds[7], 'alert_triggered', 'Blood pressure exceeding 180/110 mmHg', 'critical'],
    [patientIds[10], 'lab_result', 'eGFR 42 - CKD Stage 3 confirmed, nephrology referral sent', 'high'],
    [patientIds[1], 'checkup_completed', 'Annual physical exam completed, all vitals normal', 'info'],
    [patientIds[5], 'medication_changed', 'Levothyroxine dosage adjusted to 75mcg', 'info'],
    [patientIds[14], 'alert_triggered', 'Liver enzyme levels critically elevated', 'critical']
  ];

  for (const log of logEntries) {
    await db.query(sql`INSERT INTO health_logs (patient_id, action, description, severity) VALUES (${log[0]}, ${log[1]}, ${log[2]}, ${log[3]})`);
  }
  console.log(`✅ Inserted ${logEntries.length} health log entries`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('   Run: node server/server.js to start\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
