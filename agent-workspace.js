// 新建「Agent 03 · 运行工作台」页：克隆开始创作页外壳，重建主内容为三栏工作台
const C = {
  text: '#171717', muted: '#52525B', subtle: '#71717a',
  border: '#E7E7EA', black: '#18181B', white: '#FFFFFF',
  app: '#F7F7F8', violet: '#7c3aed', violetDeep: '#6D28D9', violetSoft: '#F5F3FF',
  blue: '#2563EB', green: '#15803D', greenSoft: '#DCFCE7', red: '#E11D48',
  orange: '#F97316',
}

const fonts = {
  regular: { family: 'Inter', style: 'Regular' },
  medium: { family: 'Inter', style: 'Medium' },
  semibold: { family: 'Inter', style: 'Semi Bold' },
}
await Promise.all(Object.values(fonts).map((font) => figma.loadFontAsync(font)))

function rgba(hex, opacity = 1) {
  const value = hex.replace('#', '')
  return {
    r: parseInt(value.slice(0, 2), 16) / 255,
    g: parseInt(value.slice(2, 4), 16) / 255,
    b: parseInt(value.slice(4, 6), 16) / 255,
    a: opacity,
  }
}
function paint(hex, opacity = 1) { return { type: 'SOLID', color: rgba(hex, opacity) } }
function gradient(from, to) {
  return [{
    type: 'GRADIENT_LINEAR',
    gradientTransform: [[0, 1, 0], [-1, 0, 1]],
    gradientStops: [
      { position: 0, color: rgba(from) },
      { position: 1, color: rgba(to) },
    ],
  }]
}

function text(value, size = 13, style = 'regular', color = C.text, width) {
  const node = figma.createText()
  node.name = value.slice(0, 48)
  node.fontName = fonts[style]
  node.fontSize = size
  node.characters = value
  node.fills = [paint(color)]
  node.lineHeight = { unit: 'PIXELS', value: Math.round(size * 1.45) }
  node.letterSpacing = { unit: 'PERCENT', value: 0 }
  if (width) {
    node.textAutoResize = 'HEIGHT'
    node.resize(width, Math.round(size * 1.45))
  } else {
    node.textAutoResize = 'WIDTH_AND_HEIGHT'
  }
  return node
}

const SHADOW = [
  { type: 'DROP_SHADOW', color: rgba('#0F1729', 0.04), offset: { x: 0, y: 1 }, radius: 2, spread: 0, visible: true, blendMode: 'NORMAL' },
  { type: 'DROP_SHADOW', color: rgba('#0F1729', 0.06), offset: { x: 0, y: 8 }, radius: 20, spread: -6, visible: true, blendMode: 'NORMAL' },
]
const SOFT = [
  { type: 'DROP_SHADOW', color: rgba('#0F1729', 0.08), offset: { x: 0, y: 2 }, radius: 6, spread: -2, visible: true, blendMode: 'NORMAL' },
]
const CTA_SHADOW = [
  { type: 'DROP_SHADOW', color: rgba('#7C3AED', 0.32), offset: { x: 0, y: 6 }, radius: 16, spread: -4, visible: true, blendMode: 'NORMAL' },
]

function frame(name, width, height, options = {}) {
  const node = figma.createFrame()
  node.name = name
  node.resize(width, height)
  node.layoutMode = 'NONE'
  node.fills = [paint(options.fill || C.white)]
  node.strokes = options.border ? [paint(options.border)] : []
  node.strokeWeight = 1
  node.strokeAlign = 'INSIDE'
  node.cornerRadius = options.radius || 0
  node.clipsContent = options.clip ?? false
  if (options.shadow) node.effects = SHADOW
  if (options.soft) node.effects = SOFT
  return node
}

function rect(parent, name, x, y, width, height, fill, radius = 0, rotation = 0, opacity = 1) {
  const node = figma.createRectangle()
  node.name = name
  node.x = x
  node.y = y
  node.resize(width, height)
  node.fills = [paint(fill, opacity)]
  node.strokes = []
  node.cornerRadius = radius
  node.rotation = rotation
  parent.appendChild(node)
  return node
}

function ellipse(parent, name, x, y, size, fill, opacity = 1) {
  const node = figma.createEllipse()
  node.name = name
  node.x = x
  node.y = y
  node.resize(size, size)
  node.fills = [paint(fill, opacity)]
  node.strokes = []
  parent.appendChild(node)
  return node
}

function ring(parent, name, x, y, size, stroke, weight = 2) {
  const node = figma.createEllipse()
  node.name = name
  node.x = x
  node.y = y
  node.resize(size, size)
  node.fills = []
  node.strokes = [paint(stroke)]
  node.strokeWeight = weight
  parent.appendChild(node)
  return node
}

function triangle(parent, name, x, y, size, fill, rotation = 90) {
  const node = figma.createPolygon()
  node.name = name
  node.x = x
  node.y = y
  node.resize(size, size)
  node.pointCount = 3
  node.fills = [paint(fill)]
  node.strokes = []
  node.rotation = rotation
  parent.appendChild(node)
  return node
}

// —— 1. 克隆外壳，新建页面 ——
const src = await figma.getNodeByIdAsync('18:297')
if (!src) throw new Error('源帧不存在，已停止')
const clone = src.clone()
const page = figma.createPage()
page.name = 'Agent 03 · 运行工作台'
page.appendChild(clone)
clone.name = 'Agent Studio / 运行工作台'

const main = clone.findOne((n) => n.name === 'Start creating')
if (!main) throw new Error('主内容区未找到，已停止')
main.layoutMode = 'NONE'
const removed = main.children.map((n) => n.name)
main.children.forEach((n) => n.remove())

// —— 2. 布局常量 ——
const PAD = 24
const LEFT_X = PAD
const LEFT_W = 220
const CENTER_X = LEFT_X + LEFT_W + 16
const CENTER_W = 600
const RIGHT_X = CENTER_X + CENTER_W + 16
const RIGHT_W = 320
const TOP = 24
const COL_H = 920

// —— 3. 左列：会话列表（灰容器） ——
const leftPanel = frame('Session panel', LEFT_W, COL_H, { fill: C.app, radius: 16 })
leftPanel.x = LEFT_X
leftPanel.y = TOP
main.appendChild(leftPanel)

const leftTitle = text('会话', 13, 'semibold', C.text)
leftTitle.x = 12
leftTitle.y = 16
leftPanel.appendChild(leftTitle)

const newBtn = frame('Button / 新建', 64, 28, { fill: C.white, border: C.border, radius: 999 })
rect(newBtn, 'Plus h', 10, 13.2, 8, 1.6, C.text, 1)
rect(newBtn, 'Plus v', 13.2, 10, 1.6, 8, C.text, 1)
const newLabel = text('新建', 11, 'medium', C.text)
newLabel.x = 24
newLabel.y = 7
newBtn.appendChild(newLabel)
newBtn.x = LEFT_W - 12 - 64
newBtn.y = 12
leftPanel.appendChild(newBtn)

const SESSIONS = [
  { title: '秋季新品发布素材', meta: '商品视觉工坊 · 运行中', dot: C.blue, active: true },
  { title: '无线耳机主图', meta: '商品视觉工坊 · 已完成', dot: C.green },
  { title: '海外站商品详情', meta: '电商文案专家 · 已完成', dot: C.green },
  { title: '双十一主视觉', meta: '品牌短片导演 · 已完成', dot: C.green },
]
SESSIONS.forEach((s, i) => {
  const item = frame(`Session / ${s.title}`, LEFT_W - 24, 60, {
    fill: s.active ? C.violetSoft : C.white,
    border: s.active ? '#E4DDFE' : C.border,
    radius: 12,
  })
  const t = text(s.title, 12, 'semibold', C.text)
  t.x = 12
  t.y = 10
  item.appendChild(t)
  ellipse(item, 'Status dot', 12, 34, 6, s.dot)
  const m = text(s.meta, 10, 'regular', C.subtle)
  m.x = 24
  m.y = 31
  item.appendChild(m)
  item.x = 12
  item.y = 52 + i * 68
  leftPanel.appendChild(item)
})

// —— 4. 中列：对话流 ——
const agentTile = frame('Agent tile', 32, 32, { fill: '#DBEAFE', radius: 10, clip: true })
ellipse(agentTile, 'Sun', 20, 3, 9, C.orange)
rect(agentTile, 'Bottle', 8, 12, 9, 16, '#FFF7ED', 3)
rect(agentTile, 'Cap', 10, 8, 5, 5, '#111827', 2)
agentTile.x = CENTER_X
agentTile.y = TOP + 4
main.appendChild(agentTile)

const headTitle = text('秋季新品发布素材', 14, 'semibold', C.text)
headTitle.x = CENTER_X + 44
headTitle.y = TOP + 2
main.appendChild(headTitle)

const headMeta = text('商品视觉工坊 · 运行中', 10, 'regular', C.subtle)
headMeta.x = CENTER_X + 44
headMeta.y = TOP + 26
main.appendChild(headMeta)

const stopBtn = frame('Button / 停止', 76, 32, { fill: C.white, border: C.border, radius: 999 })
rect(stopBtn, 'Stop square', 14, 12.5, 7, 7, C.red, 2)
const stopLabel = text('停止', 12, 'medium', C.red)
stopLabel.x = 28
stopLabel.y = 8
stopBtn.appendChild(stopLabel)
stopBtn.x = CENTER_X + CENTER_W - 76
stopBtn.y = TOP + 4
main.appendChild(stopBtn)

function userBubble(str, y) {
  const probe = text(str, 12, 'regular', C.text)
  const maxW = 400
  const tw = Math.min(Math.ceil(probe.width), maxW - 28)
  probe.remove()
  const bubble = frame(`Msg / ${str.slice(0, 10)}`, tw + 28, 40, { fill: C.violetSoft, radius: 14 })
  const label = text(str, 12, 'regular', C.text, tw)
  label.x = 14
  label.y = 11
  bubble.appendChild(label)
  bubble.resize(tw + 28, Math.ceil(label.height) + 22)
  bubble.x = CENTER_X + CENTER_W - bubble.width
  bubble.y = y
  main.appendChild(bubble)
}

function agentMessage(str, y, width = 520) {
  const av = frame('Avatar', 24, 24, { fill: '#EDE9FE', radius: 8 })
  const avLabel = text('创', 10, 'semibold', C.violet)
  avLabel.x = 6
  avLabel.y = 5
  av.appendChild(avLabel)
  av.x = CENTER_X
  av.y = y + 2
  main.appendChild(av)
  const label = text(str, 12, 'regular', C.text, width)
  label.x = CENTER_X + 36
  label.y = y
  main.appendChild(label)
}

userBubble('给秋季新品做一组主图，白底简洁，带一点秋天氛围。', 84)
agentMessage('已收到新品资料。我会先生成 3 张白底主图候选，再根据你选中的一张生成详情页素材。', 142)
userBubble('主图里不要出现文字，尺寸用 1:1。', 180)

// 运行进度卡
const card = frame('Run progress card', CENTER_W, 150, { fill: C.white, border: C.border, radius: 14, shadow: true })
ring(card, 'Spinner', 16, 16, 14, '#DDD6FE')
ellipse(card, 'Spinner dot', 24, 14, 5, C.violet)
const cardTitle = text('正在生成商品图', 12, 'medium', C.text)
cardTitle.x = 40
cardTitle.y = 15
card.appendChild(cardTitle)
const cardMeta = text('2 / 3 张候选图', 10, 'regular', C.subtle)
cardMeta.x = CENTER_W - 16 - cardMeta.width
cardMeta.y = 17
card.appendChild(cardMeta)
rect(card, 'Track', 16, 44, CENTER_W - 32, 6, '#F0EFF4', 3)
const barFill = frame('Progress fill', Math.round((CENTER_W - 32) * 0.66), 6, { radius: 3 })
barFill.fills = gradient('#7C3AED', '#6D28D9')
barFill.x = 16
barFill.y = 44
card.appendChild(barFill)
for (let i = 0; i < 3; i += 1) {
  const thumb = frame(`Thumb ${i + 1}`, 64, 64, { fill: i < 2 ? '#DBEAFE' : '#F0EFF4', radius: 12, clip: true })
  if (i < 2) {
    ellipse(thumb, 'Sun', 40, 6, 20, C.orange)
    rect(thumb, 'Bottle', 22, 16, 18, 30, '#FFF7ED', 5)
    rect(thumb, 'Cap', 28, 9, 8, 8, '#111827', 3)
    rect(thumb, 'Label', 26, 30, 10, 8, C.orange, 2)
  } else {
    ring(thumb, 'Skeleton ring', 26, 26, 12, '#D4D4D8')
  }
  thumb.x = 16 + i * 76
  thumb.y = 70
  card.appendChild(thumb)
}
card.x = CENTER_X
card.y = 236
main.appendChild(card)

agentMessage('好，候选图完成后可以直接挑选，也可以说「换一批」重新生成。', 402)

const composer = frame('Composer', CENTER_W, 96, { fill: C.white, border: '#DDE3F0', radius: 16, shadow: true })
const ph = text('继续补充要求，或上传新的参考素材…', 13, 'regular', C.subtle)
ph.x = 16
ph.y = 14
composer.appendChild(ph)
const attach = frame('Button / 添加附件', 96, 32, { fill: C.white, border: C.border, radius: 999 })
const attachLabel = text('添加附件', 11, 'medium', C.text)
attachLabel.x = 14
attachLabel.y = 9
attach.appendChild(attachLabel)
attach.x = 16
attach.y = 50
composer.appendChild(attach)
const send = frame('Button / 发送', 64, 32, { radius: 999 })
send.fills = gradient('#7C3AED', '#6D28D9')
send.effects = CTA_SHADOW
const sendLabel = text('发送', 11, 'medium', C.white)
sendLabel.x = Math.round((64 - sendLabel.width) / 2)
sendLabel.y = 9
send.appendChild(sendLabel)
send.x = CENTER_W - 16 - 64
send.y = 50
composer.appendChild(send)
composer.x = CENTER_X
composer.y = 838
main.appendChild(composer)

// —— 5. 右列：步骤与产物（灰容器） ——
const rightPanel = frame('Steps panel', RIGHT_W, COL_H, { fill: C.app, radius: 16 })
rightPanel.x = RIGHT_X
rightPanel.y = TOP
main.appendChild(rightPanel)

const tabs = frame('Tabs', RIGHT_W - 24, 36, { fill: '#F0F0F2', radius: 10 })
const segW = Math.floor((RIGHT_W - 24 - 8) / 3)
const seg = frame('Segment / active', segW, 28, { fill: C.white, radius: 8, soft: true })
seg.x = 4
seg.y = 4
tabs.appendChild(seg)
;['步骤', '产物', '详情'].forEach((label, i) => {
  const t = text(label, 12, i === 0 ? 'medium' : 'regular', i === 0 ? C.text : C.subtle)
  t.x = 4 + i * segW + Math.round((segW - t.width) / 2)
  t.y = 9
  tabs.appendChild(t)
})
tabs.x = 12
tabs.y = 12
rightPanel.appendChild(tabs)

const stepsLabel = text('我的步骤', 11, 'medium', C.subtle)
stepsLabel.x = 12
stepsLabel.y = 64
rightPanel.appendChild(stepsLabel)

const STEPS = [
  { title: '确认商品资料', state: 'done' },
  { title: '生成文案', state: 'done' },
  { title: '生成商品图', state: 'doing' },
  { title: '生成展示视频', state: 'pending' },
  { title: '汇报产物', state: 'pending' },
]
const STATE_LABEL = { done: ['已完成', C.green], doing: ['进行中', C.violet], pending: ['待开始', C.subtle] }
STEPS.forEach((s, i) => {
  const y = 90 + i * 44
  if (i < STEPS.length - 1) rect(rightPanel, 'Connector', 12 + 9, y + 22, 2, 22, C.border, 1)
  if (s.state === 'done') {
    ellipse(rightPanel, 'Done circle', 12, y, 20, C.greenSoft)
    rect(rightPanel, 'Check short', 17, y + 11, 6, 2, C.green, 1, -45)
    rect(rightPanel, 'Check long', 21, y + 9, 10, 2, C.green, 1, 45)
  } else if (s.state === 'doing') {
    ellipse(rightPanel, 'Doing ring', 12, y, 20, C.violetSoft)
    ellipse(rightPanel, 'Doing dot', 18, y + 6, 8, C.violet)
  } else {
    ring(rightPanel, 'Pending ring', 12, y, 20, '#D4D4D8')
  }
  const t = text(s.title, 12, 'regular', s.state === 'pending' ? C.subtle : C.text)
  t.x = 42
  t.y = y + 1
  rightPanel.appendChild(t)
  const [label, color] = STATE_LABEL[s.state]
  const st = text(label, 10, 'regular', color)
  st.x = RIGHT_W - 12 - st.width
  st.y = y + 3
  rightPanel.appendChild(st)
})

const artLabel = text('产物', 11, 'medium', C.subtle)
artLabel.x = 12
artLabel.y = 324
rightPanel.appendChild(artLabel)

const ARTIFACTS = [
  { name: '新品文案.md', kind: 'text' },
  { name: '产品卖点.md', kind: 'text' },
  { name: '产品图 1', kind: 'image' },
  { name: '展示视频', kind: 'pending' },
]
ARTIFACTS.forEach((a, i) => {
  const row = frame(`Artifact / ${a.name}`, RIGHT_W - 24, 56, { fill: C.white, border: C.border, radius: 12 })
  const tile = frame('Tile', 36, 36, {
    fill: a.kind === 'image' ? '#DBEAFE' : a.kind === 'pending' ? '#F0EFF4' : C.violetSoft,
    radius: 10,
    clip: true,
  })
  if (a.kind === 'text') {
    rect(tile, 'Doc', 11, 8, 14, 20, C.violet, 3)
    rect(tile, 'Line 1', 14, 13, 8, 2, C.white, 1)
    rect(tile, 'Line 2', 14, 18, 6, 2, C.white, 1)
  } else if (a.kind === 'image') {
    ellipse(tile, 'Sun', 22, 4, 10, C.orange)
    rect(tile, 'Bottle', 10, 12, 10, 16, '#FFF7ED', 3)
    rect(tile, 'Cap', 12, 8, 6, 5, '#111827', 2)
  } else {
    rect(tile, 'Slate', 10, 12, 16, 12, '#D4D4D8', 3)
    triangle(tile, 'Play', 14, 13, 7, C.white)
  }
  tile.x = 12
  tile.y = 10
  row.appendChild(tile)
  const nm = text(a.name, 12, 'semibold', a.kind === 'pending' ? C.subtle : C.text)
  nm.x = 60
  nm.y = 12
  row.appendChild(nm)
  const meta = text(a.kind === 'text' ? '文本' : a.kind === 'image' ? '图片' : '待生成', 10, 'regular', C.subtle)
  meta.x = 60
  meta.y = 32
  row.appendChild(meta)
  const chev = text('›', 16, 'regular', C.subtle)
  chev.x = RIGHT_W - 24 - 26
  chev.y = 18
  row.appendChild(chev)
  row.x = 12
  row.y = 348 + i * 64
  rightPanel.appendChild(row)
})

// —— 6. 收尾 ——
await figma.setCurrentPageAsync(page)
figma.currentPage.selection = [clone]
figma.viewport.scrollAndZoomIntoView([clone])

return { frameId: clone.id, pageId: page.id, removed: removed.length }
