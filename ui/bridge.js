export function postPluginMessage(pluginMessage, origin = '*') {
  parent.postMessage({ pluginMessage }, origin);
}

export function exposeGlobals(bindings, target = window) {
  Object.assign(target, bindings);
}
