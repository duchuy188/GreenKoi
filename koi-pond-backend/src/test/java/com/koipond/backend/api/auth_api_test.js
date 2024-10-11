Feature('Auth API');

let registeredUser;

Scenario('test registration and login', async ({ I }) => {
  // Đăng ký người dùng mới
  const uniqueUsername = 'newuser' + Date.now(); // Tạo username duy nhất
  registeredUser = {
    username: uniqueUsername,
    email: `${uniqueUsername}@example.com`,
    password: 'password123',
    fullName: 'New User',
    phone: '1234567890',
    address: '123 New Street'
  };

  let response = await I.sendPostRequest('/auth/register', registeredUser);
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({
    username: registeredUser.username
  });

  // Đăng nhập với tài khoản vừa đăng ký
  const credentials = {
    username: registeredUser.username,
    password: registeredUser.password
  };

  response = await I.sendPostRequest('/auth/login', credentials);
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({
    username: credentials.username
  });
  // Thay thế dòng này:
  // I.seeResponseJsonMatchesJsonPath('$.token');
  // bằng:
  I.seeResponseContainsKeys(['token']);
});

Scenario('test successful registration and login', async ({ I }) => {
  // Giữ nguyên test case hiện tại
  // ...
});

Scenario('test registration with existing username', async ({ I }) => {
  const existingUser = {
    username: 'existinguser' + Date.now(),
    email: `existinguser${Date.now()}@example.com`,
    password: 'password123',
    fullName: 'Existing User',
    phone: '1234567890',
    address: '123 Existing Street'
  };

  // Đăng ký user lần đầu
  await I.sendPostRequest('/auth/register', existingUser);
  I.seeResponseCodeIs(200);

  // Thử đăng ký lại với cùng username và email
  let response = await I.sendPostRequest('/auth/register', existingUser);
  I.seeResponseCodeIs(409); // Conflict
  
  // In ra response để debug
  console.log('Response:', response);

  // Kiểm tra nội dung response
  I.seeResponseEquals('Email already exists');
});

Scenario('test login with incorrect password', async ({ I }) => {
  const user = {
    username: 'testuser' + Date.now(),
    email: `testuser${Date.now()}@example.com`,
    password: 'correctpassword',
    fullName: 'Test User',
    phone: '1234567890',
    address: '123 Test Street'
  };

  // Đăng ký user
  await I.sendPostRequest('/auth/register', user);
  I.seeResponseCodeIs(200);

  // Thử đăng nhập với mật khẩu sai
  const incorrectCredentials = {
    username: user.username,
    password: 'wrongpassword'
  };

  let response = await I.sendPostRequest('/auth/login', incorrectCredentials);
  I.seeResponseCodeIs(401); // Unauthorized
  I.seeResponseContainsJson({ message: 'Authentication failed: Incorrect password' });
});

Scenario('test logout', async ({ I }) => {
  const user = {
    username: 'logoutuser' + Date.now(),
    email: `logoutuser${Date.now()}@example.com`,
    password: 'password123',
    fullName: 'Logout User',
    phone: '1234567890',
    address: '123 Logout Street'
  };

  // Đăng ký user
  await I.sendPostRequest('/auth/register', user);
  I.seeResponseCodeIs(200);

  // Đăng nhập
  const response = await I.sendPostRequest('/auth/login', {
    username: user.username,
    password: user.password
  });
  I.seeResponseCodeIs(200);
  let token = response.data.token;

  // Test đăng xuất
  const logoutResponse = await I.sendPostRequest('/auth/logout', {}, {
    'Authorization': `Bearer ${token}`
  });
  I.seeResponseCodeIs(200);
  
  // Kiểm tra nội dung phản hồi
  I.seeResponseEquals('Logged out successfully');
});
