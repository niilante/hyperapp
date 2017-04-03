import { app, h } from "../src"
import { expectHTMLToBe } from "./util"

beforeEach(() => document.body.innerHTML = "")

test("onLoad", () => {
  app({
    state: 1,
    actions: {
      step: state => state + 1
    },
    events: {
      onLoad: [
        (_, actions) => actions.step(),
        (_, actions) => actions.step(),
        state => expect(state).toBe(3)
      ]
    }
  })
})

test("onAction/onUpdate/onRender", done => {
  app({
    state: "foo",
    view: state => h("div", {}, state),
    actions: {
      set: (_, data) => data
    },
    events: {
      onLoad: [
        (_, actions) => actions.set("bar")
      ],
      onAction: [
        (_, action, data) => {
          expect(action).toBe("set")
          expect(data).toBe("bar")
        }
      ],
      onUpdate: [
        (oldState, newState, data) => {
          expect(oldState).toBe("foo")
          expect(newState).toBe("bar")
          expect(data).toBe("bar")
        }
      ],
      onRender: [
        (state, _, view) => {
          if (state === "foo") {
            expect(view("bogus")).toEqual({
              tag: "div",
              data: {},
              children: ["bogus"]
            })

            return view

          } else {
            expect(state).toBe("bar")
            done()

            return view
          }
        }
      ]
    }
  })
})

test("onAction and nested actions", done => {
  app({
    state: "foo",
    actions: {
      foo: {
        bar: {
          baz: {
            set: (_, data) => data
          }
        }
      }
    },
    events: {
      onLoad: [
        (_, actions) => actions.foo.bar.baz.set("baz")
      ],
      onAction: [
        (_, action, data) => {
          expect(action).toBe("foo.bar.baz.set")
          expect(data).toBe("baz")
          done()
        }
      ]
    }
  })
})

test("onError", done => {
  app({
    events: {
      onLoad: [
        (state, actions, error) => {
          error("foo")
        }
      ],
      onError: (state, error) => {
        expect(error).toBe("foo")
        done()
      }
    }
  })
})

test("throw by default if onError is undefined", () => {
  app({
    events: {
      onLoad: [
        (state, actions, error) => {
          try {
            error("foo")
          } catch (err) {
            expect(err).toBe("foo")
          }
        }
      ]
    }
  })
})
