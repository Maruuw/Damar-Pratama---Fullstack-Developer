import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Building2, MapPin, Briefcase, DollarSign, Search, LogOut, CheckCircle2 } from 'lucide-react';

export const JobSeekerDashboard = () => {
  const { token, user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/jobs', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5001/api/applications/me', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const applyJob = async (jobId: string) => {
    try {
      await axios.post(`http://localhost:5001/api/applications/${jobId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error applying');
    }
  };

  const hasApplied = (jobId: string) => {
    return applications.some((app: any) => app.jobId === jobId);
  };

  const filteredJobs = jobs.filter((job: any) => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-primary-600 tracking-tight">JobPortal<span className="text-slate-900">.</span></h1>
            <nav className="hidden md:flex gap-6">
              <button onClick={() => setActiveTab('jobs')} className={`text-sm font-medium transition-colors ${activeTab === 'jobs' ? 'text-primary-600 border-b-2 border-primary-600 py-5' : 'text-slate-500 hover:text-slate-900 py-5'}`}>Temukan Pekerjaan</button>
              <button onClick={() => setActiveTab('applications')} className={`text-sm font-medium transition-colors ${activeTab === 'applications' ? 'text-primary-600 border-b-2 border-primary-600 py-5' : 'text-slate-500 hover:text-slate-900 py-5'}`}>Lamaran Saya</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-slate-600">
              Halo, <span className="font-semibold text-slate-900">{user?.name}</span>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'jobs' ? (
          <>
            {/* Search Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-3xl mx-auto flex">
              <div className="flex-1 flex items-center px-4 gap-3">
                <Search className="text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Cari nama pekerjaan, perusahaan, atau lokasi..." 
                  className="w-full py-3 outline-none text-slate-700 placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl font-medium transition-colors">
                Cari
              </button>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job: any) => (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all group flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <Building2 className="text-slate-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">{job.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{job.company.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-auto mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={16} /> {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <DollarSign size={16} /> Rp {parseInt(job.salary).toLocaleString('id-ID')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Briefcase size={16} /> {job.jobType}
                    </div>
                  </div>

                  {hasApplied(job.id) ? (
                    <button disabled className="w-full py-2.5 rounded-xl bg-green-50 text-green-700 font-medium flex items-center justify-center gap-2 cursor-not-allowed border border-green-200">
                      <CheckCircle2 size={18} /> Terkirim
                    </button>
                  ) : (
                    <button 
                      onClick={() => applyJob(job.id)}
                      className="w-full py-2.5 rounded-xl bg-white border-2 border-primary-600 text-primary-600 font-medium hover:bg-primary-50 transition-colors"
                    >
                      Lamar Sekarang
                    </button>
                  )}
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500">
                  Tidak ada lowongan yang ditemukan.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800">Riwayat Lamaran</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Belum ada lamaran terkirim.</div>
              ) : (
                applications.map((app: any) => (
                  <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-slate-900">{app.job.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{app.job.company.name} • {app.job.location}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                        ${app.status === 'APPLIED' ? 'bg-blue-100 text-blue-700' : 
                          app.status === 'REVIEWING' ? 'bg-amber-100 text-amber-700' :
                          app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 
                          'bg-red-100 text-red-700'}`}>
                        {app.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
