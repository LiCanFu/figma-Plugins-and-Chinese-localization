// 只读：输出两帧的图层树（含主内容区定位）
const ids = ['18:18', '18:297']
const out = []
for (const id of ids) {
  const node = await figma.getNodeByIdAsync(id)
  if (!node) { out.push({ id, missing: true }); continue }
  const walk = (n, depth) => {
    const item = {
      id: n.id, type: n.type, name: n.name,
      x: Math.round(n.x), y: Math.round(n.y),
      w: Math.round(n.width), h: Math.round(n.height),
    }
    if ('layoutMode' in n && n.layoutMode !== 'NONE') item.layout = n.layoutMode
    if (depth > 0 && 'children' in n) item.children = n.children.map((c) => walk(c, depth - 1))
    return item
  }
  out.push(walk(node, 3))
}
return out
