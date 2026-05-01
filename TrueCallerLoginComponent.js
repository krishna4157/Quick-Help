import { useEffect } from "react";
import { Dimensions, View } from "react-native";
import AwesomeButton from "react-native-really-awesome-button";
import { useTruecaller } from "./app/customTrucaller";
const TruecallerLoginComponent = ({ callback }) => {
  const {
    initializeTruecallerSDK,
    openTruecallerForVerification,
    isSdkUsable,
    userProfile,
    authToken,
    error,
  } = useTruecaller({
    androidClientId: "xesuguef7rau8r85dunwkmdcceascdk6ijomqndn_s4",
    iosAppKey: "",
    iosAppLink: "",
    androidSuccessHandler: handleBackendValidation,
  });
  useEffect(() => {
    // Initialize the Truecaller SDK when the component mounts
    initializeTruecallerSDK();
  }, []);

  //   useEffect(() => {
  //     // alert(
  //     //   "Truecaller callback 123456: " + JSON.stringify({ authToken, error }),
  //     // );
  //     // callback(userProfile, error);
  //   }, [authToken, error]);
  const handleTruecallerLogin = async () => {
    try {
      await openTruecallerForVerification().then((data) => {
        alert("Received data from Truecaller: " + JSON.stringify(data));
        // do server side validation if needed
      });
      // The userProfile will be updated automatically if verification is successful
    } catch (err) {
      console.error("Truecaller login error:", err);
      // Handle error
    }
  };

  const handleBackendValidation = async (data) => {
    alert("Received data from Truecaller: " + JSON.stringify(data));
    // do server side validation if needed
  };

  useEffect(() => {
    if (userProfile) {
      console.log("Truecaller profile 123:", userProfile);
      callback(userProfile);
      // Handle successful login, e.g., navigate to a new screen or update app state
    }
  }, [userProfile]);
  useEffect(() => {
    if (error) {
      console.error("Truecaller error:", error);
      // Handle error, e.g., show an error message to the user
    }
  }, [error]);

  const { height, width } = Dimensions.get("screen");
  return (
    <View>
      <AwesomeButton
        width={width - 80}
        backgroundColor="blue"
        onPress={handleTruecallerLogin}
      >
        Login with Truecaller
      </AwesomeButton>
    </View>
  );
};
export default TruecallerLoginComponent;
