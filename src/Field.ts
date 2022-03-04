import { observable, action, computed, makeObservable } from 'mobx'
import isFinite from 'lodash/isFinite'
import moment from 'moment'
import { Type } from './types'
import numberParser from './numberParser'

const DATE_FORMAT = 'L'

export default class Field {
  type: Type
  value: any
  errors: string[] | {} | null
  originalValue: any

  constructor(value: any, type: Type) {
    this.type = type
    this.mapAndSet(value)
    this.originalValue = this.value
    this.errors = null

    makeObservable(this, {
      value: observable,
      errors: observable,
      originalValue: observable,
      isDirty: computed,
      mapAndSet: action,
      set: action,
      clean: action,
      setErrors: action
    })
  }

  /**
   * Converts the incoming value
   * before being persisted in the field
   */
  _mapIn(value: any | null): any {
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
  _mapOut(): any | null {
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
        return number != null && isFinite(number) ? Math.round(number) : null
      case 'cents':
        const cents = numberParser(
          typeof value === 'number' ? value.toString() : String(value)
        )

        return cents != null && isFinite(cents) ? Math.round(cents * 100) : null
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

  get isDirty(): boolean {
    return this.originalValue !== this.value
  }

  mapAndSet(value: any): void {
    this.value = this._mapIn(value)
  }

  set(value: any): void {
    this.value = value
  }

  clean(): void {
    this.originalValue = this.value
  }

  reset(): void {
    this.value = this.originalValue
  }

  setErrors(errors: string[] | {} | null): void {
    this.errors = errors
  }
}
