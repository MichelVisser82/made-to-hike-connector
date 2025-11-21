import { useState } from "react";
import {
  X, Plus, Mail, Copy, CheckCircle, Clock, AlertCircle, Trash2,
  Send, ExternalLink, User, Shield, FileText, Phone as PhoneIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Participant {
  id: string;
  name: string;
  email: string;
  status: "complete" | "in_progress" | "not_started" | "invited";
  invitedAt?: string;
  completedAt?: string;
  waiverStatus?: boolean;
  insuranceStatus?: boolean;
  emergencyContactStatus?: boolean;
  uniqueLink?: string;
}

interface ParticipantManagementModalProps {
  open: boolean;
  onClose: () => void;
  bookingReference: string;
  tourName: string;
  participants: Participant[];
  maxParticipants: number;
  onAddParticipant: (name: string, email: string) => void;
  onSendInvite: (participantId: string, email?: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  onUpdateEmail: (participantId: string, email: string) => void;
}

export default function ParticipantManagementModal({
  open,
  onClose,
  bookingReference,
  tourName,
  participants,
  maxParticipants,
  onAddParticipant,
  onSendInvite,
  onRemoveParticipant,
  onUpdateEmail
}: ParticipantManagementModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleAddParticipant = () => {
    if (newName && newEmail) {
      onAddParticipant(newName, newEmail);
      setNewName("");
      setNewEmail("");
      setShowAddForm(false);
    }
  };

  const copyToClipboard = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const completedCount = participants.filter(p => p.status === "complete").length;
  const totalCount = participants.length;
  const remainingSlots = maxParticipants - (totalCount + 1); // +1 for the booker who's not in this list
  const canAddMore = remainingSlots > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{fontFamily: 'Playfair Display, serif'}}>
            Manage Participants
          </DialogTitle>
          <p className="text-sm text-charcoal/60">
            {tourName} • Booking #{bookingReference}
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
          {/* Progress Overview */}
          <Card className="p-4 bg-cream/50 border-burgundy/10 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-medium text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
                  {completedCount} / {totalCount}
                </div>
                <div className="text-sm text-charcoal/60">Participants Complete</div>
                <div className="text-xs text-charcoal/50 mt-1">
                  {totalCount + 1} of {maxParticipants} spots filled
                </div>
              </div>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                disabled={!canAddMore}
                className="bg-burgundy hover:bg-burgundy-dark text-white disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Participant
              </Button>
            </div>
            {!canAddMore && (
              <div className="mt-2 text-xs text-burgundy">
                All participant spots are filled for this booking
              </div>
            )}
          </Card>

          {/* Add Participant Form */}
          {showAddForm && (
            <Card className="p-4 mb-6 bg-white border-burgundy/20 border-2">
              <h3 className="font-medium text-charcoal mb-4">Add New Participant</h3>
              <div className="space-y-3">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., John Smith"
                    className="border-burgundy/20"
                  />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g., john.smith@email.com"
                    className="border-burgundy/20"
                  />
                </div>
                <Alert className="bg-sage/10 border-sage/20">
                  <Mail className="h-4 w-4 text-sage" />
                  <AlertDescription className="text-xs text-charcoal/70">
                    The participant will be added to your booking. You can send them an invitation link after adding them.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewName("");
                      setNewEmail("");
                    }}
                    className="flex-1 border-burgundy/30 text-burgundy"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddParticipant}
                    disabled={!newName || !newEmail}
                    className="flex-1 bg-sage hover:bg-sage/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Participant
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Participants List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-charcoal/60 uppercase tracking-wider">
              All Participants ({totalCount})
            </h3>

            {participants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                onSendInvite={(email) => onSendInvite(participant.id, email)}
                onRemove={() => onRemoveParticipant(participant.id)}
                onCopyLink={(link) => copyToClipboard(link, participant.id)}
                onUpdateEmail={(email) => onUpdateEmail(participant.id, email)}
                isCopied={copiedLink === participant.id}
              />
            ))}
          </div>

          {/* Help Text */}
          <Card className="p-4 bg-cream/50 border-burgundy/10 mt-6">
            <h4 className="font-medium text-charcoal mb-2 text-sm">How it works</h4>
            <ul className="space-y-2 text-xs text-charcoal/70">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-sage mt-0.5 flex-shrink-0" />
                <span>Each participant gets a unique secure link that expires in 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-sage mt-0.5 flex-shrink-0" />
                <span>They don't need a Made to Hike account - just the email link</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-sage mt-0.5 flex-shrink-0" />
                <span>Their progress is auto-saved and you'll be notified when they complete</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-sage mt-0.5 flex-shrink-0" />
                <span>You can send reminders or regenerate links at any time</span>
              </li>
            </ul>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ParticipantCard({ 
  participant, 
  onSendInvite, 
  onRemove, 
  onCopyLink,
  onUpdateEmail,
  isCopied 
}: {
  participant: any;
  onSendInvite: (email?: string) => void;
  onRemove: () => void;
  onCopyLink: (link: string) => void;
  onUpdateEmail: (email: string) => void;
  isCopied: boolean;
}) {
  const [isEditingEmail, setIsEditingEmail] = useState(!participant.email);
  const [emailInput, setEmailInput] = useState(participant.email || "");

  const statusConfig = {
    complete: {
      badge: { bg: "bg-sage", text: "Complete" },
      color: "border-sage/30 bg-sage/5"
    },
    in_progress: {
      badge: { bg: "bg-gold", text: "In Progress" },
      color: "border-gold/30 bg-gold/5"
    },
    not_started: {
      badge: { bg: "bg-burgundy", text: "Not Started" },
      color: "border-burgundy/30 bg-burgundy/5"
    },
    invited: {
      badge: { bg: "bg-burgundy", text: "Invited" },
      color: "border-burgundy/30 bg-burgundy/5"
    }
  };

  const config = statusConfig[participant.status];
  const initials = participant.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSaveEmail = () => {
    if (emailInput && emailInput !== participant.email) {
      onUpdateEmail(emailInput);
      setIsEditingEmail(false);
    }
  };

  const isEmailValid = emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);
  const hasEmail = participant.email && participant.email.length > 0;

  return (
    <Card className={`p-4 border ${config.color}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={`${config.badge.bg} text-white text-sm`}>
            {initials}
          </AvatarFallback>
        </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-charcoal truncate">{participant.name}</h4>
                {isEditingEmail ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="participant@email.com"
                      className="h-8 text-sm border-burgundy/20"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveEmail}
                      disabled={!isEmailValid}
                      className="bg-sage hover:bg-sage/90 text-white h-8"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-charcoal/60 truncate">{participant.email}</p>
                )}
              </div>
              <Badge className={`${config.badge.bg} text-white border-0 ml-2 flex-shrink-0`}>
                {config.badge.text}
              </Badge>
            </div>

          {/* Status Details */}
          {participant.status === "complete" && (
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-xs text-charcoal/70">
                <CheckCircle className="w-3.5 h-3.5 text-sage" />
                <span>All documents submitted</span>
                <span className="text-charcoal/50">• {participant.completedAt}</span>
              </div>
            </div>
          )}

          {participant.status === "in_progress" && (
            <div className="space-y-1.5 mb-3">
              {participant.waiverStatus && (
                <div className="flex items-center gap-2 text-xs text-charcoal/70">
                  <CheckCircle className="w-3.5 h-3.5 text-sage" />
                  <span>Waiver signed</span>
                </div>
              )}
              {!participant.insuranceStatus && (
                <div className="flex items-center gap-2 text-xs text-gold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Insurance pending</span>
                </div>
              )}
            </div>
          )}

          {(participant.status === "not_started" || participant.status === "invited") && (
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-xs text-burgundy">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>No documents submitted yet</span>
              </div>
              {participant.invitedAt && (
                <div className="text-xs text-charcoal/50">
                  Invited {participant.invitedAt}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {participant.status !== "complete" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendInvite(emailInput || participant.email)}
                  disabled={!hasEmail || isEditingEmail}
                  className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  {participant.status === "not_started" 
                    ? "Send Invitation"
                    : participant.status === "invited"
                    ? "Resend Invitation"
                    : "Send Reminder"}
                </Button>
                {participant.uniqueLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopyLink(participant.uniqueLink)}
                    className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy Link
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
            {participant.status === "complete" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-sage/30 text-sage hover:bg-sage/5"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                View Documents
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
