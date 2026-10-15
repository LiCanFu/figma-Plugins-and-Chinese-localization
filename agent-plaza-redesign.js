// 重建「Agent 广场」主内容区（18:2199）：保留应用外壳，重做主内容与插画卡体系
const C = {
  text: '#171717', muted: '#71717a', subtle: '#a1a1aa',
  border: '#E7E7EA', black: '#18181B', white: '#FFFFFF',
  app: '#F7F7F8', violet: '#7c3aed', violetSoft: '#F5F3FF',
  blue: '#2563EB', green: '#15803D', orange: '#F97316', amber: '#F59E0B',
}

const fonts = {
  regular: { family: 'Inter', style: 'Regular' },
  medium: { family: 'Inter', style: 'Medium' },
  semibold: { family: 'Inter', style: 'Semi Bold' },
}
await Promise.all(Object.values(fonts).map((font) => figma.loadFontAsync(font)))

function paint(hex, opacity = 1) {
  const value = hex.replace('#', '')
  return {
    type: 'SOLID',
    color: {
      r: parseInt(value.slice(0, 2), 16) / 255,
      g: parseInt(value.slice(2, 4), 16) / 255,
      b: parseInt(value.slice(4, 6), 16) / 255,
    },
    opacity,
  }
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

function frame(name, width, height, options = {}) {
  const node = figma.createFrame()
  node.name = name
  node.resize(width, height)
  node.layoutMode = 'NONE'
  node.fills = options.fill === null ? [] : [paint(options.fill || C.white)]
  node.strokes = options.border ? [paint(options.border)] : []
  node.strokeWeight = 1
  node.strokeAlign = 'INSIDE'
  node.cornerRadius = options.radius || 0
  node.clipsContent = options.clip ?? false
  if (options.shadow) node.effects = SHADOW
  return node
}

const SHADOW = [
  { type: 'DROP_SHADOW', color: { r: 0.06, g: 0.09, b: 0.16, a: 0.04 }, offset: { x: 0, y: 1 }, radius: 2, spread: 0, visible: true, blendMode: 'NORMAL' },
  { type: 'DROP_SHADOW', color: { r: 0.06, g: 0.09, b: 0.16, a: 0.06 }, offset: { x: 0, y: 8 }, radius: 20, spread: -6, visible: true, blendMode: 'NORMAL' },
]

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

function diamond(parent, name, x, y, size, fill, opacity = 1) {
  const node = figma.createRectangle()
  node.name = name
  node.x = x
  node.y = y
  node.resize(size, size)
  node.fills = [paint(fill, opacity)]
  node.cornerRadius = Math.max(1, size * 0.22)
  node.rotation = 45
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

function pill(parent, label, options = {}) {
  const padX = options.padX ?? 10
  const padY = options.padY ?? 4
  const size = options.size ?? 10
  const probe = text(label, size, 'medium', options.color || C.text)
  const width = Math.ceil(probe.width) + padX * 2
  const height = size + padY * 2 + 2
  probe.remove()
  const node = frame(`Pill / ${label}`, width, height, {
    fill: options.fill || C.white,
    border: options.border,
    radius: 999,
  })
  const label2 = text(label, size, 'medium', options.color || C.text)
  label2.x = padX
  label2.y = Math.round((height - size * 1.45) / 2) + 1
  node.appendChild(label2)
  parent.appendChild(node)
  return node
}

function chip(parent, label, active = false) {
  const node = frame(`Chip / ${label}`, 60, 34, {
    fill: active ? C.black : C.white,
    border: active ? C.black : C.border,
    radius: 999,
  })
  const label2 = text(label, 12, 'medium', active ? C.white : C.text)
  label2.x = 15
  label2.y = 8
  node.resize(Math.ceil(label2.width) + 30, 34)
  node.appendChild(label2)
  parent.appendChild(node)
  return node
}

function button(parent, label, width, dark = true) {
  const node = frame(`Button / ${label}`, width, 40, {
    fill: dark ? C.black : C.white,
    border: dark ? C.black : C.border,
    radius: 12,
  })
  const label2 = text(label, 12, 'medium', dark ? C.white : C.text)
  label2.x = Math.round((width - label2.width) / 2)
  label2.y = Math.round((40 - 12 * 1.45) / 2) + 1
  node.appendChild(label2)
  parent.appendChild(node)
  return node
}

// —— 插画封面（升级版：多层形状 + 柔和层次 + 点缀）——
function coverArt(kind, w, h, root) {
  if (kind === 'product') {
    ellipse(root, 'Soft circle', w - 96, -30, 120, '#BFDBFE', 0.55)
    ellipse(root, 'Sun', w - 80, -26, 98, C.orange)
    ellipse(root, 'Light pool', 46, 92, 84, '#C7DDFB', 0.7)
    rect(root, 'Shadow strip', 34, h - 32, w - 68, 14, '#93C5FD', 7)
    ellipse(root, 'Bottle shadow', 138, h - 50, 66, '#BFDBFE', 0.8)
    rect(root, 'Bottle', 138, 28, 68, 102, '#FFF7ED', 18)
    rect(root, 'Bottle cap', 154, 12, 36, 24, '#111827', 6)
    rect(root, 'Label', 148, 72, 48, 32, C.orange, 6)
    rect(root, 'Label line 1', 154, 78, 36, 4, '#FFEDD5', 2)
    rect(root, 'Label line 2', 154, 86, 26, 4, '#FFEDD5', 2)
    rect(root, 'Product cube', 238, 60, 84, 66, '#111827', 10, -8)
    ellipse(root, 'Cube dot', 252, 74, 10, C.orange)
    diamond(root, 'Sparkle 1', 98, 32, 8, C.white, 0.95)
    diamond(root, 'Sparkle 2', w - 44, 96, 6, C.white, 0.9)
    return
  }
  if (kind === 'film') {
    rect(root, 'Red panel', -22, 56, 208, 112, '#E11D48', 18, -8)
    rect(root, 'Blue panel', 192, -18, 190, 100, '#38BDF8', 14, 8)
    rect(root, 'Film frame', 78, 24, 218, 98, '#0F172A', 12)
    const holes = [92, 132, 172, 212, 252]
    holes.forEach((x, i) => {
      rect(root, `Sprocket top ${i + 1}`, x, 32, 18, 8, '#F8FAFC', 3)
      rect(root, `Sprocket bottom ${i + 1}`, x, 106, 18, 8, '#F8FAFC', 3)
    })
    triangle(root, 'Play', 158, 60, 34, '#F8FAFC')
    ellipse(root, 'Accent dot', w - 44, 118, 16, '#FACC15', 0.9)
    ellipse(root, 'Blue dot', 56, 22, 10, '#38BDF8', 0.85)
    return
  }
  if (kind === 'social') {
    ellipse(root, 'Portrait base', w - 142, 14, 118, '#0F766E')
    rect(root, 'Post card', 34, 22, 132, 88, C.white, 12, -7)
    rect(root, 'Post image', 46, 34, 106, 44, '#0F766E', 8)
    rect(root, 'Post line', 46, 86, 72, 7, '#99F6E4', 3)
    rect(root, 'Caption pill', 168, 92, 126, 32, '#FACC15', 16, 5)
    ellipse(root, 'Small sun', 140, 106, 26, '#FACC15')
    const dots = [40, 56, 72]
    dots.forEach((y, i) => ellipse(root, `Dot ${i + 1}`, w - 44, y, 6, '#34D399'))
    rect(root, 'Caption line', 60, 126, 90, 7, '#A7F3D0', 3)
    return
  }
  if (kind === 'copy') {
    rect(root, 'Back doc', 58, 26, 148, 110, '#F5F3FF', 12, 4)
    rect(root, 'Document', 46, 20, 150, 112, '#FEF3C7', 12, -4)
    rect(root, 'Headline', 64, 38, 98, 12, C.violet, 6)
    rect(root, 'Copy line 1', 64, 64, 112, 7, '#A78BFA', 3)
    rect(root, 'Copy line 2', 64, 78, 96, 7, '#A78BFA', 3)
    rect(root, 'Copy line 3', 64, 92, 104, 7, '#A78BFA', 3)
    ellipse(root, 'Accent circle', w - 136, 24, 88, '#FB7185')
    rect(root, 'Tag', w - 160, 98, 110, 28, C.violet, 14)
    diamond(root, 'Sparkle', w - 44, 58, 10, '#C4B5FD')
    return
  }
  if (kind === 'story') {
    ellipse(root, 'Sun', w - 118, 16, 58, C.amber)
    rect(root, 'Sky band', 0, 96, w, 62, '#BFDBFE')
    rect(root, 'Cloud', 40, 38, 58, 18, C.white, 9, 0, 0.9)
    rect(root, 'Cloud bump', 56, 30, 30, 16, C.white, 8, 0, 0.9)
    rect(root, 'Book left', 54, 44, 114, 84, '#1F2937', 8, 7)
    rect(root, 'Book right', 166, 44, 114, 84, C.blue, 8, -7)
    ellipse(root, 'Character', 140, 60, 36, '#FDE68A')
    diamond(root, 'Sparkle 1', w - 44, 40, 8, C.amber, 0.9)
    diamond(root, 'Sparkle 2', 24, 116, 6, C.white, 0.9)
    return
  }
  // deck
  rect(root, 'Slide one', 26, 18, 192, 114, '#F8FAFC', 10)
  rect(root, 'Title bar', 44, 36, 118, 12, '#111827', 6)
  rect(root, 'Bar one', 48, 74, 26, 38, '#60A5FA', 4)
  rect(root, 'Bar two', 82, 62, 26, 50, C.blue, 4)
  rect(root, 'Bar three', 116, 86, 26, 26, '#93C5FD', 4)
  rect(root, 'Slide two', 212, 36, 116, 82, '#60A5FA', 10, 7)
  rect(root, 'Slide two line', 228, 54, 64, 8, '#EFF6FF', 4, 7)
  ellipse(root, 'Accent dot', w - 52, 22, 12, '#111827')
  return
}

function agentCard(agent, width, height) {
  const card = frame(`Agent card / ${agent.name}`, width, height, {
    fill: C.white, border: C.border, radius: 16, clip: true, shadow: true,
  })
  const cover = frame(`Cover / ${agent.name}`, width, 158, { fill: agent.bg, clip: true })
  coverArt(agent.kind, width, 158, cover)
  const tag = pill(cover, agent.cat, { fill: C.white, size: 10 })
  tag.x = 14
  tag.y = 12
  if (agent.hot) {
    const hot = pill(cover, '热门', { fill: C.black, color: C.white, size: 10 })
    hot.x = width - 14 - hot.width
    hot.y = 12
  }
  card.appendChild(cover)

  const title = text(agent.name, 15, 'semibold', C.text)
  title.x = 16
  title.y = 174
  card.appendChild(title)

  const use = frame(`Button / 使用 / ${agent.name}`, 54, 30, { fill: C.black, radius: 999 })
  const useLabel = text('使用', 12, 'medium', C.white)
  useLabel.x = Math.round((54 - useLabel.width) / 2)
  useLabel.y = 6
  use.appendChild(useLabel)
  use.x = width - 16 - 54
  use.y = 170
  card.appendChild(use)

  const desc = text(agent.desc, 11, 'regular', C.muted, width - 32)
  desc.x = 16
  desc.y = 200
  card.appendChild(desc)

  let capX = 16
  agent.caps.forEach((cap) => {
    const capPill = pill(card, cap, { fill: C.violetSoft, color: C.violet, size: 10, padX: 8, padY: 4 })
    capPill.x = capX
    capPill.y = 222
    capX += capPill.width + 6
  })
  return card
}

const AGENTS = [
  { name: '商品视觉工坊', cat: '电商视觉', kind: 'product', hot: true, bg: '#DCEAFE',
    desc: '从商品资料生成主图、详情素材和展示短片。', caps: ['商品主图', '详情页', '短视频'] },
  { name: '品牌短片导演', cat: '视频创作', kind: 'film', bg: '#111827',
    desc: '把品牌故事拆成分镜、画面与节奏明确的短片。', caps: ['分镜', '图生视频', '成片'] },
  { name: '社媒内容搭子', cat: '社媒营销', kind: 'social', bg: '#D1FAE5',
    desc: '围绕一个主题批量生成平台化文案与视觉素材。', caps: ['小红书', '短视频', '配图'] },
  { name: '电商文案专家', cat: '商品文案', kind: 'copy', bg: '#EDE9FE',
    desc: '根据真实商品事实生成多平台标题、卖点和描述。', caps: ['标题', '卖点', '多平台'] },
  { name: '故事绘本工坊', cat: '故事创作', kind: 'story', bg: '#FFF7ED',
    desc: '将故事梗概转换为分镜、插画和可交付内容。', caps: ['脚本', '插画', 'PDF'] },
  { name: '演示文稿助手', cat: '办公效率', kind: 'deck', bg: '#DBEAFE',
    desc: '从材料整理大纲，并生成可编辑的演示文稿。', caps: ['大纲', '配图', 'PPTX'] },
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

// —— 主内容区 ——
const market = await figma.getNodeByIdAsync('18:2199')
if (!market || market.name !== 'Agent marketplace') throw new Error('主内容区身份不匹配，已停止')
market.layoutMode = 'NONE'
const removed = market.children.map((n) => n.name)
market.children.forEach((n) => n.remove())

const W = 1220
const PAD = 32
const CW = W - PAD * 2

const title = text('Agent 广场', 30, 'semibold', C.text)
title.x = PAD
title.y = 34
market.appendChild(title)

const subtitle = text('选择一个专门的创作搭档，从想法直接走到图片、视频或文案。', 13, 'regular', C.muted)
subtitle.x = PAD
subtitle.y = 78
market.appendChild(subtitle)

const cta = button(market, '开始新创作', 128)
cta.x = PAD + CW - 128
cta.y = 40

// 分类 chips + 搜索
const CHIPS = ['推荐', '电商', '营销', '视频', '图片', '文字', '办公']
let chipX = PAD
CHIPS.forEach((label, i) => {
  const c = chip(market, label, i === 0)
  c.x = chipX
  c.y = 134
  chipX += c.width + 8
})

const search = frame('Search agents', 260, 34, { fill: C.white, border: C.border, radius: 10 })
const glass = figma.createEllipse()
glass.name = 'Magnifier'
glass.resize(12, 12)
glass.fills = []
glass.strokes = [paint(C.subtle)]
glass.strokeWeight = 1.5
glass.x = 12
glass.y = 10
search.appendChild(glass)
const handle = rect(search, 'Handle', 21, 21, 7, 1.6, C.subtle, 1, 45)
const searchLabel = text('搜索 Agent 或能力', 12, 'regular', C.subtle)
searchLabel.x = 34
searchLabel.y = 8
search.appendChild(searchLabel)
search.x = PAD + CW - 260
search.y = 134
market.appendChild(search)

// Agent 卡片网格
const CARD_W = 374
const CARD_H = 252
const GAP = 17
AGENTS.forEach((agent, i) => {
  const card = agentCard(agent, CARD_W, CARD_H)
  const col = i % 3
  const row = Math.floor(i / 3)
  card.x = PAD + col * (CARD_W + GAP)
  card.y = 184 + row * (CARD_H + 16)
  market.appendChild(card)
})

// 最近创作
const recent = frame('Recent runs', CW, 150, { fill: C.app, radius: 16 })
const recentTitle = text('最近创作', 15, 'semibold', C.text)
recentTitle.x = 20
recentTitle.y = 18
recent.appendChild(recentTitle)
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
  const dot = ellipse(card, 'Status dot', 68, 42, 6, item.state === 'running' ? C.blue : C.green)
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
  recent.appendChild(card)
})
recent.x = PAD
recent.y = 716
market.appendChild(recent)

const pageFrame = await figma.getNodeByIdAsync('18:18')
await figma.setCurrentPageAsync(pageFrame.parent)
figma.currentPage.selection = [pageFrame]
figma.viewport.scrollAndZoomIntoView([pageFrame])

return { removedCount: removed.length, created: market.children.length, cardHeight: CARD_H }
