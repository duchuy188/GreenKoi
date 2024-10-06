import axios from "axios";
// api swagger
const api = axios.create({
  baseURL: "https://b6d2-2405-4802-7a15-b220-c804-d76b-68f7-854a.ngrok-free.app",//url 
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