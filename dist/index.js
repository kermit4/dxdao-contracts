
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dxdao-contracts.cjs.production.min.js')
} else {
  module.exports = require('./dxdao-contracts.cjs.development.js')
}
