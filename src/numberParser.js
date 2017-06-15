// @flow
import _ from 'lodash'

/**
 * Support any input that may contains decimals
 * and other stuff. Check the test cases to understand
 * which cases we handle.
 *
 * Improve this if you find how.
 */
export default function numberParser (str: string): ?number {
  const isNegative = str.match(/^-.*/)
  const parts = str.split(/[.,]/).map(str => str.replace(/\D/g, ''))

  let decimals = parts.length > 1 && _.last(parts).length < 3
    ? Number(parts.pop())
    : null

  if (decimals && decimals < 10) decimals = decimals * 10

  const processedString = parts.join('')
  const number = processedString ? Number(processedString) : null

  if (!_.isFinite(number)) return null

  const total = number + (decimals || 0) / 100

  return isNegative ? -total : total
}
