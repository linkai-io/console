export function handleErrors(dispatch, action, err) {
  if (err.data !== undefined) {
    dispatch(
      'notify/CREATE_NOTIFY_MSG',
      {
        msg: err.data.msg,
        msgType: 'danger'
      },
      { root: true }
    );
  } else if (err.response !== undefined && err.response.data !== undefined) {
    dispatch(
      'notify/CREATE_NOTIFY_MSG',
      {
        msg: 'Failed to ' + action + ': ' + err.response.data.msg,
        msgType: 'danger',
        msgTimeout: 8000
      },
      { root: true }
    );
  } else {
    dispatch(
      'notify/CREATE_NOTIFY_MSG',
      {
        msg: 'Failed to ' + action + ': ' + err.message,
        msgType: 'danger'
      },
      { root: true }
    );
  }
}
