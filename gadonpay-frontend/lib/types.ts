export type Department =
  | "ARTIBONITE"
  | "CENTRE"
  | "GRAND_ANSE"
  | "NIPPES"
  | "NORD"
  | "NORD_EST"
  | "NORD_OUEST"
  | "OUEST"
  | "SUD"
  | "SUD_EST";

export const DEPARTMENT_LABELS: Record<Department, string> = {
  ARTIBONITE: "Artibonite",
  CENTRE: "Centre",
  GRAND_ANSE: "Grand'Anse",
  NIPPES: "Nippes",
  NORD: "Nord",
  NORD_EST: "Nord-Est",
  NORD_OUEST: "Nord-Ouest",
  OUEST: "Ouest",
  SUD: "Sud",
  SUD_EST: "Sud-Est",
};

export type Provider = "NATCASH" | "MONCASH";

export type PaymentStatus =
  | "PENDING"
  | "DETECTED"
  | "MATCHED"
  | "VERIFIED"
  | "PAID"
  | "EXPIRED"
  | "FLAGGED"
  | "FAILED";

export interface Merchant {
  id: string;
  displayNumber: number;
  name: string;
  email: string;
  address: string;
  department: Department;
  phoneNumber: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  apiKeyPrefix: string;
  createdAt: string;
}

export interface ProjectWithSecrets extends Project {
  apiKey: string;
  webhookSecret: string;
}

export interface ProviderAccount {
  id: string;
  provider: Provider;
  phoneNumber: string;
}

export interface Gateway {
  id: string;
  type: "ANDROID" | "HARDWARE";
  status: "PENDING_ACTIVATION" | "ONLINE" | "OFFLINE";
  lastHeartbeatAt: string | null;
  createdAt: string;
}

export interface GatewayWithToken extends Gateway {
  token: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  provider: Provider;
  reference: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Webhook {
  id: string;
  url: string;
  active: boolean;
}
