import axios from "axios";
// api swagger
const api = axios.create({
  baseURL: "https://f985-118-69-182-144.ngrok-free.app",//url 
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