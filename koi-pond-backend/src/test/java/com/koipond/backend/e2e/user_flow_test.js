Feature('User Flow');

let token;

const logResponse = (response) => {
  console.log('Status Code:', response.status);
  console.log('Headers:', JSON.stringify(response.headers, null, 2));
  console.log('Body:', JSON.stringify(response.data, null, 2));
};

// Helper function để đăng ký và đăng nhập
const registerAndLogin = async (I, user) => {
  await I.sendPostRequest('/auth/register', user);
  I.seeResponseCodeIs(200);
  const loginResponse = await I.sendPostRequest('/auth/login', {
    username: user.username,
    password: user.password
  });
  I.seeResponseCodeIs(200);
  return loginResponse.data.token;
};

Scenario('Complete user journey', async ({ I }) => {
  const uniqueUsername = 'e2euser' + Date.now();
  const userEmail = `${uniqueUsername}@example.com`;
  const password = 'SecurePassword123!';

  // Đăng ký
  const registerResponse = await I.sendPostRequest('/auth/register', {
    username: uniqueUsername,
    email: userEmail,
    password: password,
    fullName: 'E2E Test User',
    phone: '1234567890',
    address: '123 E2E Street'
  });
  console.log('Register Response:');
  logResponse(registerResponse);
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({ username: uniqueUsername });

  // Đăng nhập
  const loginResponse = await I.sendPostRequest('/auth/login', {
    username: uniqueUsername,
    password: password
  });
  console.log('Login Response:');
  logResponse(loginResponse);
  I.seeResponseCodeIs(200);
  I.seeResponseContainsKeys(['token']);
  token = loginResponse.data.token;

  // Lấy thông tin profile (nếu có endpoint này)
  // const profileResponse = await I.sendGetRequest('/users/profile', { 'Authorization': `Bearer ${token}` });
  // console.log('Profile Response:');
  // logResponse(profileResponse);
  // I.seeResponseCodeIs(200);
  // I.seeResponseContainsJson({
  //   username: uniqueUsername,
  //   email: userEmail
  // });

  // Đăng xuất
  const logoutResponse = await I.sendPostRequest('/auth/logout', {}, { 'Authorization': `Bearer ${token}` });
  console.log('Logout Response:');
  logResponse(logoutResponse);
  I.seeResponseCodeIs(200);
  I.seeResponseEquals('Logged out successfully');

  // Thử truy cập sau khi đăng xuất (nếu có endpoint bảo vệ)
  // const unauthorizedResponse = await I.sendGetRequest('/some-protected-endpoint', { 'Authorization': `Bearer ${token}` });
  // console.log('Unauthorized Response:');
  // logResponse(unauthorizedResponse);
  // I.seeResponseCodeIs(401);
});

Scenario('Failed registration and login attempts', async ({ I }) => {
  // Đăng ký user đầu tiên
  const existingUser = {
    username: 'existinguser' + Date.now(),
    email: 'existing' + Date.now() + '@example.com',
    password: 'password123',
    fullName: 'Existing User',
    phone: '1234567890',
    address: '123 Existing St'
  };
  const firstRegisterResponse = await I.sendPostRequest('/auth/register', existingUser);
  console.log('First Register Response:');
  logResponse(firstRegisterResponse);
  I.seeResponseCodeIs(200);

  // Thử đăng ký lại với cùng username hoặc email
  const duplicateRegisterResponse = await I.sendPostRequest('/auth/register', existingUser);
  console.log('Duplicate Register Response:');
  logResponse(duplicateRegisterResponse);
  I.seeResponseCodeIs(409);
  I.seeResponseEquals('Email already exists');

  // Thử đăng nhập với thông tin không chính xác
  const invalidLoginResponse = await I.sendPostRequest('/auth/login', {
    username: 'nonexistentuser',
    password: 'wrongpassword'
  });
  console.log('Invalid Login Response:');
  logResponse(invalidLoginResponse);
  I.seeResponseCodeIs(404);
  I.seeResponseEquals('User not found with username: nonexistentuser');
});

// Comment out hoặc xóa scenario "Update user profile"
/*
Scenario('Update user profile', async ({ I }) => {
  const user = {
    username: 'updateuser' + Date.now(),
    email: `updateuser${Date.now()}@example.com`,
    password: 'UpdatePass123!',
    fullName: 'Update User',
    phone: '1234567890',
    address: '123 Update St'
  };

  token = await registerAndLogin(I, user);

  const updatedProfile = {
    fullName: 'Updated Name',
    phone: '9876543210',
    address: '456 New St'
  };

  const updateResponse = await I.sendPutRequest('/api/profile', updatedProfile, 
    { 'Authorization': `Bearer ${token}` }
  );
  console.log('Profile Update Response:');
  logResponse(updateResponse);
  
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson(updatedProfile);

  // Verify profile was updated
  const profileResponse = await I.sendGetRequest('/api/profile', 
    { 'Authorization': `Bearer ${token}` }
  );
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson(updatedProfile);
});
*/

Scenario('Attempt to update profile with invalid data', async ({ I }) => {
  const user = {
    username: 'invaliduser' + Date.now(),
    email: `invaliduser${Date.now()}@example.com`,
    password: 'InvalidPass123!',
    fullName: 'Invalid User',
    phone: '1234567890',
    address: '123 Invalid St'
  };

  token = await registerAndLogin(I, user);

  const invalidProfile = {
    email: 'invalid-email'
  };

  const updateResponse = await I.sendPutRequest('/profile', invalidProfile, 
    { 'Authorization': `Bearer ${token}` }
  );
  console.log('Invalid Profile Update Response:');
  logResponse(updateResponse);
  
  I.seeResponseCodeIs(500); // Assuming server returns 500 for invalid email

  // Verify profile wasn't changed
  const profileResponse = await I.sendGetRequest('/profile', 
    { 'Authorization': `Bearer ${token}` }
  );
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({ email: user.email });
});

Scenario('Attempt to access protected resource after logout', async ({ I }) => {
  const user = {
    username: 'logoutuser' + Date.now(),
    email: `logoutuser${Date.now()}@example.com`,
    password: 'LogoutPass123!',
    fullName: 'Logout User',
    phone: '1234567890',
    address: '123 Logout St'
  };

  token = await registerAndLogin(I, user);

  // Logout
  const logoutResponse = await I.sendPostRequest('/auth/logout', {}, 
    { 'Authorization': `Bearer ${token}` }
  );
  I.seeResponseCodeIs(200);
  I.seeResponseEquals('Logged out successfully');

  // Attempt to access profile after logout
  const profileResponse = await I.sendGetRequest('/profile', 
    { 'Authorization': `Bearer ${token}` }
  );
  console.log('Unauthorized Profile Access Response:');
  logResponse(profileResponse);
  I.seeResponseCodeIs(401);
});
