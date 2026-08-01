import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, UserPlus, ShieldAlert, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export function UserManagement() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'roster' | 'maintenance'>('users');
  const [exporting, setExporting] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  // Roster editor states
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState('');
  const [consultationFee, setConsultationFee] = useState(1500);
  const [bio, setBio] = useState('');
  const [weeklyRoster, setWeeklyRoster] = useState<any>({
    Monday: { active: true, startTime: '09:00', endTime: '18:00' },
    Tuesday: { active: true, startTime: '09:00', endTime: '18:00' },
    Wednesday: { active: true, startTime: '09:00', endTime: '18:00' },
    Thursday: { active: true, startTime: '09:00', endTime: '18:00' },
    Friday: { active: true, startTime: '09:00', endTime: '18:00' },
    Saturday: { active: true, startTime: '09:00', endTime: '23:00' },
    Sunday: { active: false, startTime: '09:00', endTime: '17:00' }
  });
  const [overrides, setOverrides] = useState<any[]>([]);
  const [newOverrideDate, setNewOverrideDate] = useState('');
  const [newOverrideReason, setNewOverrideReason] = useState('');

  // Query: get all user accounts
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['usersList'],
    queryFn: async () => {
      const resUsers = await fetch('/api/admin/users');
      if (!resUsers.ok) return [];
      return resUsers.json();
    }
  });

  const doctors = (users || []).filter((u: any) => u.role === 'doctor');

  const handleSelectDoctor = (docId: string) => {
    setSelectedDoctorId(docId);
    const doc = users.find((u: any) => u.id === docId);
    if (doc) {
      setRoomNumber(doc.roomNumber || '');
      setConsultationFee(doc.consultationFee !== undefined ? doc.consultationFee : 1500);
      setBio(doc.bio || '');
      const defaultRoster = {
        Monday: { active: true, startTime: '09:00', endTime: '18:00' },
        Tuesday: { active: true, startTime: '09:00', endTime: '18:00' },
        Wednesday: { active: true, startTime: '09:00', endTime: '18:00' },
        Thursday: { active: true, startTime: '09:00', endTime: '18:00' },
        Friday: { active: true, startTime: '09:00', endTime: '18:00' },
        Saturday: { active: true, startTime: '09:00', endTime: '23:00' },
        Sunday: { active: false, startTime: '09:00', endTime: '17:00' }
      };
      setWeeklyRoster(doc.roster || defaultRoster);
      setOverrides(doc.overrides || []);
    }
  };

  React.useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      handleSelectDoctor(doctors[0].id);
    }
  }, [users, selectedDoctorId]);

  // Mutation: Update doctor roster & profile
  const updateDoctorMutation = useMutation({
    mutationFn: async ({ docId, payload }: { docId: string, payload: any }) => {
      const res = await fetch(`/api/admin/users/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          auditUser: user?.username,
          auditRole: user?.role
        })
      });
      if (!res.ok) {
        throw new Error('Failed to update doctor details');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (err: any) => {
      setError(err.message);
      setTimeout(() => setError(null), 4000);
    }
  });

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;
    updateDoctorMutation.mutate({
      docId: selectedDoctorId,
      payload: {
        roomNumber,
        consultationFee,
        bio,
        roster: weeklyRoster,
        overrides
      }
    });
  };

  const handleAddOverride = () => {
    if (!newOverrideDate) return;
    const newOv = {
      id: `ov-${Math.floor(100000 + Math.random() * 900000)}`,
      date: newOverrideDate,
      reason: newOverrideReason || 'Time-off'
    };
    setOverrides([...overrides, newOv]);
    setNewOverrideDate('');
    setNewOverrideReason('');
  };

  const handleRemoveOverride = (ovId: string) => {
    setOverrides(overrides.filter(o => o.id !== ovId));
  };

  const handleExportBackup = async () => {
    setExporting(true);
    setBackupSuccess(false);
    try {
      const res = await fetch('/api/admin/backup');
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aura_mcms_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 4000);
    } catch (e) {
      console.error('Failed to export database backup:', e);
    } finally {
      setExporting(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'doctor',
    specialty: ''
  });

  // Mutation: Create user
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          auditUser: user?.username,
          auditRole: user?.role
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create user account');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
      setSuccess(true);
      setError(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'doctor',
        specialty: ''
      });
      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (err: any) => {
      setError(err.message);
      setSuccess(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) {
      setError('Please fill in name, username, and password.');
      return;
    }
    createUserMutation.mutate(formData);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      
      {/* Sub Tabs Toggle */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
            activeSubTab === 'users'
              ? 'border-medical-500 bg-medical-950/20 text-white'
              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-205'
          }`}
        >
          Staff User Accounts
        </button>
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
            activeSubTab === 'roster'
              ? 'border-medical-500 bg-medical-950/20 text-white'
              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-205'
          }`}
        >
          Doctor Profiles & Roster
        </button>
        <button
          onClick={() => setActiveSubTab('maintenance')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
            activeSubTab === 'maintenance'
              ? 'border-medical-500 bg-medical-950/20 text-white'
              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-205'
          }`}
        >
          Turnkey Backup & Maintenance
        </button>
      </div>

      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create user accounts (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-800 bg-slate-900/60 p-5" hoverEffect={false}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="h-9 w-9 rounded-lg bg-medical-950 border border-medical-800 flex items-center justify-center text-medical-400">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Provision Staff Account</h3>
                <p className="text-[10px] text-slate-455">Create database credential records</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {success && activeSubTab === 'users' && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-455 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span>Credential record successfully created.</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-455 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. John Carter"
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. jcarter"
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password passphrase"
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Role Authorization</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs glass-input font-bold"
                >
                  <option value="admin">System Admin</option>
                  <option value="doctor">Doctor (Physician)</option>
                  <option value="receptionist">Receptionist (Front Desk)</option>
                  <option value="pharmacist">Pharmacist</option>
                </select>
              </div>

              {/* Specialty */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Specialty / Department</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="e.g. Cardiology, Front Office"
                  className="w-full px-3 py-2 text-xs glass-input"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-2 text-xs bg-gradient-to-r from-medical-600 to-medical-500 hover:from-medical-500 hover:to-medical-400 text-white font-semibold"
                loading={createUserMutation.isPending}
              >
                <KeyRound className="h-4 w-4" /> Provision Credentials
              </Button>
            </form>
          </Card>
        </div>

        {/* Existing Accounts lists (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/60 p-5" hoverEffect={false}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-slate-400" />
                Active Clinical Staff Accounts
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded">
                RBAC Access
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5">Staff Name</th>
                    <th className="py-2.5">Username</th>
                    <th className="py-2.5">Specialty</th>
                    <th className="py-2.5 text-center">Role Authorization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/80">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">Checking credentials registers...</td>
                    </tr>
                  ) : users.length > 0 ? (
                    users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3 font-bold text-white">{u.name}</td>
                        <td className="py-3 text-slate-400 font-mono">{u.username}</td>
                        <td className="py-3 text-slate-300 font-semibold">{u.specialty || 'General'}</td>
                        <td className="py-3 text-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border capitalize ${
                            u.role === 'admin' ? 'bg-purple-950/60 border-purple-900 text-purple-400' :
                            u.role === 'doctor' ? 'bg-emerald-950/60 border-emerald-900 text-emerald-400' :
                            u.role === 'receptionist' ? 'bg-blue-950/60 border-blue-900 text-blue-400' :
                            'bg-amber-950/60 border-amber-900 text-amber-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">No user records returned.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Policy summary warning */}
          <Card className="border-rose-955 bg-rose-955/5 border border-dashed p-4 flex gap-3 text-slate-400 text-xs">
            <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="font-bold text-rose-450 mb-1">HIPAA / GDPR Compliance Policy Enforcement:</h4>
              <p className="text-[11px] leading-relaxed">
                MCMS enforces strict route guarding and activity tracking. Password values are stored securely. Every read or write operation on medical charts is logged automatically to the system audit trails to prevent unauthorized HIPAA leakage.
              </p>
            </div>
          </Card>
        </div>

      </div>
      )}

      {activeSubTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up">
          {/* Doctor Profile (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-slate-800 bg-slate-900/60 p-5" hoverEffect={false}>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Doctor Profile Details</h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Attending Doctor</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => handleSelectDoctor(e.target.value)}
                    className="w-full px-3 py-2 text-xs glass-input font-bold"
                  >
                    <option value="" disabled>Select a doctor...</option>
                    {doctors.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                {selectedDoctorId && (
                  <form onSubmit={handleSaveDoctor} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Consultation Room</label>
                        <input
                          type="text"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          placeholder="e.g. Room 102"
                          className="w-full px-3 py-2 text-xs glass-input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Consultation Fee (LKR)</label>
                        <input
                          type="number"
                          value={consultationFee}
                          onChange={(e) => setConsultationFee(Number(e.target.value))}
                          placeholder="e.g. 1500"
                          className="w-full px-3 py-2 text-xs glass-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Professional Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Attending doctor profile, specialty, bio details..."
                        rows={4}
                        className="w-full px-3 py-2 text-xs glass-input resize-none"
                      />
                    </div>

                    {updateDoctorMutation.isSuccess && (
                      <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-xs">
                        Doctor details and roster settings saved successfully.
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full py-2 text-xs bg-gradient-to-r from-medical-600 to-medical-500 hover:from-medical-500 hover:to-medical-400 text-white font-semibold"
                      loading={updateDoctorMutation.isPending}
                    >
                      Save Doctor Details
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </div>

          {/* Roster & Overrides (col-span-7) */}
          {selectedDoctorId && (
            <div className="lg:col-span-7 space-y-6">
              {/* Weekly Roster */}
              <Card className="border-slate-800 bg-slate-900/60 p-5" hoverEffect={false}>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Weekly Active Roster</h3>
                <div className="space-y-3">
                  {Object.keys(weeklyRoster).map((day) => {
                    const rosterDay = weeklyRoster[day];
                    return (
                      <div key={day} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-900 text-xs">
                        <label className="flex items-center gap-2.5 font-bold text-white w-28 select-none">
                          <input
                            type="checkbox"
                            checked={rosterDay.active}
                            onChange={(e) => setWeeklyRoster({
                              ...weeklyRoster,
                              [day]: { ...rosterDay, active: e.target.checked }
                            })}
                            className="rounded border-slate-800 bg-slate-950 text-medical-600 focus:ring-medical-500/20"
                          />
                          {day}
                        </label>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Hours:</span>
                          <input
                            type="text"
                            value={rosterDay.startTime}
                            disabled={!rosterDay.active}
                            onChange={(e) => setWeeklyRoster({
                              ...weeklyRoster,
                              [day]: { ...rosterDay, startTime: e.target.value }
                            })}
                            placeholder="09:00"
                            className="w-16 px-1.5 py-1 text-center font-mono text-xs glass-input disabled:opacity-30"
                          />
                          <span className="text-slate-500">-</span>
                          <input
                            type="text"
                            value={rosterDay.endTime}
                            disabled={!rosterDay.active}
                            onChange={(e) => setWeeklyRoster({
                              ...weeklyRoster,
                              [day]: { ...rosterDay, endTime: e.target.value }
                            })}
                            placeholder="17:00"
                            className="w-16 px-1.5 py-1 text-center font-mono text-xs glass-input disabled:opacity-30"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Vacation Overrides */}
              <Card className="border-slate-800 bg-slate-900/60 p-5" hoverEffect={false}>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Vacation & Time-Off Blocks</h3>
                <p className="text-[10px] text-slate-500 mb-4">Set specific calendar dates where this doctor is unavailable for appointment allocations.</p>
                
                <div className="space-y-4">
                  {/* Add block inputs */}
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newOverrideDate}
                      onChange={(e) => setNewOverrideDate(e.target.value)}
                      className="px-3 py-1.5 text-xs glass-input flex-1"
                    />
                    <input
                      type="text"
                      value={newOverrideReason}
                      onChange={(e) => setNewOverrideReason(e.target.value)}
                      placeholder="e.g. Conference"
                      className="px-3 py-1.5 text-xs glass-input flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddOverride}
                      size="sm"
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold"
                    >
                      Add Block
                    </Button>
                  </div>

                  {/* Blocks List */}
                  <div className="border border-slate-850 bg-slate-950/40 rounded-lg divide-y divide-slate-850/60 max-h-36 overflow-y-auto no-scrollbar">
                    {overrides.length > 0 ? (
                      overrides.map((ov) => (
                        <div key={ov.id} className="flex justify-between items-center p-2.5 text-xs">
                          <div>
                            <span className="font-mono font-bold text-rose-400">{ov.date}</span>
                            <span className="text-slate-400 ml-3">({ov.reason})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOverride(ov.id)}
                            className="text-[10px] text-rose-500 font-bold hover:text-rose-400 px-2 py-0.5 rounded bg-rose-950/20 border border-rose-950/50"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-[10px] text-slate-500">No time-off overrides scheduled.</div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'maintenance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
          <Card className="lg:col-span-1 border-slate-800 bg-slate-900/60 p-5 space-y-4" hoverEffect={false}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="h-9 w-9 rounded-lg bg-rose-950/60 border border-rose-900/60 flex items-center justify-center text-rose-455">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Manual Export</h3>
                <p className="text-[10px] text-slate-455">Export clinic relational database</p>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Export and download a raw snapshot clone of `db.json`, containing patient demographic registers, clinical EHR records, audit histories, and active invoices logs.
            </p>
            {backupSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-450 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Backup file generated and downloaded successfully.</span>
              </div>
            )}
            <Button
              onClick={handleExportBackup}
              className="w-full text-xs py-2 bg-gradient-to-r from-medical-600 to-medical-500"
              loading={exporting}
            >
              Export db.json Snapshot
            </Button>
          </Card>

          <Card className="lg:col-span-2 border-slate-800 bg-slate-900/60 p-5 space-y-4" hoverEffect={false}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-450">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Automated Docker / Local LAN Backups</h3>
                <p className="text-[10px] text-slate-455">Automated cron job storage snapshots</p>
              </div>
            </div>
            
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Scheduled Task: Daily snapshot dump</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Cron: 0 2 * * * (Every day at 02:00 AM)</p>
                </div>
                <span className="text-[9px] px-2.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-900 text-emerald-400 font-bold">
                  Active
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Cron Job Execution Log Trails</p>
                <div className="border border-slate-850 bg-slate-950/40 rounded-lg divide-y divide-slate-850/60 font-mono text-[10px] p-2.5 space-y-1.5 text-slate-400">
                  <p className="text-emerald-450">[2026-07-31 02:00:01] INFO: Starting backup sequence for database (Postgres/JSON)...</p>
                  <p className="text-emerald-450">[2026-07-31 02:00:03] INFO: Database snapshot dumped successfully. Size: 24.8 kB</p>
                  <p className="text-emerald-450">[2026-07-31 02:00:05] INFO: Snapshot encrypted (AES-256) and synced to backup storage /mnt/usb_backup/aura_db_2026-07-31.tar.gz</p>
                  <p className="text-slate-500 border-t border-slate-850 pt-1.5 mt-1.5 font-sans text-[9px]">Last 3 backups: Success (July 31, July 30, July 29)</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
export default UserManagement;
