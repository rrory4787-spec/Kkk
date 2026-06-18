import { doc, getDoc, onSnapshot, setDoc, collection, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { GlobalConfig, InvestmentPackage } from '../types';
import { handleFirestoreError, OperationType } from './error-handler';

export const subscribeToConfig = (callback: (config: GlobalConfig) => void) => {
  const docRef = doc(db, 'config', 'global');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      // Safely convert Timestamp to Date
      if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        data.updatedAt = data.updatedAt.toDate();
      }
      callback(data as GlobalConfig);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'config/global');
  });
};

export const subscribeToPackages = (callback: (packages: InvestmentPackage[]) => void) => {
  const colRef = collection(db, 'packages');
  const q = query(colRef);
  return onSnapshot(q, (snapshot) => {
    const pkgs = snapshot.docs.map(doc => {
      const data = doc.data();
      // Safely convert Timestamp to Date
      if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        data.updatedAt = data.updatedAt.toDate();
      }
      return { id: doc.id, ...data } as InvestmentPackage;
    });
    callback(pkgs);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'packages');
  });
};

export const updateGlobalConfig = async (config: Partial<GlobalConfig>) => {
  const docRef = doc(db, 'config', 'global');
  try {
    await setDoc(docRef, { 
      ...config, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'config/global');
  }
};

export const updatePackage = async (packageId: string, pkg: Partial<InvestmentPackage>) => {
  const docRef = doc(db, 'packages', packageId);
  try {
    await setDoc(docRef, { 
      ...pkg, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `packages/${packageId}`);
  }
};

export const getInitialData = async () => {
  const configDoc = await getDoc(doc(db, 'config', 'global'));
  const pkgsSnap = await getDocs(collection(db, 'packages'));
  
  return {
    config: configDoc.exists() ? configDoc.data() as GlobalConfig : null,
    packages: pkgsSnap.docs.map(d => ({ id: d.id, ...d.data() } as InvestmentPackage))
  };
};
