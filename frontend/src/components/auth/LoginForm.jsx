import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const { login, loading, error } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await login(formData);

    if (result.success) {
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } else {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Blue Background */}
      <div className="flex-1 bg-gradient-to-br from-[#030712] to-[#1E3A8A] flex items-center justify-center relative">
        {/* Taglines */}
        <div className="space-y-4 mb-8 text-white px-12 lg:px-16">
          <h2 className="text-2xl font-semibold">
            Selamat Datang di Sistem Realisasi Keuangan
          </h2>
          <p className="text-lg">
            Aplikasi ini digunakan untuk mengelola data realisasi keuangan.
          </p>
        </div>

        {/* Login Form - Positioned slightly to the right */}
        <div className="absolute right-[-250px] bg-white shadow-2xl p-8 w-full max-w-xs">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Selamat Datang
            </h3>
          </div>

          {/* Alert */}
          {showAlert && error && (
            <div className="mb-4">
              <Alert
                type="error"
                message={error}
                onClose={() => setShowAlert(false)}
              />
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              error={errors.username}
              className="text-sm"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              error={errors.password}
              className="text-sm"
              required
            />

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full py-3 text-base"
            >
              {loading ? 'Masuk...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - White Background */}
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-16">
        {/* Logo */}
        <div className="fixed top-8 left-8 flex items-center z-50">
          <div className="mr-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Logo_Kementerian_Koordinator_Bidang_Infrastruktur_dan_Pembangunan_Kewilayahan_Republik_Indonesia_%282024%29.png/330px-Logo_Kementerian_Koordinator_Bidang_Infrastruktur_dan_Pembangunan_Kewilayahan_Republik_Indonesia_%282024%29.png"
              alt="Logo Kementerian"
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};