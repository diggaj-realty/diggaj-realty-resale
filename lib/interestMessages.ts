/** An agent is auto-assigned the moment a lead is created — the platform is
 *  making an SLA promise on their behalf, and the buyer should be told, not
 *  left to wonder whether anything happened. */
export function agentAssignedMessage(interest: { agentAssigned?: boolean; agentName?: string }) {
  return interest.agentAssigned && interest.agentName ? `${interest.agentName} will call you shortly` : null;
}
