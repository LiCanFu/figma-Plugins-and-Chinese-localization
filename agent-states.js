// 新建「Agent 04 · 关键状态」页：运行失败 / 余额不足 / 发送禁用 / 空状态
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

function centered(parent, str, size, style, color, y, cardW) {
  const t = text(str, size, style, color)
  t.x = Math.round((cardW - t.width) / 2)
  t.y = y
  parent.appendChild(t)
  return t
}

// —— 1. 页面与栅格 ——
const page = figma.createPage()
page.name = 'Agent 04 · 关键状态'
const wrap = frame('States / 关键状态', 1220, 876, { fill: C.app })
page.appendChild(wrap)

const h1 = text('关键状态', 18, 'semibold', C.text)
h1.x = 32
h1.y = 30
wrap.appendChild(h1)
const sub = text('运行失败 / 余额不足 / 发送禁用 / 空状态 · 与主流程共用同一套组件与样式', 11, 'regular', C.subtle)
sub.x = 32
sub.y = 58
wrap.appendChild(sub)

const CELL_W = 566
const CELL_H = 360
const GAP = 24
const PAD = 32
function cell(col, row, title, desc) {
  const card = frame(`State / ${title}`, CELL_W, CELL_H, { fill: C.white, border: C.border, radius: 16, soft: true })
  card.x = PAD + col * (CELL_W + GAP)
  card.y = 100 + row * (CELL_H + GAP)
  wrap.appendChild(card)
  const t = text(title, 13, 'semibold', C.text)
  t.x = 20
  t.y = 18
  card.appendChild(t)
  const d = text(desc, 10, 'regular', C.subtle, CELL_W - 40)
  d.x = 20
  d.y = 40
  card.appendChild(d)
  const canvas = frame('Canvas', CELL_W - 40, CELL_H - 90, { fill: C.app, radius: 12 })
  canvas.x = 20
  canvas.y = 70
  card.appendChild(canvas)
  return canvas
}

// —— 2. 状态一：运行失败 · 手动重试 ——
const c1 = cell(0, 0, '运行失败 · 手动重试', '失败如实呈现，不静默重试；给出重试与排查入口')
const av1 = frame('Avatar', 24, 24, { fill: '#EDE9FE', radius: 8 })
const av1t = text('创', 10, 'semibold', C.violet)
av1t.x = 6
av1t.y = 5
av1.appendChild(av1t)
av1.x = 20
av1.y = 18
c1.appendChild(av1)
const line1 = text('生成商品图时出错了。', 12, 'regular', C.text)
line1.x = 56
line1.y = 21
c1.appendChild(line1)

const failCard = frame('Fail card', 486, 128, { fill: C.white, border: C.redBorder, radius: 14, soft: true })
failCard.x = 20
failCard.y = 56
c1.appendChild(failCard)
ellipse(failCard, 'Icon bg', 16, 16, 20, '#FFE4E6')
const ex = text('!', 12, 'semibold', C.redDeep)
ex.x = 16 + Math.round((20 - ex.width) / 2)
ex.y = 18
failCard.appendChild(ex)
const ft = text('生成商品图失败', 12, 'medium', C.text)
ft.x = 44
ft.y = 17
failCard.appendChild(ft)
const fr = text('上游通道超时（504），本次运行已停止', 10, 'regular', C.subtle)
fr.x = 44
fr.y = 39
failCard.appendChild(fr)
rect(failCard, 'Divider', 16, 64, 454, 1, '#F4F4F5')
const retry = frame('Button / 重试', 64, 28, { radius: 999 })
retry.fills = gradient('#7C3AED', '#6D28D9')
retry.effects = CTA_SHADOW
const retryLabel = text('重试', 11, 'medium', C.white)
retryLabel.x = Math.round((64 - retryLabel.width) / 2)
retryLabel.y = 7
retry.appendChild(retryLabel)
retry.x = 16
retry.y = 82
failCard.appendChild(retry)
const logLink = text('查看运行日志', 11, 'medium', C.violet)
logLink.x = 92
logLink.y = 89
failCard.appendChild(logLink)
const noRetryNote = text('不会自动重试', 10, 'regular', C.subtle)
noRetryNote.x = 486 - 16 - noRetryNote.width
noRetryNote.y = 90
failCard.appendChild(noRetryNote)
const c1hint = text('错误原因按上游返回如实展示，便于排查；重试由用户手动触发。', 10, 'regular', C.subtle)
c1hint.x = 20
c1hint.y = 200
c1.appendChild(c1hint)

// —— 3. 状态二：余额不足 · 发送拦截 ——
const c2 = cell(1, 0, '余额不足 · 发送拦截', '发送前做余额校验；不足时禁用发送并给出充值入口')
const comp2 = frame('Composer / 余额不足', 486, 144, { fill: C.white, border: '#DDE3F0', radius: 16, shadow: true })
comp2.x = 20
comp2.y = 20
c2.appendChild(comp2)
const inp2 = text('再生成一张带场景的横版主图', 12, 'regular', C.text)
inp2.x = 14
inp2.y = 12
comp2.appendChild(inp2)
const bill2 = text('预计消耗 ≈0.8 元 · 账户余额 ¥0.30', 10, 'regular', C.redDeep)
bill2.x = 14
bill2.y = 38
comp2.appendChild(bill2)
const banner = frame('Banner', 458, 30, { fill: C.redSoft, radius: 8 })
banner.x = 14
banner.y = 58
comp2.appendChild(banner)
const bannerText = text('余额不足，无法发起本次运行', 11, 'regular', C.redDeep)
bannerText.x = 12
bannerText.y = 7
banner.appendChild(bannerText)
const topup = text('去充值', 11, 'medium', C.violet)
topup.x = 458 - 12 - topup.width
topup.y = 7
banner.appendChild(topup)
const attach2 = frame('Button / 添加附件', 96, 32, { fill: C.white, border: C.border, radius: 999 })
const attach2Label = text('添加附件', 11, 'medium', C.text)
attach2Label.x = 14
attach2Label.y = 9
attach2.appendChild(attach2Label)
attach2.x = 14
attach2.y = 98
comp2.appendChild(attach2)
const sendOff2 = frame('Button / 发送禁用', 64, 32, { fill: '#E4E4E7', radius: 999 })
const sendOff2Label = text('发送', 11, 'medium', '#A1A1AA')
sendOff2Label.x = Math.round((64 - sendOff2Label.width) / 2)
sendOff2Label.y = 9
sendOff2.appendChild(sendOff2Label)
sendOff2.x = 486 - 14 - 64
sendOff2.y = 98
comp2.appendChild(sendOff2)
const c2hint = text('不足时按钮保持禁用，避免无效提交；充值后回到可用态。', 10, 'regular', C.subtle)
c2hint.x = 20
c2hint.y = 180
c2.appendChild(c2hint)

// —— 4. 状态三：发送禁用 / 可用 ——
const c3 = cell(0, 1, '发送禁用 / 可用', '空输入保持禁用；有内容时变为品牌渐变可用态')
const la = text('空输入 · 发送禁用', 10, 'medium', C.subtle)
la.x = 20
la.y = 12
c3.appendChild(la)
const compA = frame('Composer / 空输入', 486, 84, { fill: C.white, border: '#DDE3F0', radius: 16, shadow: true })
compA.x = 20
compA.y = 28
c3.appendChild(compA)
const phA = text('描述你想创作的内容…', 12, 'regular', C.subtle)
phA.x = 14
phA.y = 12
compA.appendChild(phA)
const attachA = frame('Button / 添加附件', 88, 30, { fill: C.white, border: C.border, radius: 999 })
const attachALabel = text('添加附件', 11, 'medium', C.text)
attachALabel.x = 12
attachALabel.y = 8
attachA.appendChild(attachALabel)
attachA.x = 14
attachA.y = 42
compA.appendChild(attachA)
const sendOffA = frame('Button / 发送禁用', 60, 30, { fill: '#E4E4E7', radius: 999 })
const sendOffALabel = text('发送', 11, 'medium', '#A1A1AA')
sendOffALabel.x = Math.round((60 - sendOffALabel.width) / 2)
sendOffALabel.y = 8
sendOffA.appendChild(sendOffALabel)
sendOffA.x = 486 - 14 - 60
sendOffA.y = 42
compA.appendChild(sendOffA)
const lb = text('有内容 · 发送可用', 10, 'medium', C.subtle)
lb.x = 20
lb.y = 128
c3.appendChild(lb)
const compB = frame('Composer / 有内容', 486, 84, { fill: C.white, border: '#DDE3F0', radius: 16, shadow: true })
compB.x = 20
compB.y = 144
c3.appendChild(compB)
const inpB = text('给新品做一张白底主图', 12, 'regular', C.text)
inpB.x = 14
inpB.y = 12
compB.appendChild(inpB)
const attachB = frame('Button / 添加附件', 88, 30, { fill: C.white, border: C.border, radius: 999 })
const attachBLabel = text('添加附件', 11, 'medium', C.text)
attachBLabel.x = 12
attachBLabel.y = 8
attachB.appendChild(attachBLabel)
attachB.x = 14
attachB.y = 42
compB.appendChild(attachB)
const sendOnB = frame('Button / 发送', 60, 30, { radius: 999 })
sendOnB.fills = gradient('#7C3AED', '#6D28D9')
sendOnB.effects = CTA_SHADOW
const sendOnBLabel = text('发送', 11, 'medium', C.white)
sendOnBLabel.x = Math.round((60 - sendOnBLabel.width) / 2)
sendOnBLabel.y = 8
sendOnB.appendChild(sendOnBLabel)
sendOnB.x = 486 - 14 - 60
sendOnB.y = 42
compB.appendChild(sendOnB)
const c3hint = text('禁用态不响应点击；输入内容后立即恢复为品牌渐变可用态。', 10, 'regular', C.subtle)
c3hint.x = 20
c3hint.y = 244
c3.appendChild(c3hint)

// —— 5. 状态四：空状态 · 会话与产物 ——
const c4 = cell(1, 1, '空状态 · 会话与产物', '解释「为什么空」与「下一步做什么」，不用「暂无数据」占位')
const CARD_W = 243
const empty1 = frame('Empty / 会话', CARD_W, 170, { fill: C.white, border: C.border, radius: 14 })
empty1.x = 20
empty1.y = 30
c4.appendChild(empty1)
ellipse(empty1, 'Icon bg', Math.round((CARD_W - 40) / 2), 22, 40, C.violetSoft)
rect(empty1, 'Bubble', 113.5, 36, 16, 12, C.violet, 3)
triangle(empty1, 'Tail', 114.5, 45.5, 6, C.violet, 180)
ellipse(empty1, 'Dot 1', 116.5, 41, 2, C.white)
ellipse(empty1, 'Dot 2', 120.5, 41, 2, C.white)
ellipse(empty1, 'Dot 3', 124.5, 41, 2, C.white)
centered(empty1, '还没有创作会话', 12, 'medium', C.text, 76, CARD_W)
centered(empty1, '从广场挑一个 Agent 开始创作', 10, 'regular', C.subtle, 98, CARD_W)
const gotoBtn = frame('Button / 去 Agent 广场', 104, 30, { fill: C.white, border: C.border, radius: 999 })
const gotoLabel = text('去 Agent 广场', 11, 'medium', C.violet)
gotoLabel.x = Math.round((104 - gotoLabel.width) / 2)
gotoLabel.y = 8
gotoBtn.appendChild(gotoLabel)
gotoBtn.x = Math.round((CARD_W - 104) / 2)
gotoBtn.y = 122
empty1.appendChild(gotoBtn)

const empty2 = frame('Empty / 产物', CARD_W, 170, { fill: C.white, border: C.border, radius: 14 })
empty2.x = 20 + CARD_W + 20
empty2.y = 30
c4.appendChild(empty2)
ellipse(empty2, 'Icon bg', Math.round((CARD_W - 40) / 2), 22, 40, '#F4F4F5')
rect(empty2, 'Photo', 112.5, 35, 18, 14, '#D4D4D8', 3)
ellipse(empty2, 'Sun', 115.5, 38, 3.5, C.subtle)
triangle(empty2, 'Mountain', 119, 41, 8, C.subtle, 0)
centered(empty2, '产物会出现在这里', 12, 'medium', C.text, 76, CARD_W)
centered(empty2, '运行完成后可查看与下载', 10, 'regular', C.subtle, 98, CARD_W)
centered(empty2, '支持图片 / 视频 / 文字产物', 10, 'regular', C.subtle, 124, CARD_W)
const c4hint = text('空状态给出明确的下一步动作，而不是仅仅告知「没有内容」。', 10, 'regular', C.subtle)
c4hint.x = 20
c4hint.y = 216
c4.appendChild(c4hint)

// —— 6. 收尾 ——
await figma.setCurrentPageAsync(page)
figma.currentPage.selection = [wrap]
figma.viewport.scrollAndZoomIntoView([wrap])

return { frameId: wrap.id, pageId: page.id }
