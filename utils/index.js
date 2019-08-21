exports.formatValidationErrors = error => {
  const errors = []
  Object.keys(error.errors).forEach(key => {
    errors.push(error.errors[key].message)
  })
  return errors
}
