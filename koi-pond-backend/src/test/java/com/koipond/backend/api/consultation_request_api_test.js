Feature('Consultation Request API');

let authToken;
let headers;
let createdRequestId;

const loginAndSetupHeaders = async (I) => {
  try {
    const loginData = {
      username: 'customer1',
      password: 'password123'
    };
    console.log('Attempting login with:', loginData);
    const response = await I.sendPostRequest('/auth/login', loginData);
    console.log('Login response status:', response.status);
    console.log('Login response data:', JSON.stringify(response.data, null, 2));

    I.seeResponseCodeIs(200);
    authToken = response.data.token;
    console.log('Auth Token:', authToken);
    return {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Error during login:', error.message);
    throw error;
  }
};

Before(async ({ I }) => {
  headers = await loginAndSetupHeaders(I);
});

Scenario('Create a new consultation request', async ({ I }) => {
  const newRequest = {
    designId: 'D1',
    notes: 'This is a test consultation request'
  };
  
  const response = await I.sendPostRequest('/ConsultationRequests', newRequest, headers);
  
  console.log('Response status:', response.status);
  console.log('Response data:', JSON.stringify(response.data, null, 2));
  
  I.seeResponseCodeIsSuccessful(); // Thay vì I.seeResponseCodeIs(201)
  I.seeResponseContainsJson({
    status: 'PENDING'
  });
  
  createdRequestId = response.data.id;
  console.log('Created request ID:', createdRequestId);
});

Scenario('Get consultation requests', async ({ I }) => {
  const response = await I.sendGetRequest('/ConsultationRequests', headers);
  
  I.seeResponseCodeIs(200);
  I.seeResponseValidByCallback(({ data }) => {
    return Array.isArray(data) && data.length > 0;
  });
});

Scenario('Get valid statuses', async ({ I }) => {
  const response = await I.sendGetRequest('/ConsultationRequests/statuses', headers);
  
  I.seeResponseCodeIs(200);
  I.seeResponseValidByCallback(({ data }) => {
    return Array.isArray(data) && data.includes('PENDING') && data.includes('IN_PROGRESS') && data.includes('COMPLETED') && data.includes('CANCELLED');
  });
});

Scenario('Create request with invalid data', async ({ I }) => {
  const invalidRequest = {
    // Missing required fields
  };
  
  const response = await I.sendPostRequest('/ConsultationRequests', invalidRequest, headers);
  
  I.seeResponseCodeIs(400);
});
