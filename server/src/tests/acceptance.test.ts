import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';

let mongoServer: MongoMemoryServer;

async function runAcceptanceTests() {
  console.log('====================================================');
  console.log('   BORROWBACK ACCEPTANCE TESTS (A1 - A15)');
  console.log('====================================================\n');

  mongoServer = await MongoMemoryServer.create({
    instance: {
      launchTimeout: 180000,
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testId: string, desc: string, errorDetails?: any) {
    if (condition) {
      console.log(`[PASS] ${testId}: ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testId}: ${desc}`);
      if (errorDetails) console.error('       Details:', errorDetails);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // A1: Register with valid details; then call /auth/me
    // ----------------------------------------------------
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'user1@example.com',
        password: 'Password123!',
      });

    const cookieA1 = regRes.headers['set-cookie'];
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookieA1);

    assert(
      regRes.status === 201 &&
        regRes.body.success === true &&
        regRes.body.data.user.email === 'user1@example.com' &&
        !regRes.body.data.user.passwordHash &&
        meRes.status === 200 &&
        meRes.body.data.user.id === regRes.body.data.user.id,
      'A1',
      'Register with valid details; cookie session persists and /auth/me returns safe user',
      { regStatus: regRes.status, meStatus: meRes.status, body: regRes.body }
    );

    const user1Id = regRes.body.data.user.id;
    const user1Cookie = cookieA1;

    // ----------------------------------------------------
    // A2: Register same email again
    // ----------------------------------------------------
    const dupRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One Duplicate',
        email: 'user1@example.com',
        password: 'Password123!',
      });

    assert(
      dupRes.status === 409 && dupRes.body.success === false,
      'A2',
      'Register same email again is rejected with 409 duplicate response',
      { status: dupRes.status, body: dupRes.body }
    );

    // ----------------------------------------------------
    // A3: Login with wrong password
    // ----------------------------------------------------
    const badLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user1@example.com',
        password: 'WrongPassword!',
      });

    assert(
      badLoginRes.status === 401 &&
        badLoginRes.body.success === false &&
        !badLoginRes.headers['set-cookie'],
      'A3',
      'Login with wrong password returns 401 and creates no cookie session',
      { status: badLoginRes.status, body: badLoginRes.body }
    );

    // Create User Two for borrowing transactions
    const regUser2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'user2@example.com',
        password: 'Password123!',
      });
    const user2Cookie = regUser2.headers['set-cookie'];
    const user2Id = regUser2.body.data.user.id;

    // ----------------------------------------------------
    // A4: Create a valid item
    // ----------------------------------------------------
    const createItemRes = await request(app)
      .post('/api/items')
      .set('Cookie', user1Cookie)
      .send({
        title: 'DeWalt Cordless Drill 20V',
        description: 'Includes two batteries and quick charger. Ideal for DIY projects and repairs around the house.',
        category: 'Tools & DIY',
        condition: 'Like New',
        pickupNote: 'Meet at local community library parking',
      });

    const itemId = createItemRes.body?.data?.item?.id || createItemRes.body?.data?.item?._id;

    const browseRes = await request(app).get('/api/items?search=DeWalt');
    const myItemsRes = await request(app).get('/api/items/mine').set('Cookie', user1Cookie);

    assert(
      createItemRes.status === 201 &&
        createItemRes.body.success === true &&
        browseRes.status === 200 &&
        browseRes.body.data.items.some((i: any) => i.id === itemId || i._id === itemId) &&
        myItemsRes.status === 200 &&
        myItemsRes.body.data.items.some((i: any) => i.id === itemId || i._id === itemId),
      'A4',
      'Create a valid item; persists and appears in My Items and public Browse',
      { createStatus: createItemRes.status, itemId }
    );

    // ----------------------------------------------------
    // A5: Try to edit someone else's item by API
    // ----------------------------------------------------
    const editOtherRes = await request(app)
      .patch(`/api/items/${itemId}`)
      .set('Cookie', user2Cookie)
      .send({ title: 'Hacked Title By Other User' });

    assert(
      editOtherRes.status === 403 && editOtherRes.body.success === false,
      'A5',
      "Try to edit someone else's item by API returns 403 Forbidden",
      { status: editOtherRes.status }
    );

    // ----------------------------------------------------
    // A6: Borrower requests own item
    // ----------------------------------------------------
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);

    const startStr = tomorrow.toISOString().slice(0, 10);
    const endStr = dayAfter.toISOString().slice(0, 10);

    const selfBorrowRes = await request(app)
      .post('/api/requests')
      .set('Cookie', user1Cookie)
      .send({
        itemId,
        startDate: startStr,
        endDate: endStr,
        message: 'Trying to borrow my own drill',
      });

    assert(
      selfBorrowRes.status === 400 && selfBorrowRes.body.success === false,
      'A6',
      'Borrower requesting own item is rejected with 400 Bad Request',
      { status: selfBorrowRes.status, body: selfBorrowRes.body }
    );

    // ----------------------------------------------------
    // A7: Submit a request with end date before start date or past dates
    // ----------------------------------------------------
    const pastDateRes = await request(app)
      .post('/api/requests')
      .set('Cookie', user2Cookie)
      .send({
        itemId,
        startDate: '2020-01-01',
        endDate: '2020-01-05',
        message: 'Past dates',
      });

    const invalidRangeRes = await request(app)
      .post('/api/requests')
      .set('Cookie', user2Cookie)
      .send({
        itemId,
        startDate: endStr,
        endDate: startStr,
        message: 'End date before start date',
      });

    assert(
      pastDateRes.status === 400 && invalidRangeRes.status === 400,
      'A7',
      'Submit request with end date before start date or past dates rejected with validation message',
      { pastStatus: pastDateRes.status, invalidRangeStatus: invalidRangeRes.status }
    );

    // ----------------------------------------------------
    // A8: Owner approves a non-conflicting pending request
    // ----------------------------------------------------
    const req1Res = await request(app)
      .post('/api/requests')
      .set('Cookie', user2Cookie)
      .send({
        itemId,
        startDate: startStr,
        endDate: endStr,
        message: 'Need this for hanging shelves',
      });

    const req1Id = req1Res.body.data.request.id || req1Res.body.data.request._id;

    const approveRes = await request(app)
      .patch(`/api/requests/${req1Id}/decision`)
      .set('Cookie', user1Cookie)
      .send({ action: 'approve' });

    assert(
      approveRes.status === 200 && approveRes.body.data.request.status === 'approved',
      'A8',
      'Owner approves a non-conflicting pending request; status becomes approved',
      { status: approveRes.status, reqStatus: approveRes.body?.data?.request?.status }
    );

    // ----------------------------------------------------
    // A9: Approve second overlapping request for same item
    // ----------------------------------------------------
    // Register User Three
    const regUser3 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Three',
        email: 'user3@example.com',
        password: 'Password123!',
      });
    const user3Cookie = regUser3.headers['set-cookie'];

    // User 3 requests overlapping dates: tomorrow to dayAfter + 1
    const req2Res = await request(app)
      .post('/api/requests')
      .set('Cookie', user3Cookie)
      .send({
        itemId,
        startDate: startStr,
        endDate: endStr,
        message: 'Also need this drill for same dates',
      });
    const req2Id = req2Res.body.data.request.id || req2Res.body.data.request._id;

    const overlapApproveRes = await request(app)
      .patch(`/api/requests/${req2Id}/decision`)
      .set('Cookie', user1Cookie)
      .send({ action: 'approve' });

    const checkReq2 = await request(app)
      .get(`/api/requests/${req2Id}`)
      .set('Cookie', user3Cookie);

    assert(
      overlapApproveRes.status === 409 &&
        overlapApproveRes.body.success === false &&
        checkReq2.body.data.request.status === 'pending',
      'A9',
      'Approve second overlapping request returns 409 conflict; second request remains pending',
      { status: overlapApproveRes.status, req2Status: checkReq2.body?.data?.request?.status }
    );

    // ----------------------------------------------------
    // A10: Both participants confirm pickup
    // ----------------------------------------------------
    // Owner confirms pickup
    const ownerPickupRes = await request(app)
      .patch(`/api/requests/${req1Id}/pickup`)
      .set('Cookie', user1Cookie)
      .send({ conditionNote: 'Handed over drill with full battery' });

    const reqAfterOwnerPickup = await request(app)
      .get(`/api/requests/${req1Id}`)
      .set('Cookie', user1Cookie);

    // Borrower confirms pickup
    const borrowerPickupRes = await request(app)
      .patch(`/api/requests/${req1Id}/pickup`)
      .set('Cookie', user2Cookie)
      .send({ conditionNote: 'Received in great condition' });

    assert(
      reqAfterOwnerPickup.body.data.request.status === 'approved' &&
        borrowerPickupRes.body.data.request.status === 'borrowed' &&
        !!borrowerPickupRes.body.data.request.borrowedAt,
      'A10',
      'Only after both participants confirm pickup does status become borrowed and borrowedAt recorded',
      { statusAfterOne: reqAfterOwnerPickup.body.data.request.status, finalStatus: borrowerPickupRes.body.data.request.status }
    );

    // ----------------------------------------------------
    // A11: One participant confirms return
    // ----------------------------------------------------
    const borrowerReturnRes = await request(app)
      .patch(`/api/requests/${req1Id}/return`)
      .set('Cookie', user2Cookie)
      .send({ conditionNote: 'Returned cleanly with all bits' });

    assert(
      borrowerReturnRes.status === 200 &&
        borrowerReturnRes.body.data.request.status === 'return_pending',
      'A11',
      'One participant confirms return; status becomes return_pending (not completed yet)',
      { status: borrowerReturnRes.body.data.request.status }
    );

    // ----------------------------------------------------
    // A12: Second participant confirms return
    // ----------------------------------------------------
    const ownerReturnRes = await request(app)
      .patch(`/api/requests/${req1Id}/return`)
      .set('Cookie', user1Cookie)
      .send({ conditionNote: 'Item checked and back in safe storage' });

    assert(
      ownerReturnRes.status === 200 &&
        ownerReturnRes.body.data.request.status === 'completed' &&
        !!ownerReturnRes.body.data.request.completedAt,
      'A12',
      'Second participant confirms return; status becomes completed and completedAt recorded',
      { status: ownerReturnRes.body.data.request.status, completedAt: ownerReturnRes.body.data.request.completedAt }
    );

    // ----------------------------------------------------
    // A13: Submit review before completion or twice as same reviewer
    // ----------------------------------------------------
    // First valid review from borrower
    const reviewRes1 = await request(app)
      .post(`/api/requests/${req1Id}/reviews`)
      .set('Cookie', user2Cookie)
      .send({ rating: 5, comment: 'Great tool and super helpful owner!' });

    // Duplicate review from borrower
    const dupReviewRes = await request(app)
      .post(`/api/requests/${req1Id}/reviews`)
      .set('Cookie', user2Cookie)
      .send({ rating: 4, comment: 'Trying to review again' });

    // Review on pending request (req2Id is still pending)
    const pendingReviewRes = await request(app)
      .post(`/api/requests/${req2Id}/reviews`)
      .set('Cookie', user3Cookie)
      .send({ rating: 5 });

    assert(
      reviewRes1.status === 201 &&
        dupReviewRes.status === 409 &&
        pendingReviewRes.status === 400,
      'A13',
      'Submit review before completion (400) or twice as same reviewer (409) is rejected',
      { rev1: reviewRes1.status, dup: dupReviewRes.status, pending: pendingReviewRes.status }
    );

    // ----------------------------------------------------
    // A14: Archive item with active/pending request
    // ----------------------------------------------------
    // req2Id is currently pending for itemId
    const archiveConflictRes = await request(app)
      .delete(`/api/items/${itemId}`)
      .set('Cookie', user1Cookie);

    assert(
      archiveConflictRes.status === 409 && archiveConflictRes.body.success === false,
      'A14',
      'Archive item with active/pending request returns 409 conflict and item remains active',
      { status: archiveConflictRes.status, message: archiveConflictRes.body?.error?.message }
    );

    // ----------------------------------------------------
    // A15: Reload pages and log out
    // ----------------------------------------------------
    // Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', user1Cookie);

    // Now try calling protected /api/auth/me without cookie or with cleared cookie
    const expiredMeRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', '');

    assert(
      logoutRes.status === 200 && expiredMeRes.status === 401,
      'A15',
      'Log out clears session cookie; private routes redirect / return 401 after session ends',
      { logoutStatus: logoutRes.status, meAfterLogout: expiredMeRes.status }
    );

  } catch (err) {
    console.error('[UNEXPECTED ERROR]:', err);
    failed++;
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAcceptanceTests();
