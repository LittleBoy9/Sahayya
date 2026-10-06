import { Tabs } from 'expo-router';
import { House, MessageSquare, Search, FileText, User } from 'lucide-react-native';

/**
 * Five-tab bar: Home · Care · Chat · Records · Profile.
 *
 * The prototype draws no tab bar — its presentation sidebar stood in for one —
 * so this comes from README.md §2: 84px tall including safe area, `surface`
 * background with a hairline top border, active tint `blue`, inactive `muted-3`.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0B5FFF',
        tabBarInactiveTintColor: '#98A1B2',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E4E7EC',
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Geist_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: 'Care',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
