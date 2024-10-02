import axios from "axios";
// api swagger
const api = axios.create({
  baseURL: "https://dd90-2405-4802-93e3-4ba6-c9b8-10b6-b8d1-599f.ngrok-free.app",//url 
});
// 
const handleBefore = (config) => {
  const token = localStorage.getItem("token")?.replaceAll('"', "");
  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
};

const handleError = (error) => {
  console.log(error);
};

api.interceptors.request.use(handleBefore, handleError);

export default api;