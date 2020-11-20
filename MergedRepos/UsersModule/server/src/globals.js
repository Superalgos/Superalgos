
/* Callbacks default responses. */

global.DEFAULT_OK_RESPONSE = {
  result: 'Ok',
  message: 'Operation Succeeded'
}

global.DEFAULT_FAIL_RESPONSE = {
  result: 'Fail',
  message: 'Operation Failed'
}

global.DEFAULT_RETRY_RESPONSE = {
  result: 'Retry',
  message: 'Retry Later'
}

global.CUSTOM_OK_RESPONSE = {
  result: 'Ok, but check Message',
  message: 'Custom Message'
}

global.CUSTOM_FAIL_RESPONSE = {
  result: 'Fail Because',
  message: 'Custom Message'
}
