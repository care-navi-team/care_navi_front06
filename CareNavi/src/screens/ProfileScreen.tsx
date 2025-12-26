import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import StoreScreen from './StoreScreen';

export default function ProfileScreen() {
  const { session } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await supabase.auth.signOut();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleResetSurvey = async () => {
    Alert.alert(
      '설문 다시하기',
      '설문을 다시 진행하시겠습니까?\n로그아웃 후 다시 로그인하면 설문을 다시 할 수 있습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃하고 다시하기',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete survey data for this user
              if (session?.user?.id) {
                await supabase
                  .from('health_surveys')
                  .delete()
                  .eq('user_id', session.user.id);
              }
              // Sign out
              await supabase.auth.signOut();
            } catch (error) {
              console.error('Reset survey error:', error);
              Alert.alert('오류', '문제가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>관리</Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 정보</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>이메일</Text>
            <Text style={styles.infoValue}>{session?.user?.email || '-'}</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설정</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleResetSurvey}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>건강 설문 다시하기</Text>
              <Text style={styles.menuDesc}>처음부터 설문을 다시 진행합니다</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Lab Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>실험실</Text>
          <View style={styles.labCard}>
            <Text style={styles.labDesc}>
              개발 중인 기능들을 미리 체험해보세요
            </Text>
            <TouchableOpacity
              style={styles.labButton}
              onPress={() => setShowStoreModal(true)}
            >
              <Text style={styles.labButtonIcon}>🛒</Text>
              <Text style={styles.labButtonText}>스토어</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <Text style={styles.logoutText}>
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>CareNavi v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Store Modal */}
      <Modal
        visible={showStoreModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowStoreModal(false)}
      >
        <SafeAreaView style={styles.storeModalContainer}>
          <View style={styles.storeHeader}>
            <TouchableOpacity
              style={styles.storeBackButton}
              onPress={() => setShowStoreModal(false)}
            >
              <Text style={styles.storeBackIcon}>←</Text>
              <Text style={styles.storeBackText}>뒤로</Text>
            </TouchableOpacity>
            <Text style={styles.storeHeaderTitle}>실험실 - 스토어</Text>
            <View style={styles.storeHeaderSpacer} />
          </View>
          <StoreScreen />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 13,
    color: '#999',
  },
  menuArrow: {
    fontSize: 24,
    color: '#CCC',
  },
  logoutButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
  labCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8D5FF',
    borderStyle: 'dashed',
  },
  labDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  labButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0FF',
    borderRadius: 8,
    padding: 12,
    alignSelf: 'flex-start',
  },
  labButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  labButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  storeModalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  storeBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  storeBackIcon: {
    fontSize: 20,
    color: '#4A90D9',
    marginRight: 4,
  },
  storeBackText: {
    fontSize: 16,
    color: '#4A90D9',
    fontWeight: '500',
  },
  storeHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  storeHeaderSpacer: {
    width: 60,
  },
});
