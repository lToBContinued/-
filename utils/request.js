// axios 公共配置
// 基地址
axios.defaults.baseURL = 'https://geek.itheima.net'

// axios 请求拦截器
axios.interceptors.request.use(function (config) {
  // Do something before response is sent
  // 同意携带token令牌字符串在请求头上
  const token = localStorage.getItem('token')
  token && (config.headers.Authorization = `Bearer ${token}`)
  return config;
}, function (error) {
  // Do something with response error
  return Promise.reject(error);
});

// axios 响应拦截器
axios.interceptors.response.use(response => {
  // Do something before response is sent，例如：直接返回服务器的响应结果对象
  // 2xx 范围内的状态码都会触发该函数。
  return response.data;
}, error => {
  // Do something with response error，例如：统一对身份验证失败情况做出处理
  // 超出 2xx 范围的状态码都会触发该函数。
  console.dir(error)
  if (error?.response?.status === 401) {
    alert('身份验证失败，请重新登录')
    localStorage.clear()  // 清空本地存储的token
    location.href = '../login/index.html'   // 返回登录页
  }
  return Promise.reject(error);
});