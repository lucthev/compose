(function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define('Venti', [], factory)
  else root.Venti = factory()
}(this, function () {
