var i
var node
var children
var stack = []

export default function (tag, data) {
  var canConcat
  var oldCanConcat

  children = []
  i = arguments.length

  while (i-- > 2) {
    stack.push(arguments[i])
  }

  while (stack.length) {
    if (Array.isArray(node = stack.pop())) {
      i = node.length

      while (i--) {
        stack.push(node[i])
      }
    } else if (node != null && node !== true && node !== false) {
      if (typeof node === "number") {
        node = node + ""
      }

      canConcat = typeof node === "string"

      if (canConcat && oldCanConcat) {
        children[children.length - 1] += node
      } else {
        children.push(node)
        oldCanConcat = canConcat
      }
    }
  }

  return typeof tag === "string"
    ? {
      tag: tag,
      data: data || {},
      children: children
    }
    : tag(data, children)
}
