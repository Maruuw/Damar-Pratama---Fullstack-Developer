import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogOut, Building2, Plus, Users } from 'lucide-react';

export const CompanyDashboard = () => {
  const { token, user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('FULL_TIME');
  const [activeTab, setActiveTab] = useState('candidates');

  const fetchApplications = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/applications/company', { headers: { Authorization: `Bearer ${token}` } });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/jobs', 
        { title, description, location, salary: parseInt(salary), jobType }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Berhasil membuat lowongan baru!');
      setTitle('');
      setDescription('');
      setLocation('');
      setSalary('');
      setActiveTab('candidates');
    } catch (err) {
      alert('Gagal membuat lowongan');
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      await axios.patch(`http://localhost:5001/api/applications/${appId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-primary-600 tracking-tight flex items-center gap-2">
              <Building2 size={24} /> JobPortal<span className="text-slate-900">HR</span>
            </h1>
            <nav className="hidden md:flex gap-6">
              <button onClick={() => setActiveTab('candidates')} className={`text-sm font-medium transition-colors ${activeTab === 'candidates' ? 'text-primary-600 border-b-2 border-primary-600 py-5' : 'text-slate-500 hover:text-slate-900 py-5'}`}>Kelola Kandidat</button>
              <button onClick={() => setActiveTab('postJob')} className={`text-sm font-medium transition-colors ${activeTab === 'postJob' ? 'text-primary-600 border-b-2 border-primary-600 py-5' : 'text-slate-500 hover:text-slate-900 py-5'}`}>Pasang Lowongan</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-slate-600">
              Perusahaan: <span className="font-semibold text-slate-900">{user?.name}</span>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'candidates' ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <Users size={20} className="text-slate-400" /> Daftar Pelamar Masuk
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                    <th className="px-6 py-4">Nama Kandidat</th>
                    <th className="px-6 py-4">Posisi Dilamar</th>
                    <th className="px-6 py-4">Tanggal Masuk</th>
                    <th className="px-6 py-4">Status Terkini</th>
                    <th className="px-6 py-4">Aksi / Ubah Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        Belum ada lamaran masuk.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app: any) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{app.user.name}</div>
                          <div className="text-sm text-slate-500">{app.user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{app.job.title}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wider
                            ${app.status === 'APPLIED' ? 'bg-blue-100 text-blue-700' : 
                              app.status === 'REVIEWING' ? 'bg-amber-100 text-amber-700' :
                              app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 
                              'bg-red-100 text-red-700'}`}>
                            {app.status === 'APPLIED' ? 'Baru Masuk' : app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={app.status} 
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 outline-none"
                          >
                            <option value="APPLIED">Applied (Baru)</option>
                            <option value="REVIEWING">Reviewing (Sedang di-review)</option>
                            <option value="ACCEPTED">Accepted (Diterima)</option>
                            <option value="REJECTED">Rejected (Ditolak)</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 bg-white">
              <h2 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <Plus size={20} className="text-slate-400" /> Buat Lowongan Baru
              </h2>
            </div>
            <form onSubmit={handlePostJob} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Posisi / Judul Pekerjaan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Fullstack Developer"
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Pekerjaan</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ceritakan tanggung jawab dan syarat kandidat..."
                  className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi (Kota)</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Jakarta Selatan"
                    className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gaji (Angka Saja)</label>
                  <input
                    type="number"
                    required
                    placeholder="Misal: 10000000"
                    className="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Pekerjaan</label>
                <select 
                  className="block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm bg-white"
                  value={jobType} 
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="FULL_TIME">Full-Time (Penuh Waktu)</option>
                  <option value="PART_TIME">Part-Time (Paruh Waktu)</option>
                  <option value="CONTRACT">Contract (Kontrak)</option>
                  <option value="INTERNSHIP">Internship (Magang)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white px-4 py-3.5 rounded-xl font-medium transition-colors shadow-sm">
                  Publikasikan Lowongan
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
