import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { Award, Plus, Trash2, Edit2, X, Image as ImageIcon, ExternalLink } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import { Sponsor } from '@/types/tournament';

export default function SponsorsScreen() {
  const { isAdmin } = useAuth();
  const { sponsors, addSponsor, updateSponsor, deleteSponsor } = useTournamentData();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [name, setName] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [imageUri, setImageUri] = useState<string>('');

  const handleAddSponsor = () => {
    setEditMode(false);
    setEditingSponsor(null);
    setName('');
    setWebsiteUrl('');
    setImageUri('');
    setModalVisible(true);
  };

  const handleEditSponsor = (sponsor: Sponsor) => {
    setEditMode(true);
    setEditingSponsor(sponsor);
    setName(sponsor.name);
    setWebsiteUrl(sponsor.websiteUrl || '');
    setImageUri(sponsor.imageUri || '');
    setModalVisible(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Sponsor name is required');
      return;
    }

    if (editMode && editingSponsor) {
      updateSponsor(editingSponsor.id, {
        name: name.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        imageUri: imageUri || undefined,
      });
      Alert.alert('Success', 'Sponsor updated');
    } else {
      addSponsor({
        name: name.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        imageUri: imageUri || undefined,
      });
      Alert.alert('Success', 'Sponsor added');
    }
    setModalVisible(false);
  };

  const handleDelete = (sponsor: Sponsor) => {
    Alert.alert('Delete Sponsor', `Delete ${sponsor.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSponsor(sponsor.id),
      },
    ]);
  };

  const handleOpenWebsite = (url: string) => {
    if (!url) return;
    
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`;
    }

    if (Platform.OS === 'web') {
      window.open(finalUrl, '_blank');
    } else {
      Linking.openURL(finalUrl).catch(() => {
        Alert.alert('Error', 'Could not open website');
      });
    }
  };

  const renderSponsor = ({ item }: { item: Sponsor }) => (
    <TouchableOpacity
      style={styles.sponsorCard}
      onPress={() => {
        if (item.websiteUrl) {
          handleOpenWebsite(item.websiteUrl);
        }
      }}
      testID={`sponsor-card-${item.id}`}
    >
      {item.imageUri ? (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.sponsorImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.sponsorImagePlaceholder}>
          <Award size={48} color={Colors.light.tabIconDefault} />
        </View>
      )}
      <View style={styles.sponsorInfo}>
        <View style={styles.sponsorHeader}>
          <Text style={styles.sponsorName}>{item.name}</Text>
          {item.websiteUrl && (
            <ExternalLink size={18} color={Colors.light.tint} />
          )}
        </View>
        {item.websiteUrl && (
          <Text style={styles.sponsorUrl} numberOfLines={1}>
            {item.websiteUrl}
          </Text>
        )}
      </View>
      {isAdmin && (
        <View style={styles.sponsorActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={(e) => {
              e.stopPropagation();
              handleEditSponsor(item);
            }}
            testID={`edit-sponsor-${item.id}`}
          >
            <Edit2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
            testID={`delete-sponsor-${item.id}`}
          >
            <Trash2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {sponsors.length === 0 ? (
        <View style={styles.emptyState}>
          <Award size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.emptyTitle}>No Sponsors</Text>
          <Text style={styles.emptyText}>
            {isAdmin ? 'Add sponsors to showcase them here' : 'Check back later for sponsor information'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sponsors}
          renderItem={renderSponsor}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          testID="sponsors-list"
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddSponsor}
          testID="add-sponsor-button"
        >
          <Plus size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Sponsor' : 'Add Sponsor'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                testID="close-modal-button"
              >
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Sponsor Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Acme Corporation"
                placeholderTextColor={Colors.light.tabIconDefault}
                testID="sponsor-name-input"
              />

              <Text style={styles.label}>Website URL</Text>
              <TextInput
                style={styles.input}
                value={websiteUrl}
                onChangeText={setWebsiteUrl}
                placeholder="e.g., www.example.com"
                placeholderTextColor={Colors.light.tabIconDefault}
                autoCapitalize="none"
                keyboardType="url"
                testID="sponsor-url-input"
              />

              <Text style={styles.label}>Sponsor Logo/Image</Text>
              <TouchableOpacity
                style={styles.imageUploadButton}
                onPress={pickImage}
                testID="upload-image-button"
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.uploadedImage}
                  />
                ) : (
                  <View style={styles.imageUploadPlaceholder}>
                    <ImageIcon size={32} color={Colors.light.tabIconDefault} />
                    <Text style={styles.imageUploadText}>Upload Sponsor Logo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {imageUri && (
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri('')}
                >
                  <X size={16} color={Colors.light.error} />
                  <Text style={styles.removeImageText}>Remove Image</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSave}
                testID="save-sponsor-button"
              >
                <Text style={styles.buttonPrimaryText}>
                  {editMode ? 'Save Changes' : 'Add Sponsor'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  sponsorCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sponsorImage: {
    width: '100%',
    height: 180,
  },
  sponsorImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsorInfo: {
    padding: 16,
  },
  sponsorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sponsorName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
    flex: 1,
  },
  sponsorUrl: {
    fontSize: 14,
    color: Colors.light.tint,
    marginTop: 4,
  },
  sponsorActions: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingTop: 0,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.light.accent,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.light.error,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  imageUploadButton: {
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageUploadPlaceholder: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
    fontWeight: '600' as const,
  },
  uploadedImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover' as const,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 16,
  },
  removeImageText: {
    fontSize: 14,
    color: Colors.light.error,
    fontWeight: '600' as const,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  buttonPrimary: {
    backgroundColor: Colors.light.tint,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
