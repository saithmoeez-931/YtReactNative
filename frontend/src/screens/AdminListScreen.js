import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Searchbar, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import AppIcon from '../components/AppIcon';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

export default function AdminListScreen({ navigation }) {
  const { token } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [searchText, setSearchText] = useState('');

  const loadAdmins = async () => {
    try {
      const data = await api.getAdmins(token);
      setAdmins(data.admins);
    } catch (error) {
      Alert.alert('Unable to load admins', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAdmins();
    }, [token]),
  );

  const filteredAdmins = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return query
      ? admins.filter(admin => `${admin.name} ${admin.email}`.toLowerCase().includes(query))
      : admins;
  }, [admins, searchText]);

  return (
    <ScreenContainer>
      <Surface elevation={1} style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admins</Text>
            <Text style={styles.subtitle}>{filteredAdmins.length} of {admins.length} shown</Text>
          </View>
          <PrimaryButton label="Create" onPress={() => navigation.navigate('AdminForm')} />
        </View>
        <Searchbar
          inputStyle={styles.searchInput}
          onChangeText={setSearchText}
          placeholder="Search admins"
          style={styles.searchbar}
          value={searchText}
        />
      </Surface>

      {filteredAdmins.map(admin => (
        <Surface elevation={1} key={admin._id} style={styles.rowCard}>
          <AppIcon color={colors.primary} name="shield-checkmark-outline" size={24} />
          <View style={styles.identity}>
            <Text style={styles.name}>{admin.name}</Text>
            <Text style={styles.meta}>{admin.email}</Text>
          </View>
          <Button mode="outlined" onPress={() => navigation.navigate('AdminForm', { admin })}>
            Edit
          </Button>
        </Surface>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 20, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { color: colors.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: colors.textMuted, marginTop: 4 },
  searchbar: { backgroundColor: colors.surfaceMuted },
  searchInput: { color: colors.text },
  rowCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  identity: { flex: 1 },
  name: { color: colors.text, fontWeight: '900', fontSize: 16 },
  meta: { color: colors.textMuted, marginTop: 3 },
});
