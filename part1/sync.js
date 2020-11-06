import NetInfo from "@react-native-community/netinfo";
import { store } from "reducers/store";
import actions from "actions/index.actions";
import preferencesApi from "utils/preferencesApi";

const DELAY_ACTION_MS = 300;

export const syncDispatch = (fn, ...args) => {
  return NetInfo.fetch().then((state) => {
    if (!state.isConnected) {
      return store.dispatch(
        actions.addSync({
          name: fn.name,
          args,
        })
      );
    }

    return fn(...args);
  });
};

export const runActions = async () => {
  const {
    sync: { actions: syncActions },
  } = store.getState();

  if (!syncActions.length) {
    return;
  }

  store.dispatch(actions.isSync(true));

  try {
    for (let i = 0; i < syncActions.length; i++) {
      const state = await NetInfo.fetch();

      if (!state.isConnected) {
        throw new Error("No internet connection");
      }

      const { name, args } = syncActions[i];

      const start = new Date();
      await preferencesApi[name].apply(null, args);
      await delay(new Date() - start < DELAY_ACTION_MS ? DELAY_ACTION_MS : 0);

      store.dispatch(actions.removeSync(syncActions[i]));
    }

    store.dispatch(actions.isSync(false));
  } catch (e) {
    console.log(e);
  }
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

