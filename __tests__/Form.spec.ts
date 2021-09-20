import { Form } from '../src'

const attributes = {
  id: 1,
  name: 'paco',
  active: true,
  age: 0,
  price: 0,
  country_metadata: {
    social_security: '1234'
  }
}

const types = {
  id: 'number',
  name: 'string',
  age: 'number',
  price: 'cents',
  active: 'boolean',
  country_metadata: {
    social_security: 'string'
  }
}

describe('buildFields', () => {
  it('with a valid type it should include that field', () => {
    const form = new Form({ foo: 'bar' }, { foo: 'string' })
    expect(form.get('foo').value).toBe('bar')
  })

  it('with an nested object it should include that field flattened', () => {
    const form = new Form(
      { foo: { bar: 'qux' } },
      { foo: { bar: 'string' } }
    )
    expect(form.get('foo.bar').value).toBe('qux')
  })
})

let form: any

describe('Form', () => {
  beforeEach(() => {
    form = new Form(attributes, types)
  })

  describe('data', () => {
    it('returns all the serialized information from the form', () => {
      expect(form.data()).toEqual(attributes)
    })
  })

  describe('values', () => {
    it('returns all the current values of the form', () => {
      expect(form.values).toEqual({
        id: '1',
        name: 'paco',
        active: true,
        age: '0',
        price: '0',
        'country_metadata.social_security': '1234'
      })
    })
  })

  describe('isComplete', () => {
    describe('when a field is missing', () => {
      beforeEach(() => form.setValues({ name: '' }))
      it('returns false', () => {
        expect(form.isComplete).toBe(false)
      })
    })

    describe('when a boolean field is missing', () => {
      beforeEach(() => {
        const newAttr = {
          id: 1,
          name: 'paco',
          age: 0,
          price: 0,
          country_metadata: {
            social_security: '1234'
          }
        }
        form = new Form(newAttr, types)
      })
      it('returns false', () => {
        expect(form.isComplete).toBe(false)
      })
    })

    describe('when a boolean field is empty', () => {
      beforeEach(() => form.setValues({ active: '' }))
      it('returns false', () => {
        expect(form.isComplete).toBe(false)
      })
    })

    describe('when a boolean field is null', () => {
      beforeEach(() => form.setValues({ active: null }))
      it('returns false', () => {
        expect(form.isComplete).toBe(false)
      })
    })

    describe('when all fields are complete', () => {
      beforeEach(() => form.setValues({ age: 0 }))
      it('returns true', () => expect(form.isComplete).toBe(true))
    })
  })

  describe('isDirty', () => {
    describe('when data is unchanged', () => {
      it('returns false', () => {
        expect(form.isDirty).toBe(false)
      })
    })

    describe('when data is changed', () => {
      beforeEach(() => {
        form.setValues({ name: 'manolo' })
      })

      it('returns false', () => {
        expect(form.isDirty).toBe(true)
      })
    })
  })

  describe('has', () => {
    it('return false if the field does not exist', () => {
      expect(form.has('lol')).toBe(false)
    })

    it('returns true otherwise', () => {
      expect(form.has('name')).toBe(true)
    })
  })

  describe('get', () => {
    it('throws an error if the field does not exist', () => {
      expect(() => form.get('lol')).toThrow()
    })

    it('returns the field otherwise', () => {
      expect(form.get('name').value).toBe('paco')
    })
  })

  describe('resetErrors', () => {
    it('clears all the errors', () => {
      form.setErrors({ name: ['too short'] })
      form.resetErrors()
      expect(form.get('name').errors).toBeNull()
    })
  })

  describe('resetAll', () => {
    it('resets form to its original values', () => {
      form.setValues({ name: 'resetMe', age: 20 })
      expect(form.get('name').value).toBe('resetMe')
      expect(form.get('age').value).toBe("20")
      form.resetAll()
      expect(form.get('name').value).toBe('paco')
      expect(form.get('age').value).toBe("0")
    })
  })

  describe('setErrors', () => {
    it('populates the fields with errors', () => {
      form.setErrors({ name: ['too short'] })
      expect(form.get('name').errors[0]).toEqual('too short')
    })

    it('ignores the inexistent fields', () => {
      expect(() =>
        form.setErrors({ lol: ['too short'] })
      ).not.toThrow()
    })

    it('works with nested errors', () => {
      form.setErrors({
        country_metadata: { social_security: ['invalid'] }
      })
      expect(
        form.get('country_metadata.social_security').errors[0]
      ).toEqual('invalid')
    })
  })

  describe('resetValues', () => {
    it('populates the fields with values', () => {
      form.resetValues()
      expect(form.get('name').value).toBe('')
    })
  })

  describe('setValues', () => {
    it('populates the fields with values', () => {
      form.setValues({ name: 'bob' })
      expect(form.get('name').value).toBe('bob')
    })
  })

  describe('save', () => {
    it('sets the values if the promise succeeds', () => {
      const saveMock = jest.fn(values => {
        return new Promise((resolve, _reject) => {
          resolve(values)
        })
      })

      return form
        .save({
          save: saveMock,
          attributes: { toJS: () => { } }
        })
        .then(vals => {
          expect(vals).toEqual(attributes)
          expect(form.data()).toEqual(attributes)
        })
    })

    it('sets the errors if the promise fails', () => {
      const errors = { name: ['too long'] }
      const saveMock = jest.fn(_values => {
        return new Promise((_resolve, reject) => {
          reject(errors)
        })
      })

      return form
        .save({
          save: saveMock,
          attributes: { toJS: () => { } }
        })
        .catch(err => {
          expect(err).toEqual(errors)
          expect(form.get('name').errors.slice()).toEqual(errors.name)
        })
    })
  })

  describe('create', () => {
    it('sets the values if the promise succeeds', () => {
      const createMock = jest.fn(values => {
        return new Promise((resolve, _reject) => {
          resolve(values)
        })
      })

      return form.create({ create: createMock }).then(vals => {
        expect(vals).toEqual(attributes)
        expect(form.data()).toEqual(attributes)
      })
    })

    it('sets the errors if the promise fails', () => {
      const errors = { name: ['too long'] }
      const createMock = jest.fn(_values => {
        return new Promise((_resolve, reject) => {
          reject(errors)
        })
      })

      return form.create({ create: createMock }).catch(err => {
        expect(err).toEqual(errors)
        expect(form.get('name').errors.slice()).toEqual(errors.name)
      })
    })
  })
})
