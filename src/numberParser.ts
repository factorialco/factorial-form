import last from 'lodash/last'

/**
 * Support any input that may contains decimals
 * and other stuff. Check the test cases to understand
 * which cases we handle.
 *
 * Improve this if you find how.
 */
export default function numberParser(str: string): number | null {
  const cleanString = str.replace(/[^\d,.-]/g, '')
  const sign = cleanString.charAt(0) === '-' ? '-' : '+'
  const parts = cleanString.split(/[.,]/)
  const decimals = parts.length > 1 && last(parts).length < 3 ? parts.pop() : null
  const number = parts
    .join('')
    .replace(/[.,]\d*$/, '')
    .replace(/\D/g, '')

  return Number(sign + number + (decimals ? '.' + decimals : ''))
}
