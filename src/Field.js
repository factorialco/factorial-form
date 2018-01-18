// @flow
import { observable, action, computed } from 'mobx'
import _ from 'lodash'
import moment from 'moment'
import type { Type } from './types'
import numberParser from './numberParser'

const DATE_FORMAT = 'DD/MM/YYYY'

export default class Field {
  type: Type
  @observable value: any = null
  @observable errors: ?Array<string> = null
  @observable originalValue: any = null

  constructor (value: any, type: Type) {
    this.type = type

    this.mapAndSet(value)
    this.clean()
    this.setErrors(null)
  }

  /**
   * Converts the incoming value
   * before being persisted in the field
   */
  _mapIn (value: ?any): any {
    if (value == null) return ''

    switch (this.type) {
      case 'timestamp':
        if (typeof value !== 'number') throw new Error('Fields expects a number')
        return moment.unix(value).format(DATE_FORMAT)
      case 'date':
        if (typeof value !== 'string') throw new Error('Fields expects an string')
        return moment(value, 'YYYY-MM-DD', true).format(DATE_FORMAT)
      case 'number':
        if (typeof value !== 'number') throw new Error('Fields expects a number')
        return value.toString()
      case 'cents':
        if (typeof value !== 'number') throw new Error('Fields expects a number')
        return (value / 100).toString()
      case 'boolean':
      case 'string':
      case 'file':
      case 'any':
        return value
      default:
        throw new Error(`unknown field type: ${this.type}`)
    }
  }

  /**
   * Converts back the value from the field
   */
  _mapOut (): ?any {
    const value = typeof this.value === 'string'
      ? this.value.trim()
      : this.value

    switch (this.type) {
      case 'timestamp':
        return moment.utc(String(value), DATE_FORMAT).unix() || null
      case 'date':
        const date = moment(String(value), DATE_FORMAT, true)
        return date.isValid() ? date.format('YYYY-MM-DD') : null
      case 'number':
        const number = numberParser(
          typeof value === 'number' ? value.toString() : String(value)
        )
        return number != null && _.isFinite(number) ? Math.round(number) : null
      case 'cents':
        const cents = numberParser(
          typeof value === 'number' ? value.toString() : String(value)
        )

        return cents != null && _.isFinite(cents) ? Math.round(cents * 100) : null
      case 'boolean':
        return value
      case 'string':
      case 'file':
      case 'any':
        return value || null
      default:
        throw new Error(`unknown field type: ${this.type}`)
    }
  }

  @computed get isDirty (): boolean {
    return this.originalValue !== this.value
  }

  @action mapAndSet (value: any): void {
    this.value = this._mapIn(value)
  }

  @action set (value: any): void {
    switch (this.type) {
      case 'number':
      case 'cents':
        this.value = value.replace(/[^\d\.,]/g, '')
        break
      default:
        this.value = value
    }
  }

  @action clean (): void {
    this.originalValue = this.value
  }

  @action setErrors (errors: ?Array<string>): void {
    this.errors = errors
  }
}
