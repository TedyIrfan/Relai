import React, { useState, useEffect } from 'react';

const Notifikasi = () => {
  const [notifikasi, setNotifikasi] = useState(null);

  useEffect(() => {
    // Fungsi untuk menampilkan notifikasi
    window.tampilkanNotifikasi = (pesan, tipe = 'success') => {
      setNotifikasi({
        pesan,
        tipe,
        id: Date.now()
      });

      // Otomatis hilang setelah 3 detik
      setTimeout(() => {
        setNotifikasi(null);
      }, 3000);
    };
  }, []);

  if (!notifikasi) return null;

  const warnaBackground = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  const warnaText = {
    success: 'text-white',
    error: 'text-white',
    warning: 'text-white',
    info: 'text-white'
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`${warnaBackground[notifikasi.tipe]} ${warnaText[notifikasi.tipe]}
                    px-6 py-4 rounded-lg shadow-lg border border-gray-200
                    flex items-center gap-3 min-w-[300px] max-w-[500px]
                    transform transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center gap-3">
          {/* Icon berdasarkan tipe */}
          {notifikasi.tipe === 'success' && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {notifikasi.tipe === 'error' && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {notifikasi.tipe === 'warning' && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {notifikasi.tipe === 'info' && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}

          <div>
            <p className="font-medium text-sm">
              {notifikasi.pesan}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifikasi;