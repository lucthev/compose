'use strict'

import Serialize from 'serialize-elem'

export default class Paragraph extends Serialize {
  constructor (element) {
    super(element)

    this.element = null
  }

  toElement () {
    let elem = super.toElement()
    this.element = elem
    return elem
  }
}
