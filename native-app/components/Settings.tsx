import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { User, Bell, Shield, Database, Trash2, Save, LogOut, ChevronRight, Moon, Sun, Volume2, Globe, HelpCircle, Info, Key, Smartphone, Share2, Download, Upload, Trash, Loader2, ChevronLeft } from 'lucide-react-native';
import { UserProfile } from '../types';
import { getProfile, saveProfile, clearAllData } from '../services/storage';

export const Settings: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setProfile(await getProfile());
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    await saveProfile(profile);
    setIsSaving(false);
    Alert.alert("Success", "Profile updated successfully");
  };

  const handleClearData = async () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your notes, flashcards, and progress. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear Data", 
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert("Success", "All data has been cleared.");
            // In a real app, we might want to reload the app or redirect to onboarding
          }
        }
      ]
    );
  };

  if (!profile) return <View style={styles.loading}><Loader2 size={32} color="#0891b2" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ACCOUNT PROFILE</Text>
        </View>
        <View style={styles.card}>
            <View style={styles.profileHeader}>
                <View style={styles.avatarWrapper}>
                    <User size={40} color="#94a3b8" />
                </View>
                <View style={styles.profileInfo}>
                    <TextInput 
                      value={profile.name}
                      onChangeText={(val) => setProfile({...profile, name: val})}
                      placeholder="Your Name"
                      placeholderTextColor="#64748b"
                      style={styles.nameInput}
                    />
                    <Text style={styles.emailText}>{profile.email || 'No email set'}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveBtn}>
                {isSaving ? <ActivityIndicator size="small" color="white" /> : <Save size={18} color="white" />}
                <Text style={styles.saveBtnText}>Update Profile</Text>
            </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PREFERENCES</Text>
        </View>
        <View style={styles.card}>
            <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                        <Moon size={18} color="#8b5cf6" />
                    </View>
                    <Text style={styles.settingLabel}>Dark Mode</Text>
                </View>
                <Switch 
                  value={profile.preferences.theme === 'dark'}
                  onValueChange={(val) => setProfile({...profile, preferences: {...profile.preferences, theme: val ? 'dark' : 'light'}})}
                  trackColor={{ false: '#334155', true: '#0891b2' }}
                />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(8, 145, 178, 0.1)' }]}>
                        <Bell size={18} color="#0891b2" />
                    </View>
                    <Text style={styles.settingLabel}>Notifications</Text>
                </View>
                <Switch 
                  value={profile.preferences.notifications}
                  onValueChange={(val) => setProfile({...profile, preferences: {...profile.preferences, notifications: val}})}
                  trackColor={{ false: '#334155', true: '#0891b2' }}
                />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Volume2 size={18} color="#10b981" />
                    </View>
                    <Text style={styles.settingLabel}>Sound Effects</Text>
                </View>
                <Switch 
                  value={profile.preferences.soundEnabled}
                  onValueChange={(val) => setProfile({...profile, preferences: {...profile.preferences, soundEnabled: val}})}
                  trackColor={{ false: '#334155', true: '#0891b2' }}
                />
            </View>
        </View>

        {/* Security Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SECURITY & PRIVACY</Text>
        </View>
        <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingInfo}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
                        <Key size={18} color="#eab308" />
                    </View>
                    <Text style={styles.settingLabel}>Change Password</Text>
                </View>
                <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingInfo}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                        <Shield size={18} color="#ef4444" />
                    </View>
                    <Text style={styles.settingLabel}>Privacy Policy</Text>
                </View>
                <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>
        </View>

        {/* Data Management Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
        </View>
        <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingInfo}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                        <Download size={18} color="#94a3b8" />
                    </View>
                    <Text style={styles.settingLabel}>Export Data (JSON)</Text>
                </View>
                <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={handleClearData} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                        <Trash2 size={18} color="#ef4444" />
                    </View>
                    <Text style={[styles.settingLabel, { color: '#ef4444' }]}>Clear All Data</Text>
                </View>
            </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={styles.appInfo}>
            <Text style={styles.appVersion}>MUKTI Study v1.0.0</Text>
            <Text style={styles.appCopyright}>© 2026 MUKTI Labs. All rights reserved.</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1221',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0b1221',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  loading: {
    flex: 1,
    backgroundColor: '#0b1221',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 28,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileInfo: {
    flex: 1,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    padding: 0,
  },
  emailText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 'bold',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0891b2',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f1f5f9',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 4,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  appVersion: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 10,
    color: '#334155',
  },
});
