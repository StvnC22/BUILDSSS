import type { FollowupPending } from '@/services/followup'
export function isImportantFollowup(item:FollowupPending){return item.requires_human_review||['human_review','confirm_attention'].includes(item.suggested_action)||['PENDING_REVIEW','REFERRED'].includes(item.case_status)}
export function filterImportantFollowups(items:FollowupPending[]){return items.filter(isImportantFollowup)}
