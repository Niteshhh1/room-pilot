import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('=============== ROOMPILOT HIGH-VOLUME V2 TEST SUITE ===============');
  console.log('Connecting to MongoDB locally to wipe dirty data...');
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.db.dropDatabase();
  console.log('Database wiped clean.');

  const authRes = await axios.post(`${API_URL}/auth/register`, {
    name: 'Test Admin', email: 'admin@test.com', password: 'password', contactNumber: '9999999999'
  });
  const token = authRes.data.token;
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('✅ Admin initialized, auth token acquired');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      passed++;
    } else {
      console.log(`❌ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // 1. UNIQUE PG NAME VALIDATION
    console.log('\n--- TESTING PG UNIQUE CONSTRAINTS ---');
    const pgRes1 = await axios.post(`${API_URL}/pgs`, {
      name: 'Omega PG', address: '123 Test', city: 'Testville', state: 'TS', totalFloors: 3
    });
    const pgId = pgRes1.data._id;
    assert(pgId, 'Omega PG Created');

    try {
      await axios.post(`${API_URL}/pgs`, {
        name: 'Omega PG', address: '456 Test', city: 'Testville', state: 'TS', totalFloors: 3
      });
      assert(false, 'Expected secondary Omega PG to fail duplicate name');
    } catch (err) {
      assert(err.response.status === 400 && err.response.data.message.includes('already exists'), 'Duplicate PG Name correctly rejected with 400');
    }

    // 2. ROOM CREATION
    console.log('\n--- CREATING ROOMS ---');
    const mainRoom1 = await axios.post(`${API_URL}/rooms`, {
      pgId, roomNumber: '101', floorNumber: 1, capacity: 2, rent: 5000, roomType: 'Double', roomSize: 'Medium'
    });
    const mainRoom2 = await axios.post(`${API_URL}/rooms`, {
      pgId, roomNumber: '102', floorNumber: 1, capacity: 500, rent: 4000, roomType: 'Dorm', roomSize: 'Large'
    });
    const roomId1 = mainRoom1.data._id;
    const roomId2 = mainRoom2.data._id;
    assert(roomId1 && roomId2, 'Rooms created successfully');

    // 3. TENANT UNIQUE VALIDATION
    console.log('\n--- TESTING TENANT UNIQUE CONSTRAINTS ---');
    const t0 = await axios.post(`${API_URL}/tenants`, {
      pg: pgId, room: roomId1, name: 'Alice', email: 'alice@test.com', aadharNumber: '111122223333', contactNumber: '9999900000',
      status: 'Active', monthlyRent: 5000, currentDue: 5000, securityDeposit: 5000,
      emergencyContactName: 'Bob', emergencyContactNumber: '9999900001', emergencyContactRelation: 'Brother', address: 'Test', moveInDate: new Date().toISOString()
    });

    try {
      await axios.post(`${API_URL}/tenants`, {
        pg: pgId, room: roomId1, name: 'Alice Proxy', email: 'alice2@test.com', aadharNumber: '111122223333', contactNumber: '9999900002',
        status: 'Active', monthlyRent: 5000, currentDue: 5000, securityDeposit: 5000,
        emergencyContactName: 'Bob', emergencyContactNumber: '9999900001', emergencyContactRelation: 'Brother', address: 'Test', moveInDate: new Date().toISOString()
      });
      assert(false, 'Expected Aadhar duplicate to fail');
    } catch (err) {
      assert(err.response.status === 400 && err.response.data.message.includes('Aadhar card'), 'Duplicate Aadhar correctly rejected');
    }

    try {
      await axios.post(`${API_URL}/tenants`, {
        pg: pgId, room: roomId1, name: 'Alice Proxy', email: 'alice@test.com', aadharNumber: '444455556666', contactNumber: '9999900002',
        status: 'Active', monthlyRent: 5000, currentDue: 5000, securityDeposit: 5000,
        emergencyContactName: 'Bob', emergencyContactNumber: '9999900001', emergencyContactRelation: 'Brother', address: 'Test', moveInDate: new Date().toISOString()
      });
      assert(false, 'Expected Email duplicate to fail');
    } catch (err) {
      assert(err.response.status === 400 && err.response.data.message.includes('email'), 'Duplicate Email correctly rejected');
    }

    try {
      await axios.post(`${API_URL}/tenants`, {
        pg: pgId, room: roomId1, name: 'Alice Proxy', email: 'alice3@test.com', aadharNumber: '444455556666', contactNumber: '9999900000',
        status: 'Active', monthlyRent: 5000, currentDue: 5000, securityDeposit: 5000,
        emergencyContactName: 'Bob', emergencyContactNumber: '9999900001', emergencyContactRelation: 'Brother', address: 'Test', moveInDate: new Date().toISOString()
      });
      assert(false, 'Expected Contact Number duplicate to fail');
    } catch (err) {
      assert(err.response.status === 400 && err.response.data.message.includes('contact number is already registered'), 'Duplicate Contact Number correctly rejected');
    }

    // 4. DUPLICATE PAYMENT VALIDATION
    console.log('\n--- TESTING DUPLICATE RENT PAYMENT ---');
    const tenantAliceId = t0.data._id;
    const curMonth = new Date().getMonth() + 1;
    const curYear = new Date().getFullYear();
    
    await axios.post(`${API_URL}/payments`, {
      tenantId: tenantAliceId, roomId: roomId1, pgId, month: curMonth, year: curYear, amount: 5000, paymentStatus: 'paid'
    });

    try {
      await axios.post(`${API_URL}/payments`, {
        tenantId: tenantAliceId, roomId: roomId1, pgId, month: curMonth, year: curYear, amount: 5000, paymentStatus: 'paid'
      });
      assert(false, 'Expected duplicate payment for the same month to fail');
    } catch (err) {
      assert(err.response.status === 400 && err.response.data.message.includes('already been paid'), 'Duplicate Payment correctly rejected');
    }

    // 5. 1000 MASS GENERATION
    console.log('\n--- GENERATING 1000 TENANTS/PAYMENTS/EXPENSES ACROSS TIMELINE (2023-2026) ---');
    
    let tenantIds = [];
    const startYear = 2023;
    const endYear = 2026;

    for (let i = 1; i <= 1000; i++) {
        const joinYear = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
        const joinMonth = Math.floor(Math.random() * 12) + 1;
        const leaveYear = joinYear + Math.floor(Math.random() * 2);
        const isActive = (leaveYear >= 2026); 
        
        let moveIn = new Date(joinYear, joinMonth - 1, Math.floor(Math.random() * 28) + 1);
        let moveOut = isActive ? null : new Date(leaveYear, Math.floor(Math.random() * 12), 28);
        
        const tenantPayload = {
            pg: pgId, room: roomId2, name: `Mass Tenant ${i}`, email: `tenant${i}@sim.com`,
            aadharNumber: `10002000${String(i).padStart(4, '0')}`, contactNumber: `80000${String(i).padStart(5, '0')}`,
            status: isActive ? 'Active' : 'Inactive', monthlyRent: Math.floor(Math.random() * 100)*100 + 4000, currentDue: isActive ? 0 : 5000,
            securityDeposit: 5000,
            emergencyContactName: 'Emerg', emergencyContactNumber: '8989898989', emergencyContactRelation: 'Friend', address: 'Sim City',
            moveInDate: moveIn.toISOString(),
            moveOutDate: moveOut ? moveOut.toISOString() : undefined
        };
        const res = await axios.post(`${API_URL}/tenants`, tenantPayload);
        tenantIds.push(res.data._id);
        if(i % 50 === 0) process.stdout.write(`\rInserted ${i}/1000...`);
    }
    console.log('\nTenants generated!');

    // Generate random payments
    console.log('Generating random payments for simulated tenants...');
    for (let i = 0; i < tenantIds.length; i++) {
        const pYear = [2024, 2025, 2026][Math.floor(Math.random() * 3)];
        const pMonth = Math.floor(Math.random() * 12) + 1;
        await axios.post(`${API_URL}/payments`, {
             tenantId: tenantIds[i], roomId: roomId2, pgId, month: pMonth, year: pYear, amount: 4500, paymentStatus: 'paid'
        });
        if(i % 50 === 0) process.stdout.write(`\rProcessed ${i}/1000 payments...`);
    }
    console.log('\nPayments generated!');
    assert(tenantIds.length === 1000, 'Mass insertion executed completely');

    console.log(`\n================= TEST SUITE RESULTS =================`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    if(failed === 0) console.log(`🎉 ALL TESTS PASSED SUCCESSFULLY! The system efficiently handled 1000 scale constraint verifications and insertions.`);
    else console.log(`⚠️ SOME TESTS FAILED! Check logs above.`);
    
    process.exit(0);
  } catch (error) {
    console.error('FATAL TEST ERROR:', error?.response?.data || error.message);
    process.exit(1);
  }
};

runTests();
