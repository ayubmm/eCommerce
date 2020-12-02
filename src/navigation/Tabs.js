import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Text} from 'react-native';
import Registration from '../screens/register/index';
import Login from '../screens/login/index';
import Home from '../screens/home/index';
import Chat from '../screens/chat/index';
import Transaction from '../screens/transaction/index';
import ProfileDrawer from '../screens/profileDrawer/index';
import DashboardSeller from '../screens/dashboardSeller/index';
import Cart from '../screens/cart/index';

const Tab = createBottomTabNavigator();

const TopTab = createMaterialTopTabNavigator();

const Drawer = createDrawerNavigator();

export function MaterialTopTab() {
  return (
    <TopTab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color}) => {
          let iconName;

          if (route.name === 'Login') {
            iconName = focused ? 'person' : 'person';
          } else if (route.name === 'Registration') {
            iconName = focused ? 'person-add' : 'person-add';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
      tabBarOptions={{
        showLabel: false,
        showIcon: true,
        activeTintColor: '#0d4e4e',
        inactiveTintColor: 'gray',
        indicatorStyle: {
          backgroundColor: '#0d4e4e',
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          borderWidth: 1,
          height: 4,
        },
      }}>
      <TopTab.Screen name={'Login'} component={Login} />
      <TopTab.Screen name={'Registration'} component={Registration} />
    </TopTab.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarLabel: ({focused, color}) => {
          if (focused) {
            return <Text style={{color}}>{route.name}</Text>;
          }
        },
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'User') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbox' : 'chatbox-outline';
          } else if (route.name === 'Transaction') {
            iconName = focused ? 'exchange' : 'exchange';
            return <FontAwesome name={iconName} size={size} color={color} />;
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: '#0d4e4e',
        inactiveTintColor: '#0d4e4e',
        keyboardHidesTabBar: true,
        tabStyle: {backgroundColor: '#eee'},
      }}>
      <Tab.Screen name={'Home'} component={Home} />
      <Tab.Screen name={'Chat'} component={Chat} />
      <Tab.Screen name={'Transaction'} component={Transaction} />
    </Tab.Navigator>
  );
}

export function DrawerNavigation() {
  return (
    <Drawer.Navigator drawerContent={(props) => <ProfileDrawer {...props} />}>
      <Drawer.Screen name={'BottomTab'} component={Tabs} />
      <Drawer.Screen name={'DashboardSeller'} component={DashboardSeller} />
      <Drawer.Screen name={'Cart'} component={Cart} />
    </Drawer.Navigator>
  );
}
