import React from 'react';
import { ResaResponse } from '../types';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, Mail, Copy, RefreshCw, Send } from 'lucide-react';

interface ItineraryDisplayProps {
  data: ResaResponse;
  agentEmail?: string;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ data, agentEmail }) => {
  const { itinerary, appointmentRequestEmails, updatedItineraryEmail, tourSummaryEmail } = data;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const handleMailTo = (to: string | null, subject: string | null, body: string | null, cc: string | null = null) => {
      const recipient = to || '';
      const subj = encodeURIComponent(subject || '');
      const bdy = encodeURIComponent(body || '');
      const ccParam = cc ? `&cc=${encodeURIComponent(cc)}` : '';
      window.location.href = `mailto:${recipient}?subject=${subj}&body=${bdy}${ccParam}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header Summary */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {itinerary.tourName || 'Showing Tour'}
           </h2>
           <p className="text-indigo-100 text-sm mt-1">
             {itinerary.tourDate} • Starts at {itinerary.startTime}
           </p>
        </div>

        {/* Timeline */}
        <div className="p-6">
          <div className="space-y-0">
            {itinerary.stops.map((stop, idx) => {
              const isLast = idx === itinerary.stops.length - 1;
              const isVacant = stop.occupancyStatus.includes("Vacant");
              const isConfirmed = stop.appointmentStatus === "Confirmed";
              
              return (
                <div key={idx} className="relative flex gap-6 group">
                  {/* Vertical Line */}
                  {!isLast && (
                    <div className="absolute left-[1.15rem] top-8 bottom-[-2rem] w-0.5 bg-slate-200 group-last:hidden"></div>
                  )}
                  
                  {/* Time & Indicator */}
                  <div className="flex flex-col items-center min-w-[4rem]">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 z-10 bg-white
                      ${isVacant || isConfirmed ? 'border-green-500 text-green-700' : 'border-amber-500 text-amber-700'}
                    `}>
                      {idx + 1}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-500 text-center">
                      {stop.startTime}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 pb-8">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{stop.address}</h3>
                          {stop.mlsId && <span className="text-xs text-slate-500">MLS: {stop.mlsId}</span>}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
                          ${isVacant || isConfirmed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {isVacant || isConfirmed ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                          {stop.appointmentStatus}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                          <Clock size={14} className="text-indigo-500" />
                          <span>{stop.startTime} - {stop.endTime}</span>
                        </div>
                        {stop.driveTimeFromPreviousMinutes !== null && stop.driveTimeFromPreviousMinutes > 0 && (
                          <div className="text-xs text-slate-400 italic">
                            +{stop.driveTimeFromPreviousMinutes}m drive
                          </div>
                        )}
                      </div>
                      
                      {/* Agent Info if needed */}
                      {stop.listingAgentName && (
                        <div className="mt-3 text-xs text-slate-500 border-t border-slate-200 pt-2 flex items-center gap-2">
                            <span className="font-medium">Listing Agent:</span> {stop.listingAgentName}
                            {stop.listingAgentEmail && <span className="text-slate-400">({stop.listingAgentEmail})</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Client Tour Summary Email Section */}
      {tourSummaryEmail && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-600" />
            Client Tour Summary Email
          </h3>
          <div className="bg-white rounded-lg shadow-sm border border-indigo-200 overflow-hidden ring-1 ring-indigo-500/20">
             <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Ready to Send</span>
                      <span className="text-sm font-semibold text-slate-800 truncate max-w-md">{tourSummaryEmail.subject}</span>
                   </div>
                   <div className="flex gap-2">
                       <button 
                        onClick={() => handleMailTo(tourSummaryEmail.to, tourSummaryEmail.subject, tourSummaryEmail.body, agentEmail)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 px-4 py-2 rounded-full transition-colors shadow-sm"
                       >
                         <Mail size={14} /> Send to Client & Agent
                       </button>
                       <button 
                        onClick={() => copyToClipboard(`To: ${tourSummaryEmail.to}\nCc: ${agentEmail || ''}\nSubject: ${tourSummaryEmail.subject}\n\n${tourSummaryEmail.body}`)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 px-3 py-2 rounded-full hover:bg-white transition-colors border border-transparent hover:border-indigo-100"
                       >
                         <Copy size={14} /> Copy
                       </button>
                   </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-[3rem_1fr] gap-2 text-sm">
                    <span className="text-slate-400 font-medium text-right">To:</span>
                    <span className="text-slate-800 select-all">{tourSummaryEmail.to || '(No Client Email Provided)'}</span>
                    {agentEmail && (
                        <>
                            <span className="text-slate-400 font-medium text-right">Cc:</span>
                            <span className="text-slate-800 select-all">{agentEmail} (You)</span>
                        </>
                    )}
                    <span className="text-slate-400 font-medium text-right">Subj:</span>
                    <span className="text-slate-800 font-medium select-all">{tourSummaryEmail.subject}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-indigo-50">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded select-all">
                      {tourSummaryEmail.body}
                    </pre>
                  </div>
                </div>
          </div>
        </div>
      )}

      {/* Updated Itinerary Email Section (Only if separate from summary) */}
      {updatedItineraryEmail && updatedItineraryEmail.send && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600" />
            Update Notification
          </h3>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">For Agent/Client</span>
                      <span className="text-sm font-semibold text-slate-800 truncate max-w-md">{updatedItineraryEmail.subject}</span>
                   </div>
                   <div className="flex gap-2">
                    <button 
                        onClick={() => handleMailTo(updatedItineraryEmail.to, updatedItineraryEmail.subject, updatedItineraryEmail.body, updatedItineraryEmail.cc)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                    >
                        <Mail size={14} /> Mail App
                    </button>
                    <button 
                        onClick={() => copyToClipboard(`To: ${updatedItineraryEmail.to}\nSubject: ${updatedItineraryEmail.subject}\n\n${updatedItineraryEmail.body}`)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                    >
                        <Copy size={14} /> Copy
                    </button>
                   </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-[3rem_1fr] gap-2 text-sm">
                    <span className="text-slate-400 font-medium text-right">To:</span>
                    <span className="text-slate-800 select-all">{updatedItineraryEmail.to || '(No Email)'}</span>
                    <span className="text-slate-400 font-medium text-right">Subj:</span>
                    <span className="text-slate-800 font-medium select-all">{updatedItineraryEmail.subject}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded select-all">
                      {updatedItineraryEmail.body}
                    </pre>
                  </div>
                </div>
          </div>
        </div>
      )}

      {/* Generated Appointment Requests Section */}
      {appointmentRequestEmails.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Listing Agent Appointment Requests
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {appointmentRequestEmails.map((email, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Draft {idx + 1}</span>
                      <span className="text-sm font-semibold text-slate-800 truncate max-w-md">{email.subject}</span>
                   </div>
                   <div className="flex gap-2">
                        <button 
                            onClick={() => handleMailTo(email.to, email.subject, email.body, email.cc)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                        >
                            <Mail size={14} /> Mail App
                        </button>
                        <button 
                            onClick={() => copyToClipboard(`To: ${email.to}\nSubject: ${email.subject}\n\n${email.body}`)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                        >
                            <Copy size={14} /> Copy
                        </button>
                   </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-[3rem_1fr] gap-2 text-sm">
                    <span className="text-slate-400 font-medium text-right">To:</span>
                    <span className="text-slate-800 select-all">{email.to}</span>
                    
                    {email.cc && (
                      <>
                        <span className="text-slate-400 font-medium text-right">Cc:</span>
                        <span className="text-slate-800 select-all">{email.cc}</span>
                      </>
                    )}
                    
                    <span className="text-slate-400 font-medium text-right">Subj:</span>
                    <span className="text-slate-800 font-medium select-all">{email.subject}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded select-all">
                      {email.body}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};