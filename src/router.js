export default function (app) {
  return {
    actions: {
      router: {
        match: function (state, data) {
          return match(data)
        },
        go: function (state, data, actions) {
          history.pushState({}, "", data)
          actions.router.match(data)
        }
      }
    },
    events: {
      onLoad: function (state, actions) {
        route()
        addEventListener("popstate", route)

        function route() {
          actions.router.match(location.pathname)
        }
      },
      onRender: function (state, actions, routes, emit) {
        return routes[emit("onRoute", state.router.match)]
      }
    }
  }

  function match(data) {
    var match
    var params = {}

    for (var route in app.view) {
      var keys = []

      if (route !== "*") {
        data.replace(new RegExp("^" + route
          .replace(/\//g, "\\/")
          .replace(/:([A-Za-z0-9_]+)/g, function (_, key) {
            keys.push(key)

            return "([-A-Za-z0-9_]+)"
          }) + "/?$", "g"), function () {

            for (var i = 1; i < arguments.length - 2; i++) {
              params[keys.shift()] = arguments[i]
            }

            match = route
          })
      }

      if (match) {
        break
      }
    }

    return {
      router: {
        match: match || "*",
        params: params
      }
    }
  }
}





