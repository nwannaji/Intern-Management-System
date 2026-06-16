import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ bio: '', linkedin_url: '', github_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfileDetails();
        setProfileData(response.data);
        setFormData({
          bio: response.data.bio || '',
          linkedin_url: response.data.linkedin_url || '',
          github_url: response.data.github_url || '',
        });
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfileDetails(formData);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>

        {/* User Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Profile Details</h3>
            <button onClick={() => setEditing(!editing)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input type="url" value={formData.linkedin_url} onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input type="url" value={formData.github_url} onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <button type="submit" disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Bio</p>
                <p className="text-gray-900">{profileData?.bio || 'No bio set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                <p className="text-blue-600">{profileData?.linkedin_url || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">GitHub</p>
                <p className="text-blue-600">{profileData?.github_url || 'Not set'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;