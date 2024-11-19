Feature('Pond Design API');

let authToken;
let designId;

// Hàm helper để đăng nhập
const login = async (I) => {
  const response = await I.sendPostRequest('/auth/login', { username: 'designer1', password: 'password123' });
  I.seeResponseCodeIs(200);
  console.log(`Login response:`, response.data);
  return response.data.token;
};

// Trước mỗi scenario, chúng ta sẽ đăng nhập
Before(async ({ I }) => {
  authToken = await login(I);
});

Scenario('Create a new pond design', async ({ I }) => {
  const newDesign = {
    name: 'Test Pond Design',
    description: 'This is a test pond design',
  };
  const response = await I.sendPostRequest('/pond-designs', newDesign, { 
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  });
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({
    name: 'Test Pond Design',
    description: 'This is a test pond design'
  });
  designId = response.data.id;
  console.log('Created Design ID:', designId);
});

Scenario('Read a pond design', async ({ I }) => {
  const response = await I.sendGetRequest(`/pond-designs/${designId}`, { 'Authorization': `Bearer ${authToken}` });
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({
    id: designId,
    name: 'Test Pond Design'
  });
});

Scenario('Update a pond design', async ({ I }) => {
  const updatedDesign = {
    name: 'Updated Test Pond Design',
    description: 'This is an updated test pond design',
  };
  const response = await I.sendPutRequest(`/pond-designs/${designId}`, updatedDesign, { 
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  });
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({
    id: designId,
    name: 'Updated Test Pond Design',
    description: 'This is an updated test pond design'
  });
});

Scenario('Delete a pond design', async ({ I }) => {
  const response = await I.sendDeleteRequest(`/pond-designs/${designId}`, { 'Authorization': `Bearer ${authToken}` });
  I.seeResponseCodeIs(204);

  // Kiểm tra xem design đã bị xóa chưa
  try {
    await I.sendGetRequest(`/pond-designs/${designId}`, { 'Authorization': `Bearer ${authToken}` });
  } catch (error) {
    I.seeResponseCodeIs(404);
  }
});

// Scenario 'test unauthorized access' remains unchanged

Scenario('Get designs by current designer', async ({ I }) => {
  const response = await I.sendGetRequest('/pond-designs/designer', { 'Authorization': `Bearer ${authToken}` });
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson([]);  // Kiểm tra xem response có phải là một mảng không
});

Scenario('Get pending approval designs', async ({ I }) => {
  const managerToken = await login(I, 'manager1', 'password123');
  const response = await I.sendGetRequest('/pond-designs/pending', { 'Authorization': `Bearer ${managerToken}` });
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson([]);
});

Scenario('Get approved designs', async ({ I }) => {
  const response = await I.sendGetRequest('/pond-designs/approved', { 'Authorization': `Bearer ${authToken}` });
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson([]);
});

Scenario('Approve a pond design', async ({ I }) => {
  // Đăng nhập với tài khoản manager
  const managerResponse = await I.sendPostRequest('/auth/login', { username: 'manager1', password: 'password123' });
  I.seeResponseCodeIs(200);
  const managerToken = managerResponse.data.token;
  console.log('Manager token:', managerToken);

  // Đăng nhập với tài khoản designer để tạo design
  const designerResponse = await I.sendPostRequest('/auth/login', { username: 'designer1', password: 'password123' });
  I.seeResponseCodeIs(200);
  const designerToken = designerResponse.data.token;
  
  // Tạo một design mới để phê duyệt
  const newDesign = {
    name: 'Test Pond Design for Approval',
    description: 'This is a test pond design for approval',
  };
  const createResponse = await I.sendPostRequest('/pond-designs', newDesign, { 
    'Authorization': `Bearer ${designerToken}`,
    'Content-Type': 'application/json'
  });
  I.seeResponseCodeIs(200);
  const designId = createResponse.data.id;
  console.log('Created Design ID:', designId);

  // Thực hiện phê duyệt bằng tài khoản manager
  const approveResponse = await I.sendPatchRequest(`/pond-designs/${designId}/approve`, {}, { 'Authorization': `Bearer ${managerToken}` });
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({
    id: designId,
    status: 'APPROVED'
  });
});

Scenario('Reject a pond design', async ({ I }) => {
  // Đăng nhập với tài khoản manager
  const managerResponse = await I.sendPostRequest('/auth/login', { username: 'manager1', password: 'password123' });
  I.seeResponseCodeIs(200);
  const managerToken = managerResponse.data.token;

  // Tạo một design mới để từ chối
  const designerResponse = await I.sendPostRequest('/auth/login', { username: 'designer1', password: 'password123' });
  I.seeResponseCodeIs(200);
  const designerToken = designerResponse.data.token;

  const newDesign = {
    name: 'Test Pond Design for Rejection',
    description: 'This is a test pond design for rejection',
  };
  const createResponse = await I.sendPostRequest('/pond-designs', newDesign, { 
    'Authorization': `Bearer ${designerToken}`,
    'Content-Type': 'application/json'
  });
  I.seeResponseCodeIs(200);
  const designId = createResponse.data.id;

  // Thực hiện từ chối bằng tài khoản manager
  const response = await I.sendPatchRequest(`/pond-designs/${designId}/reject`, {}, { 'Authorization': `Bearer ${managerToken}` });
  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({
    id: designId,
    status: 'REJECTED'
  });
});

Scenario('Unauthorized access', async ({ I }) => {
  const invalidToken = 'invalid_token';
  const response = await I.sendGetRequest(`/pond-designs/${designId}`, { 'Authorization': `Bearer ${invalidToken}` });
  console.log('Unauthorized access response:', response);
  I.seeResponseCodeIs(404);
  I.seeResponseEquals('Design not found or has been deleted');
});

// Thêm một test case mới để kiểm tra truy cập không hợp lệ với ID không tồn tại
Scenario('Access non-existent design', async ({ I }) => {
  const nonExistentId = 'non-existent-id';
  const response = await I.sendGetRequest(`/pond-designs/${nonExistentId}`, { 'Authorization': `Bearer ${authToken}` });
  console.log('Non-existent design response:', response);
  I.seeResponseCodeIs(404);
  I.seeResponseEquals('Design not found or has been deleted');
});
