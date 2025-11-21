import { useState } from 'react';
import { 
  Mail, Phone, AlertCircle, Shield, CheckCircle, Clock, X, Check, 
  ChevronDown, MessageSquare, User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ParticipantDetails } from "@/types/booking";

interface ParticipantCardProps {
  booking: {
    id: string;
    booking_reference: string;
    booking_date: string;
    participants: number;
    participants_details: ParticipantDetails[];
    status: string;
    hiker: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      dietary_preferences?: any;
      emergency_contact_name?: string | null;
    };
  };
  tourDate: string;
  onSendReminder?: (hikerId: string, type: 'waiver' | 'insurance', participantIndex: number) => void;
}

const calculateDaysUntil = (tourDate: string): number => {
  const today = new Date();
  const tour = new Date(tourDate);
  return Math.ceil((tour.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getWaiverStatus = (participant: ParticipantDetails, daysUntilTour: number): 'completed' | 'pending' | 'overdue' => {
  // Check explicit status first
  if (participant.waiverStatus === 'completed') return 'completed';
  // Check if waiver was submitted
  if (participant.waiverSubmittedAt) return 'completed';
  // Determine urgency based on tour proximity
  if (daysUntilTour < 14) return 'overdue';
  return 'pending';
};

const getInsuranceStatus = (participant: ParticipantDetails, daysUntilTour: number): 'verified' | 'pending' | 'missing' => {
  // Check explicit status first
  if (participant.insuranceStatus === 'verified') return 'verified';
  // Check if insurance was submitted
  if (participant.insuranceSubmittedAt) return 'verified';
  // Determine urgency based on tour proximity
  if (daysUntilTour < 14) return 'missing';
  return 'pending';
};

export function ParticipantCard({ booking, tourDate, onSendReminder }: ParticipantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const daysUntilTour = calculateDaysUntil(tourDate);
  
  const participants = booking.participants_details || [];
  
  // Calculate overall statuses
  const participantStatuses = participants.map((participant, idx) => ({
    ...participant,
    index: idx,
    waiverStatus: getWaiverStatus(participant, daysUntilTour),
    insuranceStatus: getInsuranceStatus(participant, daysUntilTour)
  }));
  
  const allWaiversComplete = participantStatuses.every(p => p.waiverStatus === 'completed');
  const allInsuranceVerified = participantStatuses.every(p => p.insuranceStatus === 'verified');
  const hasOverdue = participantStatuses.some(p => p.waiverStatus === 'overdue' || p.insuranceStatus === 'missing');

  const waiverCount = participantStatuses.filter(p => p.waiverStatus === 'completed').length;
  const insuranceCount = participantStatuses.filter(p => p.insuranceStatus === 'verified').length;

  // Determine overall waiver status for booking
  const overallWaiverStatus = allWaiversComplete ? 'completed' : hasOverdue && waiverCount === 0 ? 'overdue' : 'pending';
  const overallInsuranceStatus = allInsuranceVerified ? 'verified' : hasOverdue && insuranceCount === 0 ? 'missing' : 'pending';

  return (
    <div className="p-6 hover:bg-cream/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-charcoal mb-1">{booking.hiker.name}</h4>
          <div className="flex items-center gap-2">
            <Badge className="bg-sage/10 text-sage border-sage/20 border text-xs">
              {booking.status}
            </Badge>
            {hasOverdue && (
              <Badge className="bg-red-50 text-red-600 border-red-200 border text-xs">
                Action Required
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-charcoal/60">
            {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-xs text-charcoal/50">{booking.participants} {booking.participants === 1 ? 'person' : 'people'}</p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-charcoal/70">
          <Mail className="w-4 h-4" />
          {booking.hiker.email}
        </div>
        {booking.hiker.phone && (
          <div className="flex items-center gap-2 text-charcoal/70">
            <Phone className="w-4 h-4" />
            {booking.hiker.phone}
          </div>
        )}
        {booking.hiker.emergency_contact_name && (
          <div className="flex items-center gap-2 text-charcoal/70">
            <Shield className="w-4 h-4" />
            Emergency: {booking.hiker.emergency_contact_name}
          </div>
        )}
      </div>

      {/* Waiver & Insurance Status Section */}
      <div className="mt-4 pt-4 border-t border-burgundy/10">
        <div className="space-y-3">
          {/* Pre-Tour Requirements Header */}
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-medium text-charcoal/60 uppercase tracking-wide">
              Pre-Tour Requirements
            </h5>
            <span className="text-xs text-charcoal/50">{daysUntilTour} days until tour</span>
          </div>

          {/* Waiver Status */}
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            overallWaiverStatus === 'completed' 
              ? 'bg-emerald-50/50 border-emerald-200' 
              : overallWaiverStatus === 'overdue'
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50/50 border-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                overallWaiverStatus === 'completed'
                  ? 'bg-emerald-100'
                  : overallWaiverStatus === 'overdue'
                  ? 'bg-red-100'
                  : 'bg-amber-100'
              }`}>
                {overallWaiverStatus === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : overallWaiverStatus === 'overdue' ? (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">Liability Waiver</p>
                <p className={`text-xs ${
                  overallWaiverStatus === 'completed'
                    ? 'text-emerald-600'
                    : overallWaiverStatus === 'overdue'
                    ? 'text-red-600'
                    : 'text-amber-600'
                }`}>
                  {overallWaiverStatus === 'completed' && `${allWaiversComplete ? 'All participants signed' : `${waiverCount} of ${booking.participants} signed`}`}
                  {overallWaiverStatus === 'pending' && 'Awaiting signature'}
                  {overallWaiverStatus === 'overdue' && 'Overdue - Action required'}
                </p>
              </div>
            </div>
            {overallWaiverStatus !== 'completed' && onSendReminder && (
              <Button 
                size="sm" 
                className={`${
                  overallWaiverStatus === 'overdue'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
                onClick={() => onSendReminder(booking.hiker.id, 'waiver', 0)}
              >
                Send Reminder
              </Button>
            )}
          </div>

          {/* Insurance Status */}
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            overallInsuranceStatus === 'verified' 
              ? 'bg-emerald-50/50 border-emerald-200' 
              : overallInsuranceStatus === 'missing'
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50/50 border-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                overallInsuranceStatus === 'verified'
                  ? 'bg-emerald-100'
                  : overallInsuranceStatus === 'missing'
                  ? 'bg-red-100'
                  : 'bg-amber-100'
              }`}>
                {overallInsuranceStatus === 'verified' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : overallInsuranceStatus === 'missing' ? (
                  <X className="w-4 h-4 text-red-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">Travel Insurance</p>
                <p className={`text-xs ${
                  overallInsuranceStatus === 'verified'
                    ? 'text-emerald-600'
                    : overallInsuranceStatus === 'missing'
                    ? 'text-red-600'
                    : 'text-amber-600'
                }`}>
                  {overallInsuranceStatus === 'verified' && `${allInsuranceVerified ? 'All verified' : `${insuranceCount} of ${booking.participants} verified`}`}
                  {overallInsuranceStatus === 'pending' && 'Pending verification'}
                  {overallInsuranceStatus === 'missing' && 'Not submitted'}
                </p>
              </div>
            </div>
            {overallInsuranceStatus !== 'verified' && onSendReminder && (
              <Button 
                size="sm" 
                className={`${
                  overallInsuranceStatus === 'missing'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
                onClick={() => onSendReminder(booking.hiker.id, 'insurance', 0)}
              >
                Send Reminder
              </Button>
            )}
          </div>

          {/* Multi-person Breakdown */}
          {booking.participants > 1 && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <div className="mt-2 p-3 bg-cream/50 rounded-lg border border-burgundy/10">
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity">
                    <span className="text-xs font-medium text-charcoal/70">
                      View Individual Status ({booking.participants} people)
                    </span>
                    <ChevronDown className={`w-4 h-4 text-charcoal/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="mt-3 space-y-2">
                    {participantStatuses.map((participant) => (
                      <div key={participant.index} className="flex items-center justify-between text-xs p-2 bg-white rounded border border-burgundy/5">
                        <span className="font-medium text-charcoal/80 flex items-center gap-2">
                          <User className="w-3 h-3" />
                          {participant.firstName} {participant.surname}
                          {participant.index === 0 && " (Lead)"}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {participant.waiverStatus === 'completed' ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <X className="w-3 h-3 text-amber-600" />
                            )}
                            <span className="text-charcoal/60">Waiver</span>
                          </div>
                          <Separator orientation="vertical" className="h-3" />
                          <div className="flex items-center gap-1">
                            {participant.insuranceStatus === 'verified' ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <X className="w-3 h-3 text-amber-600" />
                            )}
                            <span className="text-charcoal/60">Insurance</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Quick Actions for Urgent Items */}
          {hasOverdue && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-red-900">Urgent: Missing requirements</p>
                  <p className="text-xs text-red-700 mt-1">
                    Tour departs in {daysUntilTour} days. Contact {booking.hiker.name} to complete requirements.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-100"
                      onClick={() => window.location.href = `mailto:${booking.hiker.email}`}
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-100"
                      onClick={() => onSendReminder?.(booking.hiker.id, 'waiver', 0)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
