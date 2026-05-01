import React from "react";
import { View } from "react-native";
import AwesomeButton from "react-native-really-awesome-button";
import { ThemedText } from "./components/themed-text";

export const PopupContext = React.createContext({
  customAlert: (title, message, buttons) => {},
});

// export const customAlert = React.useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [popupVisible, setPopupVisible] = React.useState(false);
  const [popupTitle, setPopupTitle] = React.useState("Message");
  const [popupMessage, setPopupMessage] = React.useState("");
  const [popupButtons, setPopupButtons] = React.useState([
    { title: "OK", onPress: () => setPopupVisible(false) },
  ]);

  const customAlert = (title, message, buttons) => {
    if (title) {
      setPopupTitle(title);
    }
    if (message) {
      // alert(JSON.stringify(message));
      setPopupMessage(message);
    }
    if (buttons) {
      setPopupButtons(buttons);
    }
    setPopupVisible(true);
    // Implement your popup logic here, e.g., using a modal or a third-party library
    // console.log("Popup:", title, message, buttons);
  };

  return (
    <PopupContext.Provider value={{ customAlert }}>
      {popupVisible && (
        <View
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 50,
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            alignSelf: "center",
            //   left: 20,
            zIndex: 99,
            //   backgroundColor: "red",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "70%",
              // paddingHorizontal: 70,
            }}
          >
            <ThemedText>
              {typeof popupTitle == "string"
                ? popupTitle
                : JSON.stringify(popupTitle)}
            </ThemedText>
            <ThemedText style={{ width: "100%" }}>
              {typeof popupMessage == "string"
                ? popupMessage
                : JSON.stringify(popupMessage)}
            </ThemedText>
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 10,
                // paddingVertical: 10,
                paddingTop: 20,
                justifyContent: "space-between",
                justifyContent: "center",
              }}
            >
              {popupButtons?.map((button, index) => (
                <AwesomeButton
                  backgroundColor="green"
                  width={100}
                  height={40}
                  key={index}
                  onPress={() => {
                    button.onPress({ close: () => setPopupVisible(false) }) ||
                      setPopupVisible(false);
                    setPopupVisible(false);
                  }}
                >
                  {button.title}
                </AwesomeButton>
              ))}
            </View>
          </View>
        </View>
      )}
      {children}
    </PopupContext.Provider>
  );
};
