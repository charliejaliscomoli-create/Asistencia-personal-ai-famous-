import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  CalendarEventItem,
  WhatsAppMessageItem,
  EmailItem,
  AlarmItem,
  ReminderItem,
  NoteItem,
} from '../types';

export const saveUserProfileToFirestore = async (
  userId: string,
  data: { email?: string | null; displayName?: string | null }
): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}`;
  try {
    const ref = doc(db, 'users', userId);
    await setDoc(
      ref,
      {
        id: userId,
        email: data.email || '',
        displayName: data.displayName || '',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const saveEventToFirestore = async (userId: string, event: CalendarEventItem): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/events/${event.id}`;
  try {
    const ref = doc(db, 'users', userId, 'events', event.id);
    await setDoc(ref, event, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteEventFromFirestore = async (userId: string, eventId: string): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/events/${eventId}`;
  try {
    const ref = doc(db, 'users', userId, 'events', eventId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const saveAlarmToFirestore = async (userId: string, alarm: AlarmItem): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/alarms/${alarm.id}`;
  try {
    const ref = doc(db, 'users', userId, 'alarms', alarm.id);
    await setDoc(ref, alarm, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteAlarmFromFirestore = async (userId: string, alarmId: string): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/alarms/${alarmId}`;
  try {
    const ref = doc(db, 'users', userId, 'alarms', alarmId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const saveReminderToFirestore = async (userId: string, reminder: ReminderItem): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/reminders/${reminder.id}`;
  try {
    const ref = doc(db, 'users', userId, 'reminders', reminder.id);
    await setDoc(ref, reminder, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteReminderFromFirestore = async (userId: string, reminderId: string): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/reminders/${reminderId}`;
  try {
    const ref = doc(db, 'users', userId, 'reminders', reminderId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const saveNoteToFirestore = async (userId: string, note: NoteItem): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/notes/${note.id}`;
  try {
    const ref = doc(db, 'users', userId, 'notes', note.id);
    await setDoc(ref, note, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteNoteFromFirestore = async (userId: string, noteId: string): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/notes/${noteId}`;
  try {
    const ref = doc(db, 'users', userId, 'notes', noteId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const saveWhatsAppToFirestore = async (userId: string, item: WhatsAppMessageItem): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/whatsapp/${item.id}`;
  try {
    const ref = doc(db, 'users', userId, 'whatsapp', item.id);
    await setDoc(ref, item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteWhatsAppFromFirestore = async (userId: string, messageId: string): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/whatsapp/${messageId}`;
  try {
    const ref = doc(db, 'users', userId, 'whatsapp', messageId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const saveEmailToFirestore = async (userId: string, item: EmailItem): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/emails/${item.id}`;
  try {
    const ref = doc(db, 'users', userId, 'emails', item.id);
    await setDoc(ref, item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteEmailFromFirestore = async (userId: string, emailId: string): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}/emails/${emailId}`;
  try {
    const ref = doc(db, 'users', userId, 'emails', emailId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const subscribeToUserData = (
  userId: string,
  callbacks: {
    onEvents?: (items: CalendarEventItem[]) => void;
    onAlarms?: (items: AlarmItem[]) => void;
    onReminders?: (items: ReminderItem[]) => void;
    onNotes?: (items: NoteItem[]) => void;
    onWhatsApp?: (items: WhatsAppMessageItem[]) => void;
    onEmails?: (items: EmailItem[]) => void;
  }
): (() => void) => {
  if (!userId) return () => {};

  const unsubs: Unsubscribe[] = [];

  try {
    if (callbacks.onEvents) {
      const path = `users/${userId}/events`;
      const q = query(collection(db, 'users', userId, 'events'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: CalendarEventItem[] = [];
          snapshot.forEach((d) => list.push(d.data() as CalendarEventItem));
          callbacks.onEvents!(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, path);
        }
      );
      unsubs.push(unsub);
    }

    if (callbacks.onAlarms) {
      const path = `users/${userId}/alarms`;
      const q = query(collection(db, 'users', userId, 'alarms'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: AlarmItem[] = [];
          snapshot.forEach((d) => list.push(d.data() as AlarmItem));
          callbacks.onAlarms!(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, path);
        }
      );
      unsubs.push(unsub);
    }

    if (callbacks.onReminders) {
      const path = `users/${userId}/reminders`;
      const q = query(collection(db, 'users', userId, 'reminders'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: ReminderItem[] = [];
          snapshot.forEach((d) => list.push(d.data() as ReminderItem));
          callbacks.onReminders!(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, path);
        }
      );
      unsubs.push(unsub);
    }

    if (callbacks.onNotes) {
      const path = `users/${userId}/notes`;
      const q = query(collection(db, 'users', userId, 'notes'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: NoteItem[] = [];
          snapshot.forEach((d) => list.push(d.data() as NoteItem));
          callbacks.onNotes!(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, path);
        }
      );
      unsubs.push(unsub);
    }

    if (callbacks.onWhatsApp) {
      const path = `users/${userId}/whatsapp`;
      const q = query(collection(db, 'users', userId, 'whatsapp'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: WhatsAppMessageItem[] = [];
          snapshot.forEach((d) => list.push(d.data() as WhatsAppMessageItem));
          callbacks.onWhatsApp!(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, path);
        }
      );
      unsubs.push(unsub);
    }

    if (callbacks.onEmails) {
      const path = `users/${userId}/emails`;
      const q = query(collection(db, 'users', userId, 'emails'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: EmailItem[] = [];
          snapshot.forEach((d) => list.push(d.data() as EmailItem));
          callbacks.onEmails!(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, path);
        }
      );
      unsubs.push(unsub);
    }
  } catch (e) {
    console.warn('Firestore subscription failed:', e);
  }

  return () => {
    unsubs.forEach((u) => u());
  };
};
