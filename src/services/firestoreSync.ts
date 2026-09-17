import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
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

export function subscribeUserData(
  userId: string,
  callbacks: {
    onEvents?: (events: CalendarEventItem[]) => void;
    onAlarms?: (alarms: AlarmItem[]) => void;
    onReminders?: (reminders: ReminderItem[]) => void;
    onNotes?: (notes: NoteItem[]) => void;
    onMessages?: (messages: WhatsAppMessageItem[]) => void;
    onEmails?: (emails: EmailItem[]) => void;
  }
) {
  const unsubs: (() => void)[] = [];

  // Events
  if (callbacks.onEvents) {
    const p = `users/${userId}/events`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'events'),
      (snapshot) => {
        const list: CalendarEventItem[] = snapshot.docs.map((d) => ({
          ...(d.data() as any),
          id: d.id,
        }));
        callbacks.onEvents!(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, p);
      }
    );
    unsubs.push(unsub);
  }

  // Alarms
  if (callbacks.onAlarms) {
    const p = `users/${userId}/alarms`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'alarms'),
      (snapshot) => {
        const list: AlarmItem[] = snapshot.docs.map((d) => ({
          ...(d.data() as any),
          id: d.id,
        }));
        callbacks.onAlarms!(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, p);
      }
    );
    unsubs.push(unsub);
  }

  // Reminders
  if (callbacks.onReminders) {
    const p = `users/${userId}/reminders`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'reminders'),
      (snapshot) => {
        const list: ReminderItem[] = snapshot.docs.map((d) => ({
          ...(d.data() as any),
          id: d.id,
        }));
        callbacks.onReminders!(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, p);
      }
    );
    unsubs.push(unsub);
  }

  // Notes
  if (callbacks.onNotes) {
    const p = `users/${userId}/notes`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'notes'),
      (snapshot) => {
        const list: NoteItem[] = snapshot.docs.map((d) => ({
          ...(d.data() as any),
          id: d.id,
        }));
        callbacks.onNotes!(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, p);
      }
    );
    unsubs.push(unsub);
  }

  // WhatsApp Messages
  if (callbacks.onMessages) {
    const p = `users/${userId}/messages`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'messages'),
      (snapshot) => {
        const list: WhatsAppMessageItem[] = snapshot.docs.map((d) => ({
          ...(d.data() as any),
          id: d.id,
        }));
        callbacks.onMessages!(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, p);
      }
    );
    unsubs.push(unsub);
  }

  // Emails
  if (callbacks.onEmails) {
    const p = `users/${userId}/emails`;
    const unsub = onSnapshot(
      collection(db, 'users', userId, 'emails'),
      (snapshot) => {
        const list: EmailItem[] = snapshot.docs.map((d) => ({
          ...(d.data() as any),
          id: d.id,
        }));
        callbacks.onEmails!(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, p);
      }
    );
    unsubs.push(unsub);
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}

// Write / Upsert helpers
export async function saveEventToFirestore(userId: string, event: CalendarEventItem) {
  const p = `users/${userId}/events/${event.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'events', event.id), {
      ...event,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, p);
  }
}

export async function saveAlarmToFirestore(userId: string, alarm: AlarmItem) {
  const p = `users/${userId}/alarms/${alarm.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'alarms', alarm.id), {
      ...alarm,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, p);
  }
}

export async function saveReminderToFirestore(userId: string, reminder: ReminderItem) {
  const p = `users/${userId}/reminders/${reminder.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'reminders', reminder.id), {
      ...reminder,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, p);
  }
}

export async function saveNoteToFirestore(userId: string, note: NoteItem) {
  const p = `users/${userId}/notes/${note.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'notes', note.id), {
      ...note,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, p);
  }
}

export async function saveMessageToFirestore(userId: string, msg: WhatsAppMessageItem) {
  const p = `users/${userId}/messages/${msg.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'messages', msg.id), {
      ...msg,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, p);
  }
}

export async function saveEmailToFirestore(userId: string, email: EmailItem) {
  const p = `users/${userId}/emails/${email.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'emails', email.id), {
      ...email,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, p);
  }
}

// Delete helpers
export async function deleteItemFromFirestore(
  userId: string,
  collectionName: 'events' | 'alarms' | 'reminders' | 'notes' | 'messages' | 'emails',
  itemId: string
) {
  const p = `users/${userId}/${collectionName}/${itemId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, collectionName, itemId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, p);
  }
}
