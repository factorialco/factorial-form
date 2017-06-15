# Factorial form

Minimal library for dealing with form state.

[![Build Status](https://travis-ci.org/factorial/factorial-form.svg?branch=master)](https://travis-ci.org/factorial/factorial-form)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Installation

```
npm install factorial-form --save
yarn add factorial-form
```

## Example

```js
import { Form } from 'factorial-form'

const attributes = {
  name: 'paco',
  salary: 18000,
  created_at: 1497521766937,
  metadata: {
    friends: 12
  }
}
const schema = {
  name: 'string',
  salary: 'cents',
  age: 'timestamp',
  metadata: {
    friends: 'number'
  }
}

const form = new Form(attributes, schema)
const field = form.get('name')

field.value // => 'paco'
form.isDirty // => false

field.set('pepe')
field.value // => 'pepe'
field.isDirty // => true
form.isDirty // => true
```

## Where is it used?

Developed and battle tested in production in [Factorial](https://factorialhr.com)
