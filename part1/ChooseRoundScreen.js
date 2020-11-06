import React, { useEffect } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Loading from "shared/Loading";
import preferencesActions from "actions/preferences.action";
import withMessage from "shared/withMessage";
import ChooseRoundList from "screens/ChooseRoundScreen/components/ChooseRoundList";

const ChooseRound = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loadingRounds, rounds, selectedDataset, selectedRound } = useSelector((state) => state.preferences);

  useEffect(() => {
    dispatch(preferencesActions.loadRounds(selectedDataset?.deliveryhistoryid, selectedDataset?.type));
  }, []);

  const onNextScreen = () => {
    if (selectedRound) {
      navigation.navigate("DeliveryTotals");
    }
  };

  if (loadingRounds) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ChooseRoundList
        rounds={rounds}
        onNextScreen={onNextScreen}
        selectedRound={selectedRound}
        onPress={(round) => dispatch(preferencesActions.selectRound(round.rounddeliveryid))}
        onRefresh={() =>
          dispatch(preferencesActions.loadRounds(selectedDataset?.deliveryhistoryid, selectedDataset?.type))
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

ChooseRound.displayName = "ChooseRound";

export default withMessage(ChooseRound);

