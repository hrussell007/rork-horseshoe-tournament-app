import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface StoredUser extends User {
  password: string;
}

const STORAGE_KEYS = {
  USERS: 'horseshoe_users',
  CURRENT_USER: 'horseshoe_current_user',
};

const ADMIN_EMAIL = 'hrussell007@gmail.com';
const ADMIN_PASSWORD = 'foosen007';
const ADMIN_USERNAME = 'HRussell';

export const [AuthContext, useAuth] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    initializeAdmin();
  }, []);

  const initializeAdmin = async () => {
    try {
      const [usersData, currentUserData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USERS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
      ]);

      let parsedUsers: StoredUser[] = usersData ? JSON.parse(usersData) : [];
      
      const adminExists = parsedUsers.find(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
      
      if (!adminExists) {
        const adminUser: StoredUser = {
          id: 'admin-1',
          username: ADMIN_USERNAME,
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        parsedUsers = [adminUser, ...parsedUsers];
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsedUsers));
      }
      
      setUsers(parsedUsers);
      
      if (currentUserData) {
        setCurrentUser(JSON.parse(currentUserData));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (newUsers?: StoredUser[], newCurrentUser?: User | null) => {
    try {
      const promises = [];
      if (newUsers !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers)));
      }
      if (newCurrentUser !== undefined) {
        if (newCurrentUser === null) {
          promises.push(AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER));
        } else {
          promises.push(AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newCurrentUser)));
        }
      }
      await Promise.all(promises);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    if (!normalizedUsername || !normalizedEmail || !password) {
      return { success: false, error: 'All fields are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const existingUser = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail || u.username.toLowerCase() === normalizedUsername.toLowerCase()
    );

    if (existingUser) {
      return { success: false, error: 'Username or email already exists' };
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: password,
      role: normalizedEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    const userWithoutPassword: User = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
    setCurrentUser(userWithoutPassword);
    await saveData(updatedUsers, userWithoutPassword);

    return { success: true };
  };

  const login = async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const normalized = emailOrUsername.toLowerCase().trim();

    if (!normalized || !password) {
      return { success: false, error: 'Email/username and password are required' };
    }

    console.log('Login attempt:', { normalized, password });
    console.log('Available users:', users.map(u => ({ email: u.email, username: u.username })));

    const user = users.find(
      (u) => u.email.toLowerCase() === normalized || u.username.toLowerCase() === normalized
    );

    console.log('Found user:', user ? { email: user.email, username: user.username } : 'none');

    if (!user || user.password !== password) {
      console.log('Login failed:', { userFound: !!user, passwordMatch: user ? user.password === password : false });
      return { success: false, error: 'Invalid credentials' };
    }

    const userWithoutPassword: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
    
    setCurrentUser(userWithoutPassword);
    await saveData(undefined, userWithoutPassword);

    return { success: true };
  };

  const logout = async () => {
    setCurrentUser(null);
    await saveData(undefined, null);
  };

  const isAdmin = currentUser?.role === 'admin';

  return {
    currentUser,
    users,
    isLoading,
    isAuthenticated: currentUser !== null,
    isAdmin,
    signup,
    login,
    logout,
  };
});
