(function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define('Quill', [], factory)
  else root.Quill = factory()
}(this, function () {
