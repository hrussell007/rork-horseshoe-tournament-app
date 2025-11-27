import { Tabs, useRouter } from "expo-router";
import { Trophy, Users, Award, LogOut, Home as HomeIcon, LogIn, DollarSign, Settings } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, Alert, Text, View, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
  const { currentUser, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleLogin = () => {
    router.push('/auth');
  };

  const HeaderRight = () => {
    if (currentUser) {
      return (
        <View style={localStyles.userInfoContainer}>
          <View style={localStyles.userInfo}>
            <Text style={localStyles.username} numberOfLines={1}>{currentUser?.username}</Text>
            {isAdmin && (
              <View style={localStyles.adminBadge}>
                <Text style={localStyles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleLogout} testID="logout-button" style={localStyles.logoutButton}>
            <LogOut size={22} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={localStyles.loginButton}
        onPress={handleLogin}
        testID="header-login-button"
      >
        <LogIn size={20} color={Colors.light.tint} />
        <Text style={localStyles.loginText}>Login</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: true,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.light.border,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <HomeIcon size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Tournaments",
          tabBarIcon: ({ color }) => <Trophy size={24} color={color} />,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: "Players",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Tabs.Screen
        name="standings"
        options={{
          title: "Standings",
          tabBarIcon: ({ color }) => <Award size={24} color={color} />,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Tabs.Screen
        name="sponsors"
        options={{
          title: "Sponsors",
          tabBarIcon: ({ color }) => <DollarSign size={24} color={color} />,
          headerRight: () => <HeaderRight />,
        }}
      />
      {isAdmin && (
        <Tabs.Screen
          name="admin"
          options={{
            title: "Admin",
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
            headerShown: false,
          }}
        />
      )}
    </Tabs>
  );
}

const localStyles = StyleSheet.create({
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
    maxWidth: 200,
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
    flex: 1,
  },
  username: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  adminBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  logoutButton: {
    padding: 4,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
});
