export interface ArcGISUser {
  username: string;
  fullName: string;
  email: string;
  thumbnailUrl?: string;
  groups: ArcGISGroup[];
}

export interface ArcGISGroup {
  id: string;
  title: string;
}

export interface AuthState {
  token: string | null;
  user: ArcGISUser | null;
  portalUrl: string;
  setAuth: (token: string, user: ArcGISUser) => void;
  clearAuth: () => void;
}

// Feature layer record base
export interface BaseRecord {
  objectid: number;
  globalid?: string;
  created_user?: string;
  created_date?: number;
  last_edited_user?: string;
  last_edited_date?: number;
}

export interface FacilityCategory extends BaseRecord {
  facility_category: string;
}

export interface FacilityType extends BaseRecord {
  facility_type: string;
  facility_category: string; // GUID of related FacilityCategory
}

export interface FundingAgency extends BaseRecord {
  funding_agency: string;
}

export interface FundingCategory extends BaseRecord {
  funding_category: string;
  funding_type: string;
}

export interface ProjectCycleStatus extends BaseRecord {
  project_cycle_status: string;
}

export interface ProjectImplementationStatus extends BaseRecord {
  project_implementation_status: string;
}

export interface ProjectInitiatorCategory extends BaseRecord {
  project_initiator_category: string;
}

export interface ProjectType extends BaseRecord {
  project_type: string;
}

export interface Substation extends BaseRecord {
  substation_id: number;
  substation_name: string;
  substation_number: string;
  substation_type: string;
  voltage_transformation_id: string; // GUID of related VoltageTransformation
}

export interface Vendor extends BaseRecord {
  vendor_name: string;
  vendor_email: string;
  vendor_phone_number: string;
}

export interface VoltageTransformation extends BaseRecord {
  voltage_transformation: string;
}

export interface ArcGISFeature<T> {
  attributes: T;
}

export interface ArcGISQueryResponse<T> {
  features: ArcGISFeature<T>[];
  error?: { message: string };
}

export interface ArcGISEditResponse {
  addResults?: Array<{ objectId: number; success: boolean; error?: { description: string } }>;
  updateResults?: Array<{ objectId: number; success: boolean; error?: { description: string } }>;
  deleteResults?: Array<{ objectId: number; success: boolean; error?: { description: string } }>;
  error?: { message: string };
}

export interface DashboardCounts {
  facilityCategories: number;
  facilityTypes: number;
  fundingAgencies: number;
  fundingCategories: number;
  projectCycleStatuses: number;
  projectImplementationStatuses: number;
  projectInitiatorCategories: number;
  projectTypes: number;
  substations: number;
  vendors: number;
  voltageTransformations: number;
}
