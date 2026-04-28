import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ConnectionScreen from "../screens/ConnectionScreen";
import SetupScreen from "../screens/SetupScreen";
import ReadingScreen from "../screens/ReadingScreen";
import PostRestartScreen from "../screens/Postrestartscreen";
import LiveReadingsScreen from "../screens/Livereadingsscreen";
 
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
      <Stack.Screen name="PostRestart" component={PostRestartScreen} />
      <Stack.Screen name="LiveReadings" component={LiveReadingsScreen} />
    </Stack.Navigator>
  );
}
 