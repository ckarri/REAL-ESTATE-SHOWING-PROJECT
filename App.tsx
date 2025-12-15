import React, { useState } from 'react';
import { Plus, Sparkles, Map, UserCircle, Car, ArrowLeft, RotateCcw, ExternalLink } from 'lucide-react';
import { PropertyInput, AgentInfo, TourMetadata, ResaResponse } from './types';
import { PropertyForm } from './components/PropertyForm';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { generateItinerary } from './services/resaService';

const INITIAL_PROPERTY: PropertyInput = {
  id: '1',
  address: '',
  driveTimeFromPrevious: 15,
  occupancy: 'Occupied',
  isConfirmed: false,
};

function App() {
  // State
  const [view, setView] = useState<'input' | 'result'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [agentInfo, setAgentInfo] = useState<AgentInfo>({
    name: 'Chak Karri',
    email: 'chak@example.com',
    phone: '512-555-1212',
  });

  const [tourMeta, setTourMeta] = useState<TourMetadata>({
    tourName: 'Smith Buyers Tour',
    tourDate: '2025-12-20',
    startTime: '10:00',
    defaultDuration: 15,
    buyerEmail: 'buyer@example.com',
    isUpdateRun: false,
  });

  const [properties, setProperties] = useState<PropertyInput[]>([
    {
      id: '1',
      address: '123 Main St, Austin, TX 78701',
      mlsId: '1234567',
      driveTimeFromPrevious: 0,
      occupancy: 'Vacant',
      isConfirmed: true,
      listingAgentName: 'John Doe',
      listingAgentEmail: 'john@example.com'
    },
    {
      id: '2',
      address: '456 Oak Dr, Austin, TX 78702',
      mlsId: '7654321',
      driveTimeFromPrevious: 12,
      occupancy: 'Vacant', // Updated manually as requested
      isConfirmed: false,
      listingAgentName: 'Sara Agent',
      listingAgentEmail: 'sara@example.com'
    },
    {
      id: '3',
      address: '789 Pine Ln, Austin, TX 78703',
      mlsId: '8889999',
      driveTimeFromPrevious: 8,
      occupancy: 'Occupied',
      isConfirmed: false,
      listingAgentName: 'Mike Listing',
      listingAgentEmail: 'mike@example.com'
    }
  ]);
  const [result, setResult] = useState<ResaResponse | null>(null);

  // Handlers
  const addProperty = () => {
    setProperties([
      ...properties,
      { ...INITIAL_PROPERTY, id: Date.now().toString() },
    ]);
  };

  const updateProperty = (id: string, updates: Partial<PropertyInput>) => {
    setProperties(properties.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const removeProperty = (id: string) => {
    if (properties.length > 1) {
      setProperties(properties.filter((p) => p.id !== id));
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Basic validation
      if (!agentInfo.name || !agentInfo.email) throw new Error("Agent info is required.");
      if (properties.some(p => !p.address)) throw new Error("All properties must have an address.");

      const data = await generateItinerary(agentInfo, tourMeta, properties);
      setResult(data);
      setView('result');
    } catch (err: any) {
      setError(err.message || "Failed to generate itinerary.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
      setView('input');
      setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Map className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight">RESA</span>
          </div>
          <div className="flex items-center gap-3">
             <a 
                href="https://matrix.abor.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
             >
                <ExternalLink size={14} /> Open ABOR Matrix
             </a>
             {view === 'result' && (
                <button 
                    onClick={handleReset}
                    className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                >
                    <ArrowLeft size={16} /> Edit Details
                </button>
             )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                <div className="mt-0.5"><Sparkles size={16} className="rotate-180" /></div>
                <div>{error}</div>
            </div>
        )}

        {view === 'input' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Sidebar: Tour & Agent Info */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Agent Info Card */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <UserCircle className="text-indigo-500" /> Agent Profile
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={agentInfo.name}
                      onChange={(e) => setAgentInfo({ ...agentInfo, name: e.target.value })}
                      className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                      placeholder="Jane Agent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={agentInfo.email}
                      onChange={(e) => setAgentInfo({ ...agentInfo, email: e.target.value })}
                      className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                      placeholder="jane@agency.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={agentInfo.phone}
                      onChange={(e) => setAgentInfo({ ...agentInfo, phone: e.target.value })}
                      className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Tour Meta Card */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Car className="text-indigo-500" /> Tour Details
                </h2>
                <div className="space-y-3">
                   <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Tour Name (Optional)</label>
                    <input
                      type="text"
                      value={tourMeta.tourName}
                      onChange={(e) => setTourMeta({ ...tourMeta, tourName: e.target.value })}
                      className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                      placeholder="Saturday Buyer Tour"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Buyer Email (Optional)</label>
                    <input
                      type="email"
                      value={tourMeta.buyerEmail || ''}
                      onChange={(e) => setTourMeta({ ...tourMeta, buyerEmail: e.target.value })}
                      className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                      placeholder="client@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                      <input
                        type="date"
                        value={tourMeta.tourDate}
                        onChange={(e) => setTourMeta({ ...tourMeta, tourDate: e.target.value })}
                        className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={tourMeta.startTime}
                        onChange={(e) => setTourMeta({ ...tourMeta, startTime: e.target.value })}
                        className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Duration per Home (min)</label>
                    <input
                      type="number"
                      value={tourMeta.defaultDuration}
                      onChange={(e) => setTourMeta({ ...tourMeta, defaultDuration: parseInt(e.target.value) || 15 })}
                      className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    />
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100 mt-2">
                     <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isUpdateRun"
                            checked={tourMeta.isUpdateRun || false}
                            onChange={(e) => setTourMeta({ ...tourMeta, isUpdateRun: e.target.checked })}
                            className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor="isUpdateRun" className="text-xs text-slate-600 cursor-pointer">
                            Generate 'Updated Itinerary' Email
                        </label>
                     </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Main Content: Properties List */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Properties</h2>
                <p className="text-slate-500 text-sm">Add homes in the order you want to visit them.</p>
              </div>

              <div className="space-y-4">
                {properties.map((prop, index) => (
                  <PropertyForm
                    key={prop.id}
                    property={prop}
                    index={index}
                    onUpdate={updateProperty}
                    onRemove={removeProperty}
                  />
                ))}
              </div>

              <button
                onClick={addProperty}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-medium hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add Another Property
              </button>

               <div className="sticky bottom-4 z-20 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className={`
                    w-full py-4 rounded-xl shadow-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all transform
                    ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1'}
                  `}
                >
                  {isLoading ? (
                    <>
                      <RotateCcw className="animate-spin" /> Generating Itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles /> Generate Itinerary
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          result && <ItineraryDisplay data={result} agentEmail={agentInfo.email} />
        )}
      </main>
    </div>
  );
}

export default App;