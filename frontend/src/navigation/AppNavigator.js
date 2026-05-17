import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import AdminFormScreen from '../screens/AdminFormScreen';
import AdminListScreen from '../screens/AdminListScreen';
import ComplaintDetailsScreen from '../screens/ComplaintDetailsScreen';
import ComplaintListScreen from '../screens/ComplaintListScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SubmitComplaintScreen from '../screens/SubmitComplaintScreen';
import WorkerDetailsScreen from '../screens/WorkerDetailsScreen';
import WorkerFormScreen from '../screens/WorkerFormScreen';
import WorkerListScreen from '../screens/WorkerListScreen';
import WorkerManagementScreen from '../screens/WorkerManagementScreen';
import WorkerRecordScreen from '../screens/WorkerRecordScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={LoginScreen} name="Login" />
      <Stack.Screen component={RegisterScreen} name="Register" />
    </Stack.Navigator>
  );
}

function ComplaintStack({ role }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        component={ComplaintListScreen}
        initialParams={{ role }}
        name="ComplaintList"
        options={{ title: role === 'worker' ? 'Assigned Complaints' : 'Complaints' }}
      />
      <Stack.Screen
        component={ComplaintDetailsScreen}
        name="ComplaintDetails"
        options={{ title: 'Complaint Details' }}
      />
    </Stack.Navigator>
  );
}

function ComplaintStackScreen({ route }) {
  return <ComplaintStack role={route.params?.role || 'user'} />;
}

function StaffStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        component={WorkerManagementScreen}
        name="StaffHome"
        options={{ title: 'Staff' }}
      />
      <Stack.Screen component={AdminListScreen} name="AdminList" options={{ title: 'Admins' }} />
      <Stack.Screen component={AdminFormScreen} name="AdminForm" options={{ title: 'Admin Form' }} />
      <Stack.Screen component={WorkerListScreen} name="WorkerList" options={{ title: 'Workers' }} />
      <Stack.Screen component={WorkerFormScreen} name="WorkerForm" options={{ title: 'Create Worker' }} />
      <Stack.Screen component={WorkerDetailsScreen} name="WorkerDetails" options={{ title: 'Edit Worker' }} />
      <Stack.Screen component={WorkerRecordScreen} name="WorkerRecord" options={{ title: 'Worker Record' }} />
    </Stack.Navigator>
  );
}

function DashboardTabs({ role }) {
  const tabs = [
    { name: 'Dashboard', component: DashboardScreen, icon: 'grid-outline' },
    ...(role === 'user'
      ? [{ name: 'Submit', component: SubmitComplaintScreen, icon: 'add-circle-outline' }]
      : []),
    {
      name: role === 'worker' ? 'Assigned' : 'Complaints',
      component: ComplaintStackScreen,
      icon: 'document-text-outline',
      params: { role },
    },
    ...(['admin', 'super_admin'].includes(role)
      ? [{ name: 'Staff', component: StaffStack, icon: 'people-outline' }]
      : []),
    { name: 'Profile', component: ProfileScreen, icon: 'person-outline' },
  ];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          const currentTab = tabs.find(tab => tab.name === route.name);
          return <Ionicons color={color} name={currentTab?.icon || 'ellipse-outline'} size={size} />;
        },
      })}
    >
      {tabs.map(tab => (
        <Tab.Screen
          component={tab.component}
          initialParams={tab.params}
          key={tab.name}
          name={tab.name}
        />
      ))}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return <AuthStack />;
  }

  return <DashboardTabs role={user.role} />;
}
