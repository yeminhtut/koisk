import productWatcher from "../modules/dashboard/store/watcher"
import authWatcher from "../modules/auth/store/watcher";
import generalWatcher from "../modules/welcome/store/watcher";
import { all } from "redux-saga/effects";


export default function* rootSaga() {
  yield all([
    authWatcher(),
    productWatcher(),
    generalWatcher()
  ]);
}
