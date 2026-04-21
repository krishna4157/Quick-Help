import React from "react";
import { Text, View } from "react-native";
import AwesomeButton from "react-native-really-awesome-button";

export const PopupContext = React.createContext({
  showPopup: (title, message, buttons) => {},
});

// export const customAlert = React.useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [popupVisible, setPopupVisible] = React.useState(false);
  const [popupTitle, setPopupTitle] = React.useState("Alert");
  const [popupMessage, setPopupMessage] = React.useState("Message");
  const [popupButtons, setPopupButtons] = React.useState([
    { title: "OK", onPress: () => setPopupVisible(false) },
  ]);

  const showPopup = (title, message, buttons) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupButtons(buttons);
    setPopupVisible(true);
    // Implement your popup logic here, e.g., using a modal or a third-party library
    // console.log("Popup:", title, message, buttons);
  };

  return (
    <PopupContext.Provider value={{ showPopup }}>
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
            style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}
          >
            <Text>
              {typeof popupTitle == "string"
                ? popupTitle
                : JSON.stringify(popupTitle)}
            </Text>
            <Text>
              {typeof popupMessage == "string"
                ? popupMessage
                : JSON.stringify(popupMessage)}
            </Text>
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
