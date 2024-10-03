import axios from "axios";
// api swagger
const api = axios.create({
  baseURL: "https://6138-2405-4802-93e3-4ba6-30b3-37c8-78c2-f738.ngrok-free.app",//url 
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