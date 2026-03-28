import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SetupScreen from "../screens/SetupScreen";
import ReadingScreen from "../screens/ReadingScreen";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
    <Stack.Navigator initialRouteName="Setup" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Setup" component={SetupScreen} />
      <Stack.Screen name="Dashboard" component={ReadingScreen} />
    </Stack.Navigator>
  );
}