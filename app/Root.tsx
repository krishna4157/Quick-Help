import { Text } from "react-native";

export default function Root({ context }: any) {
  // const systemColorScheme = useSystemColorScheme();

  return (
    <>
      <Text style={{ color: "red", marginTop: 30 }}>Root Layout</Text>
      {/* <ExpoRoot context={context} /> */}
    </>
  );
}
