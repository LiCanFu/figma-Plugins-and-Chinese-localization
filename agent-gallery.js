// 新建「Agent 05 · 候选图画廊」页：候选图选择/下载 + 上传素材三种状态
const C = {
  text: '#171717', muted: '#52525B', subtle: '#71717a',
  border: '#E7E7EA', black: '#18181B', white: '#FFFFFF',
  app: '#F7F7F8', violet: '#7c3aed', violetDeep: '#6D28D9', violetSoft: '#F5F3FF',
  blue: '#2563EB', green: '#15803D', greenSoft: '#DCFCE7',
  red: '#E11D48', redDeep: '#BE123C', redSoft: '#FFF1F2', redBorder: '#FECDD3',
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

const SOFT = [
  { type: 'DROP_SHADOW', color: rgba('#0F1729', 0.08), offset: { x: 0, y: 2 }, radius: 6, spread: -2, visible: true, blendMode: 'NORMAL' },
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

function centered(parent, str, size, style, color, y, cardW) {
  const t = text(str, size, style, color)
  t.x = Math.round((cardW - t.width) / 2)
  t.y = y
  parent.appendChild(t)
  return t
}

function ghostButton(parent, label, width, x, y) {
  const btn = frame(`Button / ${label}`, width, 30, { fill: C.white, border: C.border, radius: 999 })
  const t = text(label, 11, 'medium', C.text)
  t.x = Math.round((width - t.width) / 2)
  t.y = 8
  btn.appendChild(t)
  btn.x = x
  btn.y = y
  parent.appendChild(btn)
  return btn
}

// —— 1. 页面与头部 ——
const page = figma.createPage()
page.name = 'Agent 05 · 候选图画廊'
const wrap = frame('Gallery / 候选图画廊', 1220, 946, { fill: C.app })
page.appendChild(wrap)

const h1 = text('候选图画廊', 18, 'semibold', C.text)
h1.x = 32
h1.y = 30
wrap.appendChild(h1)
const sub = text('图片类技能的候选选择与素材上传 · 全部候选保留，不自动筛选', 11, 'regular', C.subtle)
sub.x = 32
sub.y = 58
wrap.appendChild(sub)

// —— 2. 区块一：候选图选择与下载 ——
const secA = frame('Section / 候选图', 1156, 440, { fill: C.white, border: C.border, radius: 16, soft: true })
secA.x = 32
secA.y = 100
wrap.appendChild(secA)

const aTitle = text('候选图 · 选择与下载', 13, 'semibold', C.text)
aTitle.x = 20
aTitle.y = 18
secA.appendChild(aTitle)
const aDesc = text('本次生成 4 张候选，全部保留；选中仅标记后续步骤使用，不删除其余候选', 10, 'regular', C.subtle, 900)
aDesc.x = 20
aDesc.y = 40
secA.appendChild(aDesc)
const aMeta = text('商品视觉工坊 · 4 张候选', 11, 'regular', C.subtle)
aMeta.x = 20
aMeta.y = 76
secA.appendChild(aMeta)
ghostButton(secA, '全部下载', 96, 940, 68)
ghostButton(secA, '换一批', 88, 1048, 68)

const CANDIDATES = [
  { tint: '#DBEAFE', sunX: 170, sunY: 30, sunSize: 64, label: '#F97316' },
  { tint: '#EDE9FE', sunX: 36, sunY: 34, sunSize: 64, label: '#7C3AED' },
  { tint: '#FEF3C7', sunX: 184, sunY: 36, sunSize: 48, label: '#2563EB' },
  { tint: '#DCFCE7', sunX: 46, sunY: 180, sunSize: 44, label: '#15803D' },
]
CANDIDATES.forEach((c, i) => {
  const card = frame(`Candidate ${i + 1}`, 266, 310, { fill: C.white, border: C.border, radius: 14, clip: true })
  card.x = 20 + i * (266 + 16)
  card.y = 110
  secA.appendChild(card)
  const img = frame('Image', 266, 266, { fill: c.tint })
  img.x = 0
  img.y = 0
  card.appendChild(img)
  ellipse(img, 'Sun', c.sunX, c.sunY, c.sunSize, C.orange)
  rect(img, 'Bottle', 101, 96, 64, 104, '#FFF7ED', 16)
  rect(img, 'Cap', 119, 74, 28, 22, '#111827', 8)
  rect(img, 'Label', 113, 150, 40, 30, c.label, 6)
  rect(card, 'Divider', 0, 266, 266, 1, '#F4F4F5')
  const nm = text(`候选 ${i + 1}`, 11, 'medium', C.text)
  nm.x = 14
  nm.y = 278
  card.appendChild(nm)
  const dl = text('下载', 11, 'medium', C.violet)
  dl.x = 266 - 14 - dl.width
  dl.y = 278
  card.appendChild(dl)
  if (i === 1) {
    const ring = figma.createRectangle()
    ring.name = 'Selected ring'
    ring.x = 0
    ring.y = 0
    ring.resize(266, 310)
    ring.fills = []
    ring.strokes = [paint(C.violet)]
    ring.strokeWeight = 2
    ring.strokeAlign = 'INSIDE'
    ring.cornerRadius = 14
    card.appendChild(ring)
    ellipse(card, 'Badge', 232, 12, 22, C.violet)
    rect(card, 'Check short', 237, 23, 6, 2, C.white, 1, -45)
    rect(card, 'Check long', 241, 21, 10, 2, C.white, 1, 45)
  }
})

// —— 3. 区块二：上传素材三种状态 ——
const secB = frame('Section / 上传素材', 1156, 350, { fill: C.white, border: C.border, radius: 16, soft: true })
secB.x = 32
secB.y = 564
wrap.appendChild(secB)

const bTitle = text('上传参考素材 · 状态', 13, 'semibold', C.text)
bTitle.x = 20
bTitle.y = 18
secB.appendChild(bTitle)
const bDesc = text('拖拽上传；悬停高亮；上传后可移除', 10, 'regular', C.subtle)
bDesc.x = 20
bDesc.y = 40
secB.appendChild(bDesc)
;['空 · 等待拖入', '拖拽悬停 · 高亮', '已上传 · 可移除'].forEach((t, i) => {
  const l = text(t, 10, 'medium', C.subtle)
  l.x = 20 + i * (360 + 18)
  l.y = 76
  secB.appendChild(l)
})

// 面板一：空状态
const p1 = frame('Upload / 空', 360, 220, { fill: C.app, radius: 12 })
p1.x = 20
p1.y = 94
secB.appendChild(p1)
p1.strokes = [paint('#D4D4D8')]
p1.strokeWeight = 1.5
p1.strokeAlign = 'INSIDE'
p1.dashPattern = [6, 4]
ellipse(p1, 'Icon bg', 156, 44, 48, C.white)
rect(p1, 'Arrow stem', 178.5, 58, 3, 14, C.violet, 1.5)
rect(p1, 'Chevron L', 171.5, 57, 8, 3, C.violet, 1.5, -45)
rect(p1, 'Chevron R', 181, 57, 8, 3, C.violet, 1.5, 45)
rect(p1, 'Tray', 171, 78, 18, 3, C.violet, 1.5)
centered(p1, '拖拽图片到这里', 12, 'medium', C.text, 108, 360)
centered(p1, '支持 JPG / PNG，单张 ≤10MB', 10, 'regular', C.subtle, 130, 360)
ghostButton(p1, '选择文件', 96, 132, 158)

// 面板二：拖拽悬停
const p2 = frame('Upload / 悬停', 360, 220, { fill: C.violetSoft, radius: 12 })
p2.x = 20 + 360 + 18
p2.y = 94
secB.appendChild(p2)
p2.strokes = [paint(C.violet)]
p2.strokeWeight = 1.5
p2.strokeAlign = 'INSIDE'
ellipse(p2, 'Icon bg', 156, 44, 48, C.white)
rect(p2, 'Arrow stem', 178.5, 58, 3, 14, C.violet, 1.5)
rect(p2, 'Chevron L', 171.5, 57, 8, 3, C.violet, 1.5, -45)
rect(p2, 'Chevron R', 181, 57, 8, 3, C.violet, 1.5, 45)
rect(p2, 'Tray', 171, 78, 18, 3, C.violet, 1.5)
centered(p2, '松开即可上传', 12, 'medium', C.text, 108, 360)
centered(p2, '将添加到本次会话的参考素材', 10, 'regular', C.muted, 130, 360)

// 面板三：已上传
const p3 = frame('Upload / 已上传', 360, 220, { fill: C.white, border: C.border, radius: 12 })
p3.x = 20 + (360 + 18) * 2
p3.y = 94
secB.appendChild(p3)
const thumb = frame('Thumb', 56, 56, { fill: '#DBEAFE', radius: 10, clip: true })
thumb.x = 16
thumb.y = 16
p3.appendChild(thumb)
ellipse(thumb, 'Sun', 32, 6, 16, C.orange)
rect(thumb, 'Bottle', 21, 18, 14, 24, '#FFF7ED', 4)
rect(thumb, 'Cap', 25, 14, 6, 5, '#111827', 2)
rect(thumb, 'Label', 24, 32, 8, 7, C.orange, 2)
const fName = text('参考图-主图.jpg', 11, 'medium', C.text)
fName.x = 84
fName.y = 20
p3.appendChild(fName)
const fMeta = text('2.4 MB · JPG', 10, 'regular', C.subtle)
fMeta.x = 84
fMeta.y = 40
p3.appendChild(fMeta)
const remove = text('×', 14, 'regular', C.subtle)
remove.x = 360 - 16 - remove.width
remove.y = 26
p3.appendChild(remove)
const addRow = frame('Add row', 328, 44, { fill: C.app, radius: 10 })
addRow.x = 16
addRow.y = 88
p3.appendChild(addRow)
addRow.strokes = [paint('#D4D4D8')]
addRow.strokeWeight = 1.5
addRow.strokeAlign = 'INSIDE'
addRow.dashPattern = [6, 4]
const addLabel = text('+ 继续添加', 11, 'medium', C.subtle)
addLabel.x = Math.round((328 - addLabel.width) / 2)
addLabel.y = 13
addRow.appendChild(addLabel)
const p3Hint = text('上传的素材仅本人可见，随会话管理', 10, 'regular', C.subtle)
p3Hint.x = 16
p3Hint.y = 150
p3.appendChild(p3Hint)

// —— 4. 收尾 ——
await figma.setCurrentPageAsync(page)
figma.currentPage.selection = [wrap]
figma.viewport.scrollAndZoomIntoView([wrap])

return { frameId: wrap.id, pageId: page.id }
