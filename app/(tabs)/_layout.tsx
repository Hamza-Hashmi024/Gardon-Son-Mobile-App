import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ConnectionScreen from "../screens/ConnectionScreen";
import SetupScreen from "../screens/SetupScreen";
import ReadingScreen from "../screens/ReadingScreen";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
    <Stack.Navigator
      initialRouteName="Connection"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Connection" component={ConnectionScreen} />
      <Stack.Screen name="Setup" component={SetupScreen} />
      <Stack.Screen name="Dashboard" component={ReadingScreen} />
    </Stack.Navigator>
  );
}
