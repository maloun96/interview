import { DELIVER_AND_LOCK_ENDPOINT, DROP_ITEM_STATUSES, DROP_STATUSES, MESSAGE_SERVER_DOWN } from "constants/index";
import preferencesApi from "utils/preferencesApi";
import authActions from "actions/auth.action";
import { syncDispatch } from "utils/sync";

const { DAMAGED_NOT_DELIVERED, MISSING, OTHER } = DROP_ITEM_STATUSES;

const preferencesActions = {
  loadDatasets: () => async (dispatch, getState) => {
    dispatch(preferencesActions.setLoadingDatasets(true));
    const {
      preferences: { selectedDataset },
    } = getState();

    try {
      const { data } = await preferencesApi.getDatasets();

      if (data.success === "OK" && data.data) {
        dispatch(preferencesActions.setDatasets(data.data));

        if (!selectedDataset && data.data.length === 1) {
          dispatch(preferencesActions.selectDataset(data.data[0]));
        }
      }
    } catch (err) {
      console.log(err);
      if (err.response.status === 503) {
        dispatch(authActions.setAuthError(MESSAGE_SERVER_DOWN));
      }
    } finally {
      dispatch(preferencesActions.setLoadingDatasets(false));
    }
  },

  loadRounds: (deliveryhistoryid, type) => async (dispatch, getState) => {
    dispatch(preferencesActions.setLoadingRounds(true));

    const {
      preferences: { selectedRound },
    } = getState();

    try {
      const { data } = await preferencesApi.getRounds(deliveryhistoryid, type);

      if (data.success === "OK" && data.data) {
        dispatch(preferencesActions.setRounds(data.data));
        preferencesActions.setDefaultRound(dispatch, data.data, selectedRound);
      }

      dispatch(preferencesActions.setLoadingRounds(false));
    } catch (err) {
      console.log(err);
      if (err.response.status === 503) {
        dispatch(authActions.setAuthError(MESSAGE_SERVER_DOWN));
      }
    } finally {
      dispatch(preferencesActions.setLoadingRounds(false));
    }
  },

  setDefaultRound: (dispatch, roundsList, selectedRound) => {
    if (!roundsList.length) {
      return;
    }

    const find = roundsList.find((round) => round.round.rounddeliveryid === selectedRound?.round.rounddeliveryid);

    dispatch(preferencesActions.selectRound(find ? find.round.rounddeliveryid : roundsList[0].round.rounddeliveryid));
  },

  // Check all drop items statuses and update drop status based on it.
  updateDropStatus: (drop, dropItemIndex, dropItemStatus) => async (dispatch, getState) => {
    const {
      preferences: { selectedRound },
    } = getState();

    const { DELIVERED, DAMAGED_DELIVERED } = DROP_ITEM_STATUSES;
    const { COMPLETE, PARTIAL } = DROP_STATUSES;

    drop.drop_details[dropItemIndex].deliverystatusid = dropItemStatus;
    const index = selectedRound.drops.findIndex((d) => drop === d);

    const isCompleted = drop.drop_details.every((dropItem) =>
      [DELIVERED, DAMAGED_DELIVERED].includes(dropItem.deliverystatusid)
    );

    dispatch(preferencesActions.setDropDelivered(index, isCompleted ? COMPLETE : PARTIAL, drop.drop.use_address));
  },

  // Update drop item status
  updateDropDetail: (drop, index, status, notes) => async (dispatch) => {
    try {
      await syncDispatch(preferencesApi.updateDropDetail, drop, index, status, notes);
      dispatch(preferencesActions.updateDropStatus(drop, index, status));
    } catch (err) {
      if (err.response.status === 503) {
        dispatch(authActions.setAuthError(MESSAGE_SERVER_DOWN));
      }
    } finally {
      dispatch(preferencesActions.setDropDetail(drop, index, status, notes));
    }
  },

  updateDrop: (endpoint, drop, coords, image, notes) => async (dispatch, getState) => {
    const {
      preferences: { selectedRound },
    } = getState();

    const dropIndex = selectedRound.drops.findIndex((d) => drop.drop.sortorder === d.drop.sortorder);

    const status = preferencesActions.getDropStatusByAllDropItemsStatuses(selectedRound.drops[dropIndex].drop_details);

    const toDeliver = selectedRound.drops[dropIndex].drop_details.filter(
      (drop_detail) => drop_detail.deliverystatusid === DROP_ITEM_STATUSES.NORMAL
    );

    try {
      for (var i = 0; i < toDeliver.length; i++) {
        let index = selectedRound.drops[dropIndex].drop_details.findIndex((item) => item === toDeliver[i]);
        await dispatch(preferencesActions.updateDropDetail(drop, index, DROP_ITEM_STATUSES.DELIVERED, ""));
      }

      await syncDispatch(preferencesApi.updateDropDelivered, endpoint, drop, coords, image, notes, status);

      if (image) {
        await syncDispatch(preferencesApi.updateDropPicture, drop.drop, image);
      }
    } catch (err) {
      console.log(err);
      if (err.response.status === 503) {
        dispatch(authActions.setAuthError(MESSAGE_SERVER_DOWN));
      }
    } finally {
      const useAddress = endpoint === DELIVER_AND_LOCK_ENDPOINT || drop.drop.use_address;
      dispatch(preferencesActions.setDropDelivered(dropIndex, status, useAddress));
      dispatch(preferencesActions.setDropDeliveryLoading(false));
    }
  },

  getDropStatusByAllDropItemsStatuses: (drop_details) => {
    return drop_details.some((drop_detail) =>
      [DAMAGED_NOT_DELIVERED, MISSING, OTHER].includes(drop_detail.deliverystatusid)
    )
      ? DROP_STATUSES.PARTIAL
      : DROP_STATUSES.COMPLETE;
  },

  setDropDeliveryLoading: (value) => ({
    type: "SET_DROP_DELIVERY_LOADING",
    payload: value,
  }),

  setDropDelivered: (dropIndex, status, useAddress) => ({
    type: "SET_DROP_DELIVERED",
    payload: {
      dropIndex,
      status,
      useAddress,
    },
  }),

  setDropDetail: (drop, index, status, notes) => ({
    type: "UPDATE_DROP_DETAIL",
    payload: {
      drop,
      index,
      status,
      notes,
    },
  }),

  setDatasets: (data) => ({
    type: "SET_DATASETS",
    payload: data,
  }),

  setRounds: (data) => ({
    type: "SET_ROUNDS",
    payload: data,
  }),

  selectDataset: (data) => ({
    type: "SELECT_DATASET",
    payload: data,
  }),

  selectRound: (rounddeliveryid) => ({
    type: "SELECT_ROUND",
    payload: rounddeliveryid,
  }),

  setLoadingDatasets: (value) => ({
    type: "SET_LOADING_DATASETS",
    payload: value,
  }),

  setLoadingRounds: (value) => ({
    type: "SET_LOADING_ROUNDS",
    payload: value,
  }),
};

export default preferencesActions;

