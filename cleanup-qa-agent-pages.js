const page = target.parent
if (!page || page.type !== 'PAGE') throw new Error('校验目标不在 Page 中')
const cloneIds = ['20:2410', '20:2645', '20:2771']
const clones = []
for (const id of cloneIds) {
  const node = await figma.getNodeByIdAsync(id)
  if (!node || node.removed || node.parent !== page || !node.name.startsWith('QA Preview /')) {
    throw new Error(`QA 节点身份不匹配，停止清理：${id}`)
  }
  clones.push(node)
}
const removed = clones.map((node) => ({ id: node.id, name: node.name }))
clones.forEach((node) => node.remove())

const agentPage = figma.root.children.find((node) => node.type === 'PAGE' && node.name === 'Agent 01 · Agent 广场')
if (!agentPage) throw new Error('找不到 Agent 广场 Page')
await figma.setCurrentPageAsync(agentPage)
const frame = agentPage.children.find((node) => node.type === 'FRAME')
if (!frame) throw new Error('Agent 广场 Page 中没有 Frame')
figma.currentPage.selection = [frame]
figma.viewport.scrollAndZoomIntoView([frame])

const pages = figma.root.children
  .filter((node) => node.type === 'PAGE' && node.name.startsWith('Agent '))
  .map((node) => ({ id: node.id, name: node.name, childCount: node.children.length }))
return { removed, pages, currentPage: figma.currentPage.name }
