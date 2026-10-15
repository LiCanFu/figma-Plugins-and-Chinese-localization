// 只读：枚举页面与 Agent 设计稿 Frame，输出全部文本与关键结构
const pages = figma.root.children.filter((n) => n.type === 'PAGE').map((p) => ({
  id: p.id,
  name: p.name,
  frames: p.children.filter((c) => c.type === 'FRAME').map((f) => ({
    id: f.id, name: f.name, x: Math.round(f.x), y: Math.round(f.y),
    w: Math.round(f.width), h: Math.round(f.height),
  })),
}))

function hex(fills) {
  if (!Array.isArray(fills) || !fills.length) return null
  const f = fills[0]
  if (f.type !== 'SOLID') return null
  const c = f.color
  return '#' + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

const frames = []
for (const p of pages) {
  for (const f of p.frames) {
    if (!f.name.startsWith('Agent Studio /')) continue
    const node = await figma.getNodeByIdAsync(f.id)
    if (!node) continue
    const texts = []
    const sections = []
    for (const child of node.children) {
      sections.push({ id: child.id, type: child.type, name: child.name, w: Math.round(child.width), h: Math.round(child.height) })
    }
    node.findAll((n) => n.type === 'TEXT').forEach((t) => {
      const box = t.absoluteBoundingBox
      texts.push({
        id: t.id,
        text: t.characters.slice(0, 90),
        x: box ? Math.round(box.x - (node.absoluteBoundingBox ? node.absoluteBoundingBox.x : 0)) : null,
        y: box ? Math.round(box.y - (node.absoluteBoundingBox ? node.absoluteBoundingBox.y : 0)) : null,
        w: box ? Math.round(box.width) : null,
        size: t.fontSize,
        font: t.fontName && typeof t.fontName === 'object' ? t.fontName.style : String(t.fontName),
        fill: hex(t.fills),
      })
    })
    frames.push({ id: f.id, pageId: p.id, pageName: p.name, name: f.name, w: f.w, h: f.h, sections, texts })
  }
}

return { pages: pages.map((p) => ({ id: p.id, name: p.name, frameCount: p.frames.length, frames: p.frames.map((f) => f.name) })), frames }
