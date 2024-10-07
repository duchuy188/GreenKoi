import axios from "axios";
// api swagger
const api = axios.create({
  baseURL: "https://3872-2405-4802-7a15-b220-f1df-b5ed-4cfc-cdc5.ngrok-free.app",//url 
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