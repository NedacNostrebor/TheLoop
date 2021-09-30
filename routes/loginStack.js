import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import SignUp from '../screens/signUp';
import LogIn from '../screens/logIn';
import RootStack from './tabNavigator';


//Screens in the profile tab

const Stack = createStackNavigator();

export default function ProfileStack(){
  return(
    <Stack.Navigator
      initialRouteName='Login'
      screenOptions={{ headerShown: false}}
    >
      <Stack.Screen
        name='LogIn'
        component={LogIn}
      />
       <Stack.Screen 
        name='SignUp'
        component={SignUp}
      />
      <Stack.Screen
        name='RootStack'
        component={RootStack}
      />
    </Stack.Navigator>
  )
}
