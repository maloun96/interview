import React from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Text } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import theme from "theme/index";
import authActions from "actions/auth.action";

const getDisplayName = (WrappedComponent) => {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
};

const Message = ({ message, onPress, type = "error" }) => (
  <View
    style={{
      ...styles.messageContainer,
      ...(type === "error" ? styles.errorContainer : styles.warningContainer),
    }}
  >
    <Text style={styles.text}>{message}</Text>
    {onPress && <Icon onPress={onPress} style={styles.icon} name="times-circle" size={16} color={"#fff"} />}
  </View>
);

const withMessage = (Component) => (props) => {
  const { isConnected, type } = useNetInfo();
  const { error, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const hideError = () => dispatch(authActions.setAuthError(null));

  const isLoginComponent = getDisplayName(Component) === "LoginContainer";
  const canRender = (user && !isLoginComponent) || isLoginComponent;

  return (
    <View style={styles.container}>
      {!isConnected && type !== "unknown" && <Message message="No internet connection detected" />}
      {error && <Message message={error} onPress={hideError} />}
      {canRender && <Component {...props} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    position: "relative",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: "100%",
  },
  warningContainer: {
    backgroundColor: theme.colors.yellow,
  },
  errorContainer: {
    backgroundColor: "red",
  },
  text: {
    color: "#fff",
    fontWeight: "700",
  },
  icon: {
    position: "absolute",
    top: "50%",
    right: 40,
  },
});

export default withMessage;

