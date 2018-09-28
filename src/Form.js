// @flow
import { observable, action, runInAction, computed, toJS } from 'mobx'
import _ from 'lodash'
import Field from './Field'
import type { Type } from './types'
import flat from 'flat'

type CreateOptions = {
  optimistic?: boolean,
  onProgress?: () => any
}

type SaveOptions = {
  optimistic?: boolean,
  patch?: boolean,
  onProgress?: () => any
}

type Schema = { [key: string]: Type | {} } // TODO: Use recursive types when tcomb supports them
type Values = { [key: string]: any }
type Errors = { [key: string]: Array<string> | {} } // TODO: Use recursive types when tcomb supports them

interface Collection {
  create(data: Values, options: CreateOptions): Promise<*>;
}

interface Model {
  save(data: Values, options: SaveOptions): Promise<*>;
}

const buildFields = (values: Values, schema: Schema) =>
  _.omitBy(
    _.mapValues(
      flat(schema),
      (value: Type | {}, attribute: string) =>
        typeof value === 'string'
          ? new Field(_.get(values, attribute), value)
          : null
    ),
    _.isNull
  )

export default class Form {
  @observable fields: { [key: string]: Field }

  constructor (values: Values, schema: Schema) {
    this.fields = buildFields(values, schema)
  }

  data (): Values {
    return flat.unflatten(
      _.mapValues(this.fields, (field: Field) => {
        return field._mapOut()
      })
    )
  }

  has (attribute: string): boolean {
    return Boolean(this.fields[attribute])
  }

  get (attribute: string): Field {
    const field = this.fields[attribute]
    if (!field) throw new Error(`Field "${attribute}" not found`)
    return field
  }

  /**
   * Cleans all the forms by reseting their original
   * values
   */
  @action cleanAll (): void {
    _.forEach(this.fields, (field: Field) => {
      field.clean()
    })
  }

  /**
   * Resets all the error fields
   */
  @action resetErrors (): void {
    _.forEach(this.fields, (field: Field) => {
      field.setErrors(null)
    })
  }

  /**
   * Sets the errors with a given
   * hash of attribute -> error
   */
  @action setErrors (errors: Errors) {
    this.resetErrors()

    const flatErrors: Errors = flat(errors, { safe: true })
    _.forEach(flatErrors, (error: Array<string>, attribute: string) => {
      if (this.has(attribute)) {
        this.get(attribute).setErrors(error)
      }
    })
  }

  /**
   * Checks if all fields have a value.
   * @type {boolean}
   */
  @computed get isComplete (): boolean {
    return !_.some(this.fields, (field: Field) => {
      switch (field.type) {
        case 'number':
        case 'cents':
        case 'boolean':
          return field.value === '' || _.isNull(field.value)
        default:
          return !field.value
      }
    })
  }

  /**
   * Return the values from the form as they are
   *
   * TODO: Use Computed
   */
  @computed get values (): Values {
    return _.mapValues(this.fields, (field: Field) => field.value)
  }

  /**
   * Return whether the form is dirty
   */
  @computed get isDirty (): boolean {
    return _.some(this.fields, (field: Field): boolean => field.isDirty)
  }

  /**
   * Reset values
   */
  @action resetValues () {
    _.forEach(this.fields, (field: Field) => field.set(''))
  }

  /**
   * Sets the fields values with a given
   * hash of attribute -> value
   */
  @action setValues (values: Values) {
    _.forEach(values, (value: any, attribute: string) => {
      if (!this.has(attribute)) return

      const field = this.get(attribute)
      field.setErrors(null)
      field.mapAndSet(value)
    })
  }

  /**
   * Creates a new model on the given collection
   */
  create (
    collection: Collection,
    options: CreateOptions = { optimistic: true }
  ): Promise<*> {
    return this.handleErrors(() => collection.create(this.data(), options))
  }

  /**
   * Saves the model with the given fields
   */
  save (
    model: Model,
    options: SaveOptions = { optimistic: true, patch: true }
  ): Promise<*> {
    return this.handleErrors(async () => model.save(this.data(), options))
  }

  @action async handleErrors (fn: () => Promise<*>): Promise<*> {
    let values

    try {
      values = toJS(await fn())
    } catch (errors) {
      runInAction('handleErrors-error', () => {
        this.setErrors(toJS(errors))
        this.cleanAll()
      })

      throw errors
    }

    runInAction('handleErrors-done', () => {
      this.setValues(values)
      this.resetErrors()
      this.cleanAll()
    })

    return values
  }
}
