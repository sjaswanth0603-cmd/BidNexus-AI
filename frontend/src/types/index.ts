export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  organization: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export interface Bid {
  id: string;
  bid_number: string;
  title: string;
  department: string;
  description?: string;
  deadline?: string;
  status: 'Draft' | 'Open' | 'Under Evaluation' | 'Closed' | 'Archived';
  bid_document_path?: string;
  created_at: string;
  requirements_count?: number;
}

export interface Requirement {
  id: string;
  bid_id: string;
  requirement_id: string;
  category: string;
  requirement: string;
  operator: string;
  value?: string;
  unit?: string;
  mandatory: boolean;
  evidence_required?: string;
  source_page: number;
  confidence: number;
  created_at?: string;
}

export interface Vendor {
  id: string;
  company_name: string;
  reg_number: string;
  contact_email: string;
  phone?: string;
  created_at: string;
}

export interface Document {
  id: string;
  file_name: string;
  file_size: number;
  document_type: string;
  uploaded_at: string;
}

export interface HumanReview {
  id: string;
  result_id: string;
  previous_status: string;
  final_status: string;
  reviewer_id: string;
  reason: string;
  timestamp: string;
}

export interface ComplianceResult {
  id: string;
  submission_id: string;
  requirement_id: string;
  status: 'COMPLIANT' | 'REVIEW_REQUIRED' | 'NON_COMPLIANT' | 'APPROVED' | 'REJECTED';
  confidence: number;
  reasoning: string;
  evidence_text?: string;
  source_doc_name?: string;
  source_page?: number;
  verification_method: string;
  evaluated_at: string;
  requirement?: Requirement;
  human_reviews?: HumanReview[];
}

export interface Submission {
  id: string;
  bid_id: string;
  vendor_id: string;
  submitted_at: string;
  compliance_score: number;
  status: string;
  vendor: Vendor;
  documents: Document[];
  compliance_results: ComplianceResult[];
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  timestamp: string;
  user?: User;
}
