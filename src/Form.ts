import { action, computed, toJS, makeObservable } from 'mobx'
import omitBy from 'lodash/omitBy'
import mapValues from 'lodash/mapValues'
import get from 'lodash/get'
import isNull from 'lodash/isNull'
import isObject from 'lodash/isObject'
import forEach from 'lodash/forEach'
import some from 'lodash/some'
import Field from './Field'
import flat from 'flat'
import { Type } from './types'

type CreateOptions = {
  optimistic?: boolean,
  onProgress?: () => any
}

type SaveOptions = {
  optimistic?: boolean,
  patch?: boolean,
  onProgress?: () => any
}

type Schema = { [key: string]: any }
type Values = { [key: string]: any }
type Errors = { [key: string]: string[] | null }

interface Collection {
  create(data: Values, options: CreateOptions): Promise<any>;
}

interface Model {
  save(data: Values, options: SaveOptions): Promise<any>;
}

const buildFields = (values: Values, schema: Schema) =>
  omitBy(
    mapValues(
      flat(schema),
      (value, attribute) =>
        isObject(value)
          ? null
          : new Field(get(values, attribute), value as Type)
    ),
    isNull
  )

export default class Form {
  fields: { [key: string]: Field }

  constructor(values: Values, schema: Schema) {
    this.fields = buildFields(values, schema)

    makeObservable(this, {
      cleanAll: action,
      resetErrors: action,
      setErrors: action,
      resetValues: action,
      setValues: action,
      handleErrors: action,
      isComplete: computed,
      values: computed,
      isDirty: computed
    })
  }

  data(): Values {
    return flat.unflatten(
      mapValues(this.fields, (field: Field) => field._mapOut())
    )
  }

  has(attribute: string): boolean {
    return Boolean(this.fields[attribute])
  }

  get(attribute: string): Field {
    const field = this.fields[attribute]
    if (!field) throw new Error(`Field "${attribute}" not found`)

    return field
  }

  /**
   * Cleans all the forms by changing their original
   * values to correspond to their current values
   */
  cleanAll(): void {
    forEach(this.fields, (field: Field) =>
      field.clean()
    )
  }

  /**
   * Reset all the forms to their original
   * values thereby discarding all changes made
   */

  resetAll(): void {
    forEach(this.fields, (field: Field) =>
      field.reset()
    )
  }

  /**
   * Resets all the error fields
   */
  resetErrors(): void {
    forEach(this.fields, (field: Field) => {
      field.setErrors(null)
    })
  }

  /**
   * Sets the errors with a given
   * hash of attribute -> error
   */
  setErrors(errors: Errors) {
    this.resetErrors()

    const flatErrors: Errors = flat(errors, { safe: true })
    forEach(flatErrors, (error, attribute) => {
      if (this.has(attribute)) {
        this.get(attribute).setErrors(error)
      }
    })
  }

  /**
   * Checks if all fields have a value.
   */
  get isComplete(): boolean {
    return !some(this.fields, (field: Field) => {
      switch (field.type) {
        case 'number':
        case 'cents':
        case 'boolean':
          return field.value === '' || isNull(field.value)
        default:
          return !field.value
      }
    })
  }

  /**
   * Return the values from the form as they are
   */
  get values(): Values {
    return mapValues(this.fields, (field: Field) => field.value)
  }

  /**
   * Return whether the form is dirty
   */
  get isDirty(): boolean {
    return some(this.fields, (field: Field): boolean => field.isDirty)
  }

  /**
   * Reset values
   */
  resetValues() {
    forEach(this.fields, (field: Field) => field.set(''))
  }

  /**
   * Sets the fields values with a given
   * hash of attribute -> value
   */
  setValues(values: Values) {
    forEach(values, (value: any, attribute: string) => {
      if (!this.has(attribute)) return

      const field = this.get(attribute)
      field.setErrors(null)
      field.mapAndSet(value)
    })
  }

  /**
   * Creates a new model on the given collection
   */
  create(
    collection: Collection,
    options: CreateOptions = { optimistic: true }
  ): Promise<any> {
    return this.handleErrors(() => collection.create(this.data(), options))
  }

  /**
   * Saves the model with the given fields
   */
  save(
    model: Model,
    options: SaveOptions = { optimistic: true, patch: true }
  ): Promise<any> {
    return this.handleErrors(async () => model.save(this.data(), options))
  }

  async handleErrors<T = unknown>(fn: () => Promise<T>): Promise<T> {
    let values: T

    try {
      values = toJS(await fn())
    } catch (error: any) {
      const { payload } = error

      action('handleErrors-error', () => {
        this.setErrors(toJS(payload || error))
        this.cleanAll()
      })()

      throw error
    }

    action('handleErrors-done', () => {
      this.setValues(values)
      this.resetErrors()
      this.cleanAll()
    })()

    return values
  }
}
