/**
 * 目标1：设置频道下拉菜单
 *  1.1 获取频道列表数据
 *  1.2 展示到下拉菜单中
 */
async function setChannelList() {
  const res = await axios({url: '/v1_0/channels'})
  // console.log(res.data.channels);
  // 1.2 展示到下拉菜单中
  const htmlStr = res.data.channels.map((item, index) => {
    return `<option value=${index + 1}>${item.name}</option>`
  }).join('')
  document.querySelector('.form-select').innerHTML = '<option value="" selected>请选择文章频道</option>' + htmlStr
}

// 网页运行后，默认调用一次
setChannelList()

/**
 * 目标2：文章封面设置
 *  2.1 准备标签结构和样式
 *  2.2 选择文件并保存在 FormData
 *  2.3 单独上传图片并得到图片 URL 网址
 *  2.4 回显并切换 img 标签展示（隐藏 + 号上传标签）
 */
document.querySelector('.img-file').addEventListener('change', async e => {
  const file = e.target.files[0]
  // 2.2 选择文件并保存在 FormData
  const fd = new FormData()
  fd.append('image', file)
  // 2.3 单独上传图片并得到图片 URL 网址
  const res = await axios({
    url: '/v1_0/upload', method: 'POST', data: fd
  })
  // 2.4 回显并切换 img 标签展示（隐藏 + 号上传标签）
  document.querySelector('.rounded').src = res.data.url
  document.querySelector('.rounded').classList.add('show')
  document.querySelector('.place').classList.add('hide')
})

// 优化：点击img可以重新切换封面
// 思路：img点击 => 用js的方法触发文件选择元素的click事件方法
document.querySelector('.rounded').addEventListener('click', () => {
  document.querySelector('.img-file').click()
})

/**
 * 目标3：发布文章保存
 *  3.1 基于 form-serialize 插件收集表单数据对象
 *  3.2 基于 axios 提交到服务器保存
 *  3.3 调用 Alert 警告框反馈结果给用户
 *  3.4 重置表单并跳转到列表页
 */
document.querySelector('.send').addEventListener('click', async e => {
  console.log(e.target.innerHTML)
  if (e.target.innerHTML !== '发布') return
  // 3.1 基于 form-serialize 插件收集表单数据对象
  const form = document.querySelector('.art-form')
  const data = serialize(form, {hash: true, empty: true})
  // 发布文章的时候不需要id属性，所以可以删除掉（id是为了做后续的编辑使用的）
  delete data.id
  console.log(data)
  // 自己收集封面图片的地址并保存到data对象
  data.cover = {
    type: 1, //封面类型
    images: [document.querySelector('.rounded').src] // 封面图片的url网址
  }
  // 3.2 基于 axios 提交到服务器保存
  try {
    await axios({
      url: '/v1_0/mp/articles', method: 'POST', data: data
    })
    // 3.3 调用 Alert 警告框反馈结果给用户
    myAlert(true, '发布成功')
    // 3.4 重置表单并跳转到列表页
    form.reset()
    // 封面需要手动重置
    document.querySelector('.rounded').src = ''
    document.querySelector('.rounded').classList.remove('show')
    document.querySelector('.place').classList.remove('hide')
    // 富文本编辑器重置
    editor.setHtml('')
    // 跳转页面
    setTimeout(() => {
      location.href = '../content/index.html'
    }, 1500)
  } catch (error) {
    myAlert(false, error.response.data.message)
  }
})

/**
 * 目标4：编辑-回显文章
 *  4.1 页面跳转传参（URL 查询参数方式）
 *  4.2 发布文章页面接收参数判断（共用同一套表单）
 *  4.3 修改标题和按钮文字
 *  4.4 获取文章详情数据并回显表单
 */
// 4.2 发布文章页面接收参数判断（共用同一套表单）
;(function () {
  // 4.2 发布文章页面接收参数判断（共用同一套表单）
  const paramStr = location.search
  // console.log(paramStr)
  // 解析页面参数
  const params = new URLSearchParams(paramStr)
  params.forEach(async (value, key) => {
    // console.log(value, key)
    // 如果有 id 这个名字，则证明当前有要被编辑的文章传入了进来
    if (key === 'id') {
      // 4.3 修改标题和按钮文字
      document.querySelector('.title span').innerHTML = '修改文章'
      document.querySelector('.send').innerHTML = '修改'
      // 4.4 获取文章详情数据并回显表单
      const res = await axios({
        url: `/v1_0/mp/articles/${value}`
      })
      console.log(res)
      // 组织我仅仅需要的数据对象，为后续遍历回显到页面上做铺垫
      const dataObj = {
        channel_id: res.data.channel_id,
        title: res.data.title,
        content: res.data.content,
        rounded: res.data.cover.images[0],   // 封面地址
        id: res.data.id
      }
      // 遍历数据对象属性，映射到页面元素上，快速赋值
      Object.keys(dataObj).forEach(key => {
        if (key === 'rounded') {
          // 封面设置
          if (dataObj[key]) {
            // 有封面
            document.querySelector('.rounded').src = dataObj[key]
            document.querySelector('.rounded').classList.add('show')
            document.querySelector('.place').classList.add('hide')
          }
        } else if (key === 'content') {
          editor.setHtml(dataObj[key])
        } else {
          // 用数据对象的属性名作为 name 属性选择器值来找到标签
          console.log(dataObj[key])
          document.querySelector(`[name=${key}]`).value = dataObj[key]
        }
      })
    }
  })
})()

/**
 * 目标5：编辑-保存文章
 *  5.1 判断按钮文字，区分业务（因为共用一套表单）
 *  5.2 调用编辑文章接口，保存信息到服务器
 *  5.3 基于 Alert 反馈结果消息给用户
 */
document.querySelector('.send').addEventListener('click', async e => {
  // 5.1 判断按钮文字，区分业务（因为共用一套表单）
  if (e.target.innerHTML !== '修改') return
  // 修改文章逻辑
  const form = document.querySelector('.art-form')
  const data = serialize(form, {hash: true, empty: true})
  // 5.2 调用编辑文章接口，保存信息到服务器
  try {
    const res = await axios({
      url: `/v1_0/mp/articles/${data.id}`,
      method: 'PUT',
      data: {
        ...data,
        cover: {
          type: document.querySelector('.rounded').src ? 1 : 0,
          image: [document.querySelector('.rounded').src]
        }
      }
    })
    console.log(res)
    // 5.3 基于 Alert 反馈结果消息给用户
    myAlert(true, '修改成功！')
    location.href = '../content/index.html'
  } catch (error) {
    myAlert(false, error.response.data.message)
  }
})