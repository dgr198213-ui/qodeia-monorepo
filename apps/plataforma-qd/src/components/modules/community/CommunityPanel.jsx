import { useState, useEffect } from 'react';
import { Users, Heart, MessageSquare, Code2, BookOpen, Share2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const CommunityPanel = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('builders');
  const [builders, setBuilders] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, [activeTab]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'builders') {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_public', true)
          .limit(10);
        setBuilders(data || []);
      } else if (activeTab === 'resources') {
        const { data } = await supabase
          .from('resources')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(10);
        setResources(data || []);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10221f] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#10221f]/90 backdrop-blur-md border-b border-white/5 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#13ecc8]/10 rounded-xl flex items-center justify-center">
              <Users className="text-[#13ecc8]" size={24} />
            </div>
            <div>
              <div className="text-xs text-[#13ecc8] font-bold">COMUNIDAD</div>
              <div className="text-sm text-white/60">Builders & Recursos</div>
            </div>
          </div>
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/5 px-4 py-4 flex gap-4">
        <button
          onClick={() => setActiveTab('builders')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'builders'
              ? 'bg-[#13ecc8] text-[#10221f]'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          <Users size={18} className="inline mr-2" />
          Builders
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'resources'
              ? 'bg-[#13ecc8] text-[#10221f]'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          <BookOpen size={18} className="inline mr-2" />
          Recursos
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Cargando...</div>
          </div>
        ) : activeTab === 'builders' ? (
          <BuildersGrid builders={builders} />
        ) : (
          <ResourcesGrid resources={resources} />
        )}
      </div>
    </div>
  );
};

const BuildersGrid = ({ builders }) => {
  if (builders.length === 0) {
    return (
      <div className="text-center py-12 bg-[#192233] rounded-xl border border-white/5">
        <Users className="mx-auto mb-4 text-gray-500" size={32} />
        <p className="text-gray-400">No hay builders públicos aún</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {builders.map((builder) => (
        <div
          key={builder.id}
          className="bg-[#192233] rounded-xl p-6 border border-white/5 hover:border-[#13ecc8]/30 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {builder.avatar_url ? (
                <img
                  src={builder.avatar_url}
                  alt={builder.display_name}
                  className="w-12 h-12 rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-[#13ecc8]/10 rounded-lg flex items-center justify-center">
                  <Users className="text-[#13ecc8]" size={24} />
                </div>
              )}
              <div>
                <h3 className="font-bold text-white">{builder.display_name || 'Builder'}</h3>
                {builder.github_username && (
                  <a
                    href={`https://github.com/${builder.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#13ecc8] hover:underline"
                  >
                    @{builder.github_username}
                  </a>
                )}
              </div>
            </div>
          </div>

          {builder.bio && (
            <p className="text-sm text-gray-300 mb-4">{builder.bio}</p>
          )}

          {builder.skills && builder.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {builder.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-[#13ecc8]/10 text-[#13ecc8] rounded border border-[#13ecc8]/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ResourcesGrid = ({ resources }) => {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12 bg-[#192233] rounded-xl border border-white/5">
        <BookOpen className="mx-auto mb-4 text-gray-500" size={32} />
        <p className="text-gray-400">No hay recursos publicados aún</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="bg-[#192233] rounded-xl p-6 border border-white/5 hover:border-[#13ecc8]/30 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="inline-block px-2 py-1 bg-[#13ecc8]/10 text-[#13ecc8] text-xs rounded mb-2">
                {resource.resource_type}
              </div>
              <h3 className="font-bold text-white">{resource.title}</h3>
            </div>
          </div>

          {resource.description && (
            <p className="text-sm text-gray-300 mb-4 line-clamp-2">{resource.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Heart size={16} /> {resource.like_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={16} /> 0
            </span>
            <span className="flex items-center gap-1">
              <Share2 size={16} /> Compartir
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityPanel;
