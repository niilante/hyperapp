import { app, h } from "../src"
import { expectHTMLToBe } from "./util"

beforeEach(() => document.body.innerHTML = "")

test("default root is document.body", () => {
  app({
    view: _ => "foo"
  })

  expectHTMLToBe("foo")
})

test("root", () => {
  app({
    root: document.body.appendChild(document.createElement("main")),
    view: _ => h("div", {}, "foo")
  })

  expectHTMLToBe(`
    <main>
      <div>
        foo
      </div>
    </main>
  `)
})

test("non-empty root", () => {
  const main = document.createElement("main")
  main.appendChild(document.createElement("span"))

  app({
    root: document.body.appendChild(main),
    view: _ => h("div", {}, "foo")
  })

  expectHTMLToBe(`
    <main>
      <span>
      </span>
      <div>
        foo
      </div>
    </main>
  `)
})

test("mutated root", () => {
  const main = document.createElement("main")

  app({
    root: document.body.appendChild(main),
    state: "foo",
    actions: {
      bar: state => "bar"
    },
    events: {
      onLoad: [
        (_, actions) => {
          expectHTMLToBe(`
            <main>
              <div>
                foo
              </div>
            </main>
          `)

          main.insertBefore(document.createElement("header"), main.firstChild)
          main.appendChild(document.createElement("footer"))

          actions.bar()

          expectHTMLToBe(`
            <main>
              <header>
              </header>
              <div>
                bar
              </div>
              <footer>
              </footer>
            </main>
          `)
        }
      ]
    },
    view: state => h("div", {}, state)
  })
})
