import { app, h } from "../src"
import { expectHTMLToBe } from "./util"

beforeEach(() => document.body.innerHTML = "")

test("update the state to render the view", () => {
  app({
    state: 1,
    view: state => h("div", {}, state),
    actions: {
      add: state => state + 1
    },
    events: {
      onLoad: [
        (_, actions) => actions.add()
      ]
    }
  })

  expectHTMLToBe(`
    <div>
      2
    </div>
  `)
})

test("update the state async", done => {
  app({
    state: 1,
    view: state => h("div", {}, state),
    actions: {
      change: (state, data) => state + data,
      delayAndChange: (state, data, actions) => {
        setTimeout(_ => {
          actions.change(data)

          expectHTMLToBe(`
            <div>
              ${state + data}
            </div>
          `)

          done()
        }, 20)
      }
    },
    events: {
      onLoad: [
        (_, actions) => actions.delayAndChange(10)
      ]
    }
  })
})

test("return a promise", done => {
  app({
    state: 1,
    view: state => h("div", {}, state),
    actions: {
      change: (state, data) => state + data,
      delay: _ => new Promise(resolve => setTimeout(_ => resolve(), 20)),
      delayAndChange: (state, data, actions) => {
        actions.delay().then(_ => {
          actions.change(data)

          expectHTMLToBe(`
            <div>
              ${state + data}
            </div>
          `)

          done()
        })
      }
    },
    events: {
      onLoad: [
        (_, actions) => actions.delayAndChange(10)
      ]
    }
  })
})

test("namespaces/nested actions", () => {
  app({
    state: true,
    view: _ => h("div", {}, ""),
    actions: {
      foo: {
        bar: {
          baz: (state, data) => {
            expect(state).toBe(true)
            expect(data).toBe("foo.bar.baz")
          }
        }
      }
    },
    events: {
      onLoad: [
        (_, actions) => actions.foo.bar.baz("foo.bar.baz")
      ]
    }
  })
})
