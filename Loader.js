import LottieView from "lottie-react-native";
import { StyleSheet, View } from "react-native";
export default function Loader() {
  return (
    <View
      style={{
        zIndex: 10,
        justifyContent: "center",
        position: "absolute",
        height: "100%",
        width: "100%",
      }}
    >
      <LottieView
        // source={{
        //   uri: "https://lottie.host/15b911fa-9c10-4eb1-a1b5-5e95970bc4b0/OAXgHu1yeu.lottie",
        // }}
        source={require("./lb.json")}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
  animation: {
    alignSelf: "center",
    // backgroundColor: "white",
    width: 280,
    height: 280,
  },
});
