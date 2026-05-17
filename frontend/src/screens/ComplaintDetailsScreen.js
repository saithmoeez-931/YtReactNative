import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Button,
  Card,
  Chip,
  Dialog,
  Portal,
  Searchbar,
  Surface,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import {
  formatDueDate,
  formatTimeRemaining,
  isComplaintOverdue,
} from '../utils/timeLabels';
import FeedbackBanner from '../components/FeedbackBanner';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import StatusBadge from '../components/StatusBadge';

const statusOptions = ['Pending', 'In Progress', 'Resolved'];
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

export default function ComplaintDetailsScreen({ route }) {
  const { token, user } = useAuth();
  const complaintId = route.params?.complaintId;
  const [complaint, setComplaint] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerDialogVisible, setWorkerDialogVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [assignRemark, setAssignRemark] = useState('');
  const [statusRemark, setStatusRemark] = useState('');
  const [assigningWorkerId, setAssigningWorkerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [expectedResolutionHours, setExpectedResolutionHours] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [rating, setRating] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const canManageComplaints = ['admin', 'super_admin'].includes(user?.role);
  const isResident = user?.role === 'user';

  const loadComplaint = async () => {
    try {
      const data = await api.getComplaintById(token, complaintId);
      setComplaint(data.complaint);
      setSelectedStatus(data.complaint.status);
      setSelectedPriority(data.complaint.priority);

      if (canManageComplaints) {
        const workerResponse = await api.getActiveWorkers(token);
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
        remark: statusRemark,
        priority: selectedPriority,
        expectedResolutionHours,
      });
      setStatusRemark('');
      setExpectedResolutionHours('');
      await loadComplaint();
      return true;
    } catch (error) {
      Alert.alert('Unable to update complaint', error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      Alert.alert('Invalid rating', 'Please enter a rating from 1 to 5.');
      return;
    }

    try {
      setLoading(true);
      await api.updateComplaintStatus(token, complaintId, {
        rating: numericRating,
        feedbackComment,
      });
      setRating('');
      setFeedbackComment('');
      setFeedbackMessage('Feedback submitted. Thank you.');
      await loadComplaint();
    } catch (error) {
      Alert.alert('Unable to submit feedback', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async worker => {
    if (!worker) {
      return;
    }

    try {
      setAssigningWorkerId(worker._id);
      await api.assignComplaint(token, complaintId, {
        workerId: worker._id,
        remark: assignRemark,
      });
      setAssignRemark('');
      setSelectedWorker(worker);
      setFeedbackMessage(`Complaint assigned to ${worker.name}.`);
      await loadComplaint();
    } catch (error) {
      Alert.alert('Unable to assign complaint', error.message);
    } finally {
      setAssigningWorkerId('');
    }
  };

  if (!complaint) {
    return (
      <ScreenContainer scroll={false}>
        <Text>Loading complaint...</Text>
      </ScreenContainer>
    );
  }

  const filteredWorkers = workers.filter(worker =>
    `${worker.name} ${worker.email}`.toLowerCase().includes(workerSearch.trim().toLowerCase()),
  );
  const isOverdue = isComplaintOverdue(complaint);

  return (
    <ScreenContainer>
      <Portal>
        <Dialog
          dismissable
          onDismiss={() => setWorkerDialogVisible(false)}
          visible={workerDialogVisible}
        >
          <Dialog.Title>Select worker</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Searchbar
              inputStyle={styles.searchInput}
              onChangeText={setWorkerSearch}
              placeholder="Search worker by name or email"
              style={styles.searchbar}
              value={workerSearch}
            />
            <View style={styles.workerPickerList}>
              {filteredWorkers.map(worker => {
                const isSelected = selectedWorker?._id === worker._id;

                return (
                  <Button
                    compact
                    key={worker._id}
                    mode={isSelected ? 'contained' : 'outlined'}
                    onPress={() => setSelectedWorker(worker)}
                    style={styles.workerPickerItem}
                  >
                    {worker.name} ({worker.email})
                  </Button>
                );
              })}
            </View>
            {!filteredWorkers.length ? <Text style={styles.meta}>No workers matched your search.</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setWorkerDialogVisible(false)}>Cancel</Button>
            <Button disabled={!selectedWorker} onPress={() => setWorkerDialogVisible(false)}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FeedbackBanner message={feedbackMessage} tone="success" />

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={styles.category}>{complaint.category}</Text>
              <Text style={styles.description}>{complaint.description}</Text>
            </View>
            <StatusBadge status={complaint.status} />
          </View>
          <View style={styles.summaryGrid}>
            <SummaryItem label="Priority" value={complaint.priority} />
            <SummaryItem label="Block" value={complaint.block || 'N/A'} />
            <SummaryItem label="House" value={complaint.houseNumber || 'N/A'} />
            <SummaryItem label="Assigned" value={complaint.assignedTo?.name || 'Not assigned'} />
            <SummaryItem label="Remarks" value={String(complaint.remarks?.length || 0)} />
            <SummaryItem label="Due by" value={formatDueDate(complaint.dueAt)} />
          </View>
          <View style={[styles.timelinePanel, isOverdue && styles.timelinePanelOverdue]}>
            <View style={styles.timelineIcon}>
              <Ionicons
                color={isOverdue ? colors.danger : colors.success}
                name="time-outline"
                size={22}
              />
            </View>
            <View style={styles.timelineCopy}>
              <Text style={[styles.timelineHeading, isOverdue && styles.overdueText]}>
                {formatTimeRemaining(complaint.dueAt, complaint.status)}
              </Text>
              <Text style={styles.timelineMeta}>
                Expected resolution: {complaint.expectedResolutionHours || 'N/A'} hour(s)
              </Text>
              <Text style={styles.timelineMeta}>Due by: {formatDueDate(complaint.dueAt)}</Text>
            </View>
          </View>
          {complaint.assignmentSource ? (
            <Text style={styles.meta}>
              Assignment: {complaint.assignmentSource === 'auto' ? 'Auto assigned by specialty' : 'Manually assigned'}
            </Text>
          ) : null}
        </Card.Content>
      </Card>

      {canManageComplaints && (
        <Surface elevation={1} style={styles.panel}>
          <Text style={styles.sectionTitle}>Assign worker</Text>
          <Text style={styles.helperText}>
            Choose one worker from a searchable list, then confirm assignment with a single action.
          </Text>
          <FormInput
            label="Assignment remark"
            multiline
            onChangeText={value => {
              setFeedbackMessage('');
              setAssignRemark(value);
            }}
            placeholder="Optional note for the worker"
            value={assignRemark}
          />
          <Surface elevation={0} style={styles.selectedWorkerCard}>
            <Text style={styles.selectedWorkerLabel}>Selected worker</Text>
            <Text style={styles.selectedWorkerValue}>
              {selectedWorker
                ? `${selectedWorker.name} (${selectedWorker.email})`
                : complaint.assignedTo
                  ? `${complaint.assignedTo.name} (currently assigned)`
                  : 'No worker selected'}
            </Text>
          </Surface>
          <Button
            mode="outlined"
            onPress={() => {
              setWorkerSearch('');
              setWorkerDialogVisible(true);
            }}
          >
            {selectedWorker ? 'Change worker' : 'Choose worker'}
          </Button>
          <PrimaryButton
            label={
              assigningWorkerId
                ? 'Assigning...'
                : selectedWorker
                  ? `Assign to ${selectedWorker.name}`
                  : 'Select a worker first'
            }
            loading={Boolean(assigningWorkerId)}
            onPress={() => handleAssign(selectedWorker)}
            disabled={!selectedWorker || complaint.assignedTo?._id === selectedWorker._id}
          />
          {!workers.length ? (
            <Text style={styles.meta}>No worker accounts found yet. Create a worker and set the role to worker.</Text>
          ) : null}
        </Surface>
      )}

      {(canManageComplaints || user?.role === 'worker') && (
        <Surface elevation={1} style={styles.panel}>
          <Text style={styles.sectionTitle}>Update status</Text>
          <View style={styles.statusSelector}>
            {statusOptions.map(status => (
              <Chip
                compact
                key={status}
                mode={selectedStatus === status ? 'flat' : 'outlined'}
                onPress={() => {
                  setFeedbackMessage('');
                  setSelectedStatus(status);
                }}
                selected={selectedStatus === status}
                style={[styles.statusChip, selectedStatus === status && styles.statusChipActive]}
                textStyle={[
                  styles.statusChipText,
                  selectedStatus === status && styles.statusChipTextActive,
                ]}
              >
                {status}
              </Chip>
            ))}
          </View>
          {canManageComplaints ? (
            <View style={styles.statusSelector}>
              {priorityOptions.map(priority => (
                <Chip
                  compact
                  key={priority}
                  mode={selectedPriority === priority ? 'flat' : 'outlined'}
                  onPress={() => {
                    setFeedbackMessage('');
                    setSelectedPriority(priority);
                  }}
                  selected={selectedPriority === priority}
                  style={[styles.statusChip, selectedPriority === priority && styles.statusChipActive]}
                  textStyle={[
                    styles.statusChipText,
                    selectedPriority === priority && styles.statusChipTextActive,
                  ]}
                >
                  Priority: {priority}
                </Chip>
              ))}
            </View>
          ) : null}
          {canManageComplaints ? (
            <FormInput
              keyboardType="numeric"
              label="Expected hours override (optional)"
              onChangeText={setExpectedResolutionHours}
              placeholder="Example: 6"
              value={expectedResolutionHours}
            />
          ) : null}
          <FormInput
            label="Remark"
            multiline
            onChangeText={value => {
              setFeedbackMessage('');
              setStatusRemark(value);
            }}
            placeholder="Add a short update for residents and admins."
            value={statusRemark}
          />
          <PrimaryButton
            label={`Save Status: ${selectedStatus || complaint.status}`}
            loading={loading}
            onPress={async () => {
              const didUpdate = await handleStatusUpdate(selectedStatus || complaint.status);

              if (didUpdate) {
                setFeedbackMessage(`Complaint marked as ${selectedStatus || complaint.status}.`);
              }
            }}
          />
        </Surface>
      )}

      {isResident && complaint.status === 'Resolved' && (
        <Surface elevation={1} style={styles.panel}>
          <Text style={styles.sectionTitle}>Resolution feedback</Text>
          {complaint.feedback?.rating ? (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackRating}>Rating: {complaint.feedback.rating}/5</Text>
              <Text style={styles.meta}>{complaint.feedback.comment || 'No comment added.'}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.helperText}>Rate the resolution quality after your issue is closed.</Text>
              <FormInput
                keyboardType="numeric"
                label="Rating (1 to 5)"
                onChangeText={setRating}
                placeholder="Example: 5"
                value={rating}
              />
              <FormInput
                label="Comment"
                multiline
                onChangeText={setFeedbackComment}
                placeholder="Was the issue resolved properly?"
                value={feedbackComment}
              />
              <PrimaryButton label="Submit feedback" loading={loading} onPress={handleFeedbackSubmit} />
            </>
          )}
        </Surface>
      )}

      {!!complaint.remarks?.length && (
        <Surface elevation={1} style={styles.panel}>
          <Text style={styles.sectionTitle}>Remarks timeline</Text>
          {complaint.remarks.map(item => (
            <View key={item._id} style={styles.remarkRow}>
              <Text style={styles.remarkAuthor}>{item.addedBy?.name || 'System'}</Text>
              <Text style={styles.remarkText}>{item.text}</Text>
            </View>
          ))}
        </Surface>
      )}
    </ScreenContainer>
  );
}

function SummaryItem({ label, value }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
  },
  cardContent: {
    gap: 12,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  dialogContent: {
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleBlock: {
    flex: 1,
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
  metaGroup: {
    gap: 6,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryItem: {
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    backgroundColor: colors.surfaceMuted,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    color: colors.text,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
  },
  overdueText: {
    color: colors.danger,
    fontWeight: '800',
  },
  timelinePanel: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  timelinePanelOverdue: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#fecaca',
  },
  timelineIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  timelineCopy: {
    flex: 1,
    gap: 3,
  },
  timelineHeading: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '900',
  },
  timelineMeta: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  helperText: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  searchbar: {
    backgroundColor: colors.surfaceMuted,
  },
  searchInput: {
    color: colors.text,
  },
  workerPickerList: {
    gap: 10,
    maxHeight: 320,
  },
  workerPickerItem: {
    justifyContent: 'flex-start',
  },
  selectedWorkerCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.surfaceMuted,
  },
  selectedWorkerLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  selectedWorkerValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  statusChipActive: {
    backgroundColor: colors.primarySoft,
  },
  statusChipText: {
    color: colors.text,
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: colors.primary,
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
  feedbackBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.surfaceMuted,
    gap: 6,
  },
  feedbackRating: {
    color: colors.text,
    fontWeight: '900',
  },
});
