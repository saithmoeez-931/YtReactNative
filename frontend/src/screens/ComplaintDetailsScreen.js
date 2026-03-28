import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import StatusBadge from '../components/StatusBadge';

export default function ComplaintDetailsScreen({ route }) {
  const { token, user } = useAuth();
  const complaintId = route.params?.complaintId;
  const [complaint, setComplaint] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedWorkerName, setSelectedWorkerName] = useState('');
  const [remark, setRemark] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadComplaint = async () => {
    try {
      const data = await api.getComplaintById(token, complaintId);
      setComplaint(data.complaint);

      if (user?.role === 'admin') {
        const workerResponse = await api.getWorkers(token);
        setWorkers(workerResponse.workers);
      }
    } catch (error) {
      Alert.alert('Unable to load complaint', error.message);
    }
  };

  useEffect(() => {
    loadComplaint();
  }, [complaintId]);

  const handleStatusUpdate = async status => {
    try {
      setLoading(true);
      await api.updateComplaintStatus(token, complaintId, {
        status,
        remark,
        proofImage,
      });
      setRemark('');
      setProofImage('');
      await loadComplaint();
    } catch (error) {
      Alert.alert('Unable to update complaint', error.message);
    } finally {
      setLoading(false);
    }
  };

  const pickProofImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access to upload proof.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length) {
      setProofImage(result.assets[0].uri);
    }
  };

  const handleAssign = async () => {
    if (!selectedWorkerId) {
      Alert.alert('Worker required', 'Select a worker ID from the list first.');
      return;
    }

    try {
      setLoading(true);
      await api.assignComplaint(token, complaintId, {
        workerId: selectedWorkerId,
        remark,
      });
      setRemark('');
      setSelectedWorkerId('');
      setSelectedWorkerName('');
      await loadComplaint();
    } catch (error) {
      Alert.alert('Unable to assign complaint', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!complaint) {
    return (
      <ScreenContainer scroll={false}>
        <Text>Loading complaint...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.category}>{complaint.category}</Text>
          <StatusBadge status={complaint.status} />
        </View>
        <Text style={styles.description}>{complaint.description}</Text>
        <Text style={styles.meta}>Block {complaint.block}</Text>
        <Text style={styles.meta}>Priority: {complaint.priority}</Text>
        <Text style={styles.meta}>House Number: {complaint.houseNumber || 'N/A'}</Text>
        <Text style={styles.meta}>Assigned Worker: {complaint.assignedTo?.name || 'Not assigned yet'}</Text>
        <Text style={styles.meta}>Remark Count: {complaint.remarks?.length || 0}</Text>
      </View>

      {user?.role === 'admin' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Assign worker</Text>
          <FormInput
            editable={false}
            label="Selected Worker"
            placeholder="Tap a worker below"
            value={selectedWorkerName || selectedWorkerId}
          />
          {!!workers.length && (
            <View style={styles.workerList}>
              {workers.map(worker => (
                <Pressable
                  key={worker._id}
                  onPress={() => {
                    setSelectedWorkerId(worker._id);
                    setSelectedWorkerName(`${worker.name} (${worker.email})`);
                  }}
                  style={[
                    styles.workerItem,
                    selectedWorkerId === worker._id && styles.workerItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.workerItemText,
                      selectedWorkerId === worker._id && styles.workerItemTextSelected,
                    ]}
                  >
                    {worker.name} ({worker.email})
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          <PrimaryButton label="Assign Complaint" loading={loading} onPress={handleAssign} />
        </View>
      )}

      {(user?.role === 'admin' || user?.role === 'worker') && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Update status</Text>
          <FormInput
            label="Remark"
            multiline
            onChangeText={setRemark}
            placeholder="Add a short update for residents and admins."
            value={remark}
          />
          <PrimaryButton
            label={proofImage ? 'Change proof image' : 'Attach proof image'}
            onPress={pickProofImage}
            variant="secondary"
          />
          {proofImage ? <Text style={styles.meta}>Selected proof image: {proofImage}</Text> : null}
          <PrimaryButton label="Mark In Progress" loading={loading} onPress={() => handleStatusUpdate('In Progress')} />
          <PrimaryButton label="Mark Resolved" onPress={() => handleStatusUpdate('Resolved')} variant="secondary" />
        </View>
      )}

      {!!complaint.remarks?.length && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Remarks timeline</Text>
          {complaint.remarks.map(item => (
            <View key={item._id} style={styles.remarkRow}>
              <Text style={styles.remarkAuthor}>{item.addedBy?.name || 'System'}</Text>
              <Text style={styles.remarkText}>{item.text}</Text>
            </View>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  meta: {
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  workerList: {
    gap: 8,
  },
  workerItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  workerItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  workerItemText: {
    color: colors.secondary,
    lineHeight: 20,
  },
  workerItemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  remarkRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 4,
  },
  remarkAuthor: {
    fontWeight: '700',
    color: colors.text,
  },
  remarkText: {
    color: colors.textMuted,
    lineHeight: 20,
  },
});
