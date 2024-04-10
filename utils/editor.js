// 富文本编辑器
const {createEditor, createToolbar} = window.wangEditor   // 创建编辑器函数，创建工具栏函数

// 编辑器的配置对象
const editorConfig = {
  placeholder: '发布文章的内容',  // 占位提示文字
  // 编辑器变化时的回调函数
  onChange(editor) {
    // 获取富文本的内容
    const html = editor.getHtml()
    // 也可以同步到 <textarea>
    // 为了后续快速收集表单内容做准备
    document.querySelector('.publish-content').value = html
  }
}

// 创建编辑器
const editor = createEditor({
  // 在html结构中的创建位置
  selector: '#editor-container',
  // 默认内容
  html: '<p><br></p>',
  // 配置项
  config: editorConfig,
  // 配置集成模式（default 全部）（simple 简洁）
  mode: 'default', // or 'simple'
})

// 工具栏配置对象
const toolbarConfig = {}

// 创建工具栏
const toolbar = createToolbar({
  // 为指定的编辑器创建工具栏
  editor,
  // 工具栏在html结构中创建的位置
  selector: '#toolbar-container',
  // 工具栏配置对象
  config: toolbarConfig,
  // 配置集成模式（default 全部）（simple 简洁）
  mode: 'default', // or 'simple'
})
