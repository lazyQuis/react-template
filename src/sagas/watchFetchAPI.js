import { call, put, fork, take, cancel, takeEvery } from 'redux-saga/effects';
import * as types from '@/constants/actionTypes';

/**
 * 此Saga方法將Fetch API處理邏輯完全交由使用者自己處理，只協助自動處理Processing Action部分
 */

async function fetchAPI(url, options) {
  const response = await fetch(url, options);
  return response;
}

function nextAction(next) {
  return next.then(nextObj => nextObj);
}

function* sendAPI(action) {
  try {
    // 正常程序
    if (typeof action.processingStart === 'object') yield put(action.processingStart);
    const response = yield call(fetchAPI, action.url, action.options);
    if (action.success) {
      const next = action.success(response);
      if (typeof next === 'object' && next !== null) {
        if (typeof next.then === 'function') {
          const nextObj = yield call(nextAction, next);
          if (nextObj) yield put(nextObj);
        } else {
          yield put(next);
        }
      }
    }
    if (typeof action.processingEnd === 'object') yield put(action.processingEnd);
    if (typeof action.callback === 'function') action.callback.call(null, response);
    if (typeof action.Promise === 'object' && typeof action.Promise.then === 'function') action.resolve(response);
  } catch (error) {
    try {
      if (typeof action.processingEnd === 'object') yield put(action.processingEnd);
      if (typeof action.Promise === 'object' && typeof action.Promise.then === 'function') action.reject(error);
    } catch (e) {
      // continue regardless of error
    }
  }
}


/// Single API
function* fetchFlow(action) {
  const task = yield fork(sendAPI, action);
  yield take(types.API_CANCEL);
  yield cancel(task);
  // 清除processing狀態
  if (typeof action.processingEnd === 'object') yield put(action.processingEnd);
}

/////////////////////////////////////
// 監控單筆Fetch API事件
/////////////////////////////////////
export default function* watchFetchAPI() {
  yield takeEvery(types.FETCH_ASYNC, fetchFlow);
}
