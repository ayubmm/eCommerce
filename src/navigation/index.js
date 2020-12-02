import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {DrawerNavigation} from './Tabs';
import {MaterialTopTab} from './Tabs';
import Splash from '../screens/splash';

const Stack = createStackNavigator();

export default function Navigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={'Splash'} component={Splash} />
        <Stack.Screen name={'Auth'} component={MaterialTopTab} />
        <Stack.Screen name={'Drawer'} component={DrawerNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
