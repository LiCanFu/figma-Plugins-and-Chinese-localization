// 开始创作 v2：暖紫渐变底 + Agent 状态胶囊 + 具体计费行 + 紫色发送按钮
const C = {
  text: '#171717', muted: '#52525B', subtle: '#71717a',
  border: '#E7E7EA', black: '#18181B', white: '#FFFFFF',
  app: '#F7F7F8', violet: '#7c3aed', violetDeep: '#6D28D9', violetSoft: '#F3F0FF',
  blue: '#2563EB', green: '#15803D', orange: '#F97316',
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

function chipLabel(parent, label, x, y, active = false) {
  const probe = text(label, 12, 'medium', C.text)
  const width = Math.ceil(probe.width) + 30
  probe.remove()
  const node = frame(`Chip / ${label}`, width, 34, {
    fill: active ? C.black : C.white,
    border: active ? C.black : C.border,
    radius: 999,
  })
  const label2 = text(label, 12, 'medium', active ? C.white : C.text)
  label2.x = 15
  label2.y = 8
  node.appendChild(label2)
  node.x = x
  node.y = y
  parent.appendChild(node)
  return node
}

function chevronDown(parent, x, y) {
  const a = rect(parent, 'Chevron left', x, y, 7, 1.5, C.muted, 1, -45)
  const b = rect(parent, 'Chevron right', x + 5, y, 7, 1.5, C.muted, 1, 45)
  return [a, b]
}

// —— 常用 Agent 迷你插画 ——
function miniArt(kind, root) {
  if (kind === 'product') {
    ellipse(root, 'Sun', 40, 6, 20, C.orange)
    rect(root, 'Bottle', 22, 16, 18, 30, '#FFF7ED', 5)
    rect(root, 'Cap', 28, 9, 8, 8, '#111827', 3)
    rect(root, 'Label', 26, 30, 10, 8, C.orange, 2)
    return
  }
  if (kind === 'film') {
    rect(root, 'Red panel', -6, 34, 30, 34, '#E11D48', 8, -8)
    rect(root, 'Frame', 14, 16, 38, 30, '#0F172A', 6)
    ;[18, 30, 42].forEach((x, i) => rect(root, `Sprocket ${i + 1}`, x, 20, 6, 3, '#F8FAFC', 1))
    triangle(root, 'Play', 26, 24, 12, '#F8FAFC')
    ellipse(root, 'Dot', 50, 8, 8, '#38BDF8', 0.9)
    return
  }
  rect(root, 'Document', 16, 12, 28, 38, '#FEF3C7', 5, -4)
  rect(root, 'Line 1', 22, 20, 16, 4, C.violet, 2)
  rect(root, 'Line 2', 22, 28, 14, 4, '#A78BFA', 2)
  ellipse(root, 'Accent', 40, 36, 18, '#FB7185')
}

const COMMON = [
  { name: '商品视觉工坊', meta: '图片 + 视频', kind: 'product', bg: '#DBEAFE', cover: '#BFDBFE' },
  { name: '品牌短片导演', meta: '分镜 + 视频', kind: 'film', bg: '#FCE7F3', cover: '#111827' },
  { name: '电商文案专家', meta: '文字', kind: 'copy', bg: '#EDE9FE', cover: '#DDD6FE' },
]

const RECENT = [
  { title: '秋季新品发布素材', meta: '商品视觉工坊 · 运行中', state: 'running', kind: 'product' },
  { title: '无线耳机主图', meta: '商品视觉工坊 · 已完成', state: 'done', kind: 'social' },
  { title: '海外站商品详情', meta: '电商文案专家 · 已完成', state: 'done', kind: 'copy' },
]

function recentThumb(item) {
  const thumb = frame(`Thumb / ${item.title}`, 44, 44, { fill: item.kind === 'copy' ? '#EDE9FE' : '#DCEAFE', radius: 10, clip: true })
  if (item.kind === 'product') {
    rect(thumb, 'Bottle', 14, 10, 16, 26, '#FFF7ED', 5)
    rect(thumb, 'Cap', 18, 5, 8, 7, '#111827', 2)
    ellipse(thumb, 'Sun', 30, 4, 12, C.orange)
  } else if (item.kind === 'social') {
    ellipse(thumb, 'Base', 20, 6, 20, '#0F766E')
    rect(thumb, 'Card', 8, 14, 20, 16, C.white, 4, -7)
  } else {
    rect(thumb, 'Doc', 10, 9, 20, 26, '#FEF3C7', 5, -4)
    rect(thumb, 'Line', 14, 15, 12, 4, '#7c3aed', 2)
    rect(thumb, 'Line 2', 14, 23, 10, 4, '#A78BFA', 2)
  }
  return thumb
}

function recentPanel(parent, x, y) {
  const panel = frame('Recent runs', 1156, 150, { fill: C.app, radius: 16 })
  const title = text('最近创作', 15, 'semibold', C.text)
  title.x = 20
  title.y = 18
  panel.appendChild(title)
  RECENT.forEach((item, i) => {
    const card = frame(`Recent / ${item.title}`, 364, 80, { fill: C.white, border: C.border, radius: 12 })
    const thumb = recentThumb(item)
    thumb.x = 12
    thumb.y = 18
    card.appendChild(thumb)
    const t = text(item.title, 12, 'semibold', C.text)
    t.x = 68
    t.y = 17
    card.appendChild(t)
    ellipse(card, 'Status dot', 68, 42, 6, item.state === 'running' ? C.blue : C.green)
    const m = text(item.meta, 10, 'regular', C.muted)
    m.x = 80
    m.y = 38
    card.appendChild(m)
    const chevron = text('›', 16, 'regular', C.subtle)
    chevron.x = 364 - 26
    chevron.y = 28
    card.appendChild(chevron)
    card.x = 20 + i * (364 + 12)
    card.y = 50
    panel.appendChild(card)
  })
  panel.x = x
  panel.y = y
  parent.appendChild(panel)
  return panel
}

// —— 主内容区 ——
const start = await figma.getNodeByIdAsync('18:2359')
if (!start || start.name !== 'Start creating') throw new Error('主内容区身份不匹配，已停止')
start.layoutMode = 'NONE'
const removed = start.children.map((n) => n.name)
start.children.forEach((n) => n.remove())

const W = 1220
const PAD = 32
const CW = W - PAD * 2

// 顶部暖紫渐变带
const wash = frame('Hero wash', W, 470, { fill: C.white, clip: true })
wash.fills = gradient('#F6F5FF', '#FFFFFF')
const g1 = ellipse(wash, 'Glow 1', 400, -90, 300, '#EDE9FE', 0.45)
g1.effects = [{ type: 'LAYER_BLUR', radius: 80, visible: true }]
const g2 = ellipse(wash, 'Glow 2', 560, 40, 240, '#E0E7FF', 0.35)
g2.effects = [{ type: 'LAYER_BLUR', radius: 70, visible: true }]
const g3 = ellipse(wash, 'Glow 3', 180, 150, 200, '#F5F3FF', 0.45)
g3.effects = [{ type: 'LAYER_BLUR', radius: 70, visible: true }]
wash.x = 0
wash.y = 0
start.appendChild(wash)

// Hero：徽标 + 标题 + 副标题
const badge = frame('Agent avatar', 64, 64, { fill: C.white, radius: 20, shadow: true })
const badgeLabel = text('创', 24, 'semibold', C.violet)
badgeLabel.x = Math.round((64 - badgeLabel.width) / 2)
badgeLabel.y = 14
badge.appendChild(badgeLabel)
badge.x = Math.round((W - 64) / 2)
badge.y = 72
start.appendChild(badge)

const title = text('今天想先做什么？', 30, 'semibold', C.text)
title.x = Math.round((W - title.width) / 2)
title.y = 162
start.appendChild(title)

const subtitle = text('描述目标，选择 Agent，剩下的交给创作流程。', 13, 'regular', C.muted)
subtitle.x = Math.round((W - subtitle.width) / 2)
subtitle.y = 212
start.appendChild(subtitle)

// Composer
const composer = frame('Start composer', 780, 172, { fill: C.white, border: '#DDE3F0', radius: 20, shadow: true })
const placeholder = text('输入想法、商品资料或脚本，也可以添加图片作为参考…', 14, 'regular', C.subtle)
placeholder.x = 24
placeholder.y = 22
composer.appendChild(placeholder)

// Agent 状态胶囊（默认预选）
const agentCapsule = frame('Agent state', 190, 40, { fill: C.white, border: C.border, radius: 999 })
const agentDot = ellipse(agentCapsule, 'Agent dot', 14, 16, 8, C.violet)
const agentLabel = text('Agent · 商品视觉工坊', 12, 'medium', C.text)
agentLabel.x = 28
agentLabel.y = Math.round((40 - 12 * 1.45) / 2) + 1
agentCapsule.appendChild(agentLabel)
agentCapsule.resize(Math.ceil(agentLabel.width) + 28 + 26, 40)
chevronDown(agentCapsule, agentCapsule.width - 24, 19)
agentCapsule.x = 18
agentCapsule.y = 114
composer.appendChild(agentCapsule)

const addMaterial = frame('Button / 添加素材', 98, 40, { fill: C.white, border: C.border, radius: 999 })
const addLabel = text('添加素材', 12, 'medium', C.text)
addLabel.x = Math.round((98 - addLabel.width) / 2)
addLabel.y = Math.round((40 - 12 * 1.45) / 2) + 1
addMaterial.appendChild(addLabel)
addMaterial.x = 18 + agentCapsule.width + 8
addMaterial.y = 114
composer.appendChild(addMaterial)

const send = frame('Button / 发送', 72, 40, { radius: 999 })
send.fills = gradient('#7C3AED', '#6D28D9')
send.effects = CTA_SHADOW
const sendLabel = text('发送', 12, 'medium', C.white)
sendLabel.x = Math.round((72 - sendLabel.width) / 2)
sendLabel.y = Math.round((40 - 12 * 1.45) / 2) + 1
send.appendChild(sendLabel)
send.x = 690
send.y = 114
composer.appendChild(send)

composer.x = Math.round((W - 780) / 2)
composer.y = 256
start.appendChild(composer)

// 计费行（具体预估 + 余额）
const hint = text('本次预计消耗 ≈0.6 元 · 账户余额 ¥42.30', 12, 'regular', C.muted)
hint.x = Math.round((W - hint.width) / 2)
hint.y = 442
start.appendChild(hint)

// 建议 chips（两行居中）
const ROW1 = ['制作新品发布素材', '生成商品主图', '把故事做成短片', '优化商品文案']
const ROW2 = ['制作品牌介绍 PPT', '生成社媒配图', '策划营销短视频']
function layoutChips(labels, y) {
  const widths = labels.map((label) => Math.ceil(text(label, 12, 'medium').width) + 30)
  const total = widths.reduce((a, b) => a + b, 0) + (labels.length - 1) * 8
  let x = Math.round((W - total) / 2)
  labels.forEach((label, i) => {
    chipLabel(start, label, x, y)
    x += widths[i] + 8
  })
}
layoutChips(ROW1, 484)
layoutChips(ROW2, 526)

// 常用 Agent
const section = text('常用 Agent', 15, 'semibold', C.text)
section.x = PAD
section.y = 596
start.appendChild(section)

COMMON.forEach((agent, i) => {
  const card = frame(`Common / ${agent.name}`, 374, 112, { fill: agent.bg, radius: 16, clip: true })
  const tile = frame('Mini cover', 64, 64, { fill: agent.cover, radius: 16, clip: true })
  miniArt(agent.kind, tile)
  tile.x = 20
  tile.y = 24
  card.appendChild(tile)
  const name = text(agent.name, 15, 'semibold', C.text)
  name.x = 100
  name.y = 32
  card.appendChild(name)
  const meta = text(agent.meta, 11, 'regular', C.muted)
  meta.x = 100
  meta.y = 58
  card.appendChild(meta)
  const chevron = text('›', 16, 'regular', C.muted)
  chevron.x = 374 - 30
  chevron.y = 46
  card.appendChild(chevron)
  card.x = PAD + i * 391
  card.y = 626
  start.appendChild(card)
})

// 最近创作
recentPanel(start, PAD, 758)

const pageFrame = await figma.getNodeByIdAsync('18:297')
await figma.setCurrentPageAsync(pageFrame.parent)
figma.currentPage.selection = [pageFrame]
figma.viewport.scrollAndZoomIntoView([pageFrame])

return { removedCount: removed.length, created: start.children.length }
