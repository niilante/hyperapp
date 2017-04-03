import { app, h } from "../src"

test("onCreate", done => {
  app({
    state: 1,
    view: state => h("div", {
      onCreate: e => {
        expect(state).toBe(1)
        done()
      }
    })
  })
})

test("onUpdate", done => {
  app({
    state: 1,
    view: state => h("div", {
      onUpdate: e => {
        expect(state).toBe(2)
        done()
      }
    }),
    actions: {
      add: state => state + 1
    },
    events: {
      onLoad: [
        (_, actions) => actions.add()
      ]
    }
  })
})

test("onRemove", done => {
  const treeA = h("ul", {},
    h("li", {}, "foo"),
    h("li", {
      onRemove: _ => {
        done()
      }
    }, "bar"))

  const treeB = h("ul", {}, h("li", {}, "foo"))

  app({
    state: true,
    view: _ => _ ? treeA : treeB,
    actions: {
      toggle: state => !state
    },
    events: {
      onLoad: [
        (_, actions) => actions.toggle()
      ]
    }
  })
})
