import { app, h } from "../src"
import { expectHTMLToBe } from "./util"

beforeEach(() => document.body.innerHTML = "")

test("DOMContentLoaded", done => {
  Object.defineProperty(document, "readyState", {
    writable: true
  })

  window.document.readyState = "loading"

  app({
    events: {
      onLoad: [done]
    }
  })

  window.document.readyState = "complete"

  const event = document.createEvent("Event")
  event.initEvent("DOMContentLoaded", true, true)
  window.document.dispatchEvent(event)
})

test("render a state", () => {
  app({
    state: "foo",
    view: state => h("div", {}, state)
  })

  expectHTMLToBe(`
    <div>
      foo
    </div>
  `)
})

test("render a state with a loop", () => {
  app({
    state: ["foo", "bar", "baz"],
    view: state => h("ul", {}, state.map(i => h("li", {}, i)))
  })

  expectHTMLToBe(`
    <ul>
      <li>foo</li>
      <li>bar</li>
      <li>baz</li>
    </ul>
  `)
})

test("render an svg element", () => {
  app({
    view: _ => h("svg", { id: "foo" }, "bar")
  })

  const elm = document.getElementById("foo")
  expect(elm.namespaceURI).toBe("http://www.w3.org/2000/svg")
})

test("render svg elements recursively", () => {
  const SVG_NS = "http://www.w3.org/2000/svg"

  app({
    view: _ => h("div", {}, [
      h("p", { id: "foo" }, "foo"),
      h("svg", { id: "bar" }, [
        h("quux", {}, [
          h("beep", {}, [
            h("ping", {}),
            h("pong", {})
          ]),
          h("bop", {}),
          h("boop", {}, [
            h("ping", {}),
            h("pong", {})
          ])
        ]),
        h("xuuq", {}, [
          h("beep", {}),
          h("bop", {}, [
            h("ping", {}),
            h("pong", {})
          ]),
          h("boop", {})
        ])
      ]),
      h("p", { id: "baz" }, "baz")
    ])
  })

  expect(document.getElementById("foo").namespaceURI).not.toBe(SVG_NS)
  expect(document.getElementById("baz").namespaceURI).not.toBe(SVG_NS)

  const svg = document.getElementById("bar")
  expect(svg.namespaceURI).toBe(SVG_NS)
  expectChildren(svg)

  function expectChildren(svgElement) {
    Array.from(svgElement.childNodes).forEach(node =>
      expectChildren(node, expect(node.namespaceURI).toBe(SVG_NS)))
  }
})

test("toggle class attributes", () => {
  app({
    state: true,
    view: state => h("div", state ? { class: "foo" } : {}, "bar"),
    actions: {
      toggle: state => !state
    },
    events: {
      onLoad: [
        (_, actions) => {
          expectHTMLToBe(`
            <div class="foo">
              bar
            </div>
          `)

          actions.toggle()

          expectHTMLToBe(`
            <div>
              bar
            </div>
          `)
        }
      ]
    }
  })
})

test("update/remove element data", () => {
  app({
    state: false,
    actions: {
      toggle: state => !state
    },
    view: state => h("div", state
      ?
      {
        id: "xuuq",
        foo: true,
        style: {
          width: "100px",
          height: "200px"
        }
      }
      :
      {
        id: "quux",
        class: "foo",
        style: {
          color: "red",
          height: "100px"
        },
        foo: true,
        baz: false
      }, "bar"
    ),
    events: {
      onLoad: [
        (_, actions) => {
          expectHTMLToBe(`
            <div id="quux" class="foo" style="color: red; height: 100px;" foo="true">
              bar
            </div>
          `)

          actions.toggle()

          expectHTMLToBe(`
            <div id="xuuq" style="height: 200px; width: 100px;" foo="true">
              bar
            </div>
          `)
        }
      ]
    }
  })
})

test("sync selectionStart/selectionEnd in text inputs after update", () => {
  app({
    state: "foo",
    actions: {
      setText: state => "bar"
    },
    view: state => h("input", { id: "foo", value: state }),
    events: {
      onLoad: [
        (_, actions) => {
          const input = document.getElementById("foo")

          expect(input.selectionStart).toBe(0)
          expect(input.selectionEnd).toBe(0)

          input.setSelectionRange(2, 2)

          actions.setText()

          expect(input.selectionStart).toBe(2)
          expect(input.selectionEnd).toBe(2)
        }
      ]
    }
  })
})
