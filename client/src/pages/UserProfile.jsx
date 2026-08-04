import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { User, Mail, Phone, Camera, Shield, CheckCircle } from 'lucide-react';
import API from '../services/api';

const UserProfile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [uploading, setUploading] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUserProfile({ name, phone });
    addToast('Profile updated successfully!', 'success');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const res = await API.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        updateUserProfile({ avatar: res.data.avatar });
        addToast('Profile photo updated!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Photo upload failed', 'danger');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-6 max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Account Settings & Profile</h1>
            <p className="text-xs text-slate-500">Manage your profile photo, personal information, and credentials</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Avatar Upload Card */}
            <div className="p-6 rounded-3xl glass-panel shadow-sm border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={user?.avatar || '/uploads/avatars/default.png'}
                  alt={user?.name}
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-medical-500/30"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User');
                  }}
                />
                <label className="absolute bottom-0 right-0 p-2 rounded-xl bg-medical-600 hover:bg-medical-700 text-white cursor-pointer shadow-md transition-transform active:scale-95">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white">{user?.name}</h3>
              <span className="px-3 py-0.5 rounded-full bg-medical-100 dark:bg-medical-950 text-medical-700 dark:text-medical-300 font-bold text-xs mt-1">
                {user?.role}
              </span>
              <p className="text-xs text-slate-400 mt-2">{user?.email}</p>
            </div>

            {/* Profile Form */}
            <div className="md:col-span-2 p-6 rounded-3xl glass-panel shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Personal Details</h3>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Contact</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
