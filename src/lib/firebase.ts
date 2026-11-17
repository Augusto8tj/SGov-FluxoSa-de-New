import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Inicialização segura que evita falhas durante o Module Evaluation ou SSR
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

export const isFirebaseConfigured =
  Boolean(firebaseConfig.apiKey) &&
  !firebaseConfig.apiKey.includes("placeholder") &&
  Boolean(firebaseConfig.projectId) &&
  !firebaseConfig.appId?.includes("000000000000");

let hasLoggedPlaceholderNotice = false;

export function warnPlaceholderFirebaseOnce(context: string): void {
  if (!hasLoggedPlaceholderNotice) {
    hasLoggedPlaceholderNotice = true;
    console.error(
      `Firebase (${context}): Configuração de demonstração/placeholder detectada em firebase-applet-config.json. Operando em modo rápido local sem bloqueio de rede.`
    );
  }
}

export async function withFirestoreTimeout<T>(
  operation: Promise<T>,
  label: string,
  timeoutMs: number = 4500
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Firestore timeout (${timeoutMs}ms) em ${label}`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export type FirestoreOperationType =
  | "create"
  | "update"
  | "delete"
  | "list"
  | "get"
  | "write";

export function handleFirestoreError(
  error: unknown,
  operationType: FirestoreOperationType,
  path: string | null
): never {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
  };
  const serialized = JSON.stringify(errInfo);
  console.error("Firestore Error:", serialized);
  throw new Error(serialized);
}

export { app, db, auth };
