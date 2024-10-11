Feature('Project API');

let managerToken;
let consultantToken;
let customerToken;

// Hàm helper để đăng nhập
const login = async (I, username, password) => {
  try {
    const response = await I.sendPostRequest('/auth/login', { username, password });
    console.log(`Login response for ${username}:`, response);
    if (response.status === 200 && response.data && response.data.token) {
      return response.data.token;
    } else {
      throw new Error(`Login failed for ${username}: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error during login for ${username}:`, error.message);
    throw error;
  }
};

// Trước mỗi scenario, chúng ta sẽ đăng nhập với vai trò cần thiết
Before(async ({ I }) => {
  try {
    managerToken = await login(I, 'manager1', 'password123');
    consultantToken = await login(I, 'consultant1', 'password123');
    customerToken = await login(I, 'customer1', 'password123');
  } catch (error) {
    console.error('Error in Before hook:', error.message);
  }
});

Scenario('Manager gets all projects', async ({ I }) => {
  try {
    const response = await I.sendGetRequest('/projects', { 'Authorization': `Bearer ${managerToken}` });
    console.log('Manager gets all projects response:', response);
    I.seeResponseCodeIs(200);
    I.seeResponseValidByCallback(({ data }) => Array.isArray(data));
  } catch (error) {
    console.error('Error in Manager gets all projects:', error.message);
  }
});

Scenario('Consultant gets their projects', async ({ I }) => {
  try {
    const response = await I.sendGetRequest('/projects/consultant', { 'Authorization': `Bearer ${consultantToken}` });
    console.log('Consultant gets their projects response:', response);
    I.seeResponseCodeIs(200);
    I.seeResponseValidByCallback(({ data }) => Array.isArray(data));
  } catch (error) {
    console.error('Error in Consultant gets their projects:', error.message);
  }
});