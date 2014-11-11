'use strict';

function TreeMatcher (_chai, utils) {
  var Assertion = _chai.Assertion

  Assertion.addMethod('tree', function (tree) {
    var elem = this._obj

    new Assertion(elem).to.not.be.undefined
    new Assertion(tree).to.not.be.undefined

    if (tree.name)
      new Assertion(elem.nodeName.toLowerCase())
        .to.equal(tree.name.toLowerCase())

    if (tree.classes) {
      tree.classes.forEach(function (className) {
        var positive = 'expected #{this} to have class #{exp}',
            negative = 'expected #{this} not to have class #{exp}',
            not

        if (className[0] === '!') {
          not = true
          className = className.substr(1)
        }

        this.assert(
          not ? !elem.classList.contains(className) :
                elem.classList.contains(className),
          not ? negative : positive,
          not ? positive : negative,
          className
        )
      }, this)
    }

    if (tree.children) {
      this.assert(
        elem.childNodes.length === tree.children.length,
        'expected #{this} to have #{exp} children but it had #{act}',
        'expected #{this} not to have #{exp} children',
        tree.children.length,
        elem.childNodes.length
      )

      tree.children.forEach(function (child, i) {
        new Assertion(elem.childNodes[i]).to.have.tree(tree.children[i])
      })
    }

    if (tree.html)
      new Assertion(elem.innerHTML).to.equal(tree.html)
  })
}

function ChildMatcher (_chai, utils) {
  var Assertion = _chai.Assertion

  Assertion.addMethod('children', function (arr) {
    var elem = this._obj

    this.assert(
      elem.childNodes.length === arr.length,
      'expected #{this} to have #{exp} children but it had #{act}',
      'expected #{this} not to have #{exp} children',
      arr.length,
      elem.childNodes.length
    )

    arr.forEach(function (child, i) {
      new Assertion(elem.childNodes[i]).to.have.tree(child)
    })
  })
}

function Superset (_chai, utils) {
  var Assertion = _chai.Assertion

  Assertion.addMethod('superset', function (subset) {
    var superset = this._obj

    Object.keys(subset).forEach(function (key) {
      if (typeof subset[key] === 'object' && !Array.isArray(subset[key]))
        new Assertion(superset[key]).to.superset(subset[key])
      else
        new Assertion(superset[key]).to.deep.equal(subset[key])
    }, this)
  })
}
