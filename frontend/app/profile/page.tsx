'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '../../components/Navbar';

export default function Profile() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [savedUniversities, setSavedUniversities] = useState<any[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: 400, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropWidth: 0, cropHeight: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const cropperRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Force crop area to always be square
  useEffect(() => {
    if (cropArea.width !== cropArea.height) {
      const size = Math.max(cropArea.width, cropArea.height);
      setCropArea(prev => ({ ...prev, width: size, height: size }));
    }
  }, [cropArea.width, cropArea.height]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Load preserved profile data if available
    const preservedProfile = localStorage.getItem('userProfileData');
    if (preservedProfile) {
      const profileData = JSON.parse(preservedProfile);
      setUsername(profileData.name || parsedUser.name || '');
      setProfilePicture(profileData.profilePicture || parsedUser.profilePicture || '');
    } else {
      setUsername(parsedUser.name || '');
      setProfilePicture(parsedUser.profilePicture || '');
    }

    // Load saved universities
    const saved = localStorage.getItem('savedUniversities');
    if (saved) {
      setSavedUniversities(JSON.parse(saved));
    }
  }, [router]);

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: username,
      profilePicture,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('userProfileData', JSON.stringify({
      name: username,
      profilePicture,
    }));
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
        
        // Calculate crop area after image loads
        setTimeout(() => {
          if (cropperRef.current) {
            const rect = cropperRef.current.getBoundingClientRect();
            setImageDisplaySize({ width: rect.width, height: rect.height });
            // Force square crop area - use a fixed square size
            const cropSize = 200; // Fixed 200px square
            setCropArea({
              x: (rect.width - cropSize) / 2,
              y: (rect.height - cropSize) / 2,
              width: cropSize,
              height: cropSize,
            });
          }
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 200;
      canvas.height = 200;
      
      // Use uniform scale factor to prevent distortion
      const scale = img.width / imageDisplaySize.width;
      
      ctx?.drawImage(
        img,
        cropArea.x * scale,
        cropArea.y * scale,
        cropArea.width * scale,
        cropArea.height * scale,
        0,
        0,
        200,
        200
      );
      
      setProfilePicture(canvas.toDataURL('image/jpeg', 0.8));
      setShowCropper(false);
    };
    
    img.src = imageToCrop;
  };

  const handleMouseDown = (e: React.MouseEvent, handle: string = '') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
    
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropWidth: cropArea.width,
      cropHeight: cropArea.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        let newX = dragStart.cropX + deltaX;
        let newY = dragStart.cropY + deltaY;
        
        // Constrain to actual container bounds
        newX = Math.max(0, Math.min(newX, imageDisplaySize.width - cropArea.width));
        newY = Math.max(0, Math.min(newY, imageDisplaySize.height - cropArea.height));
        
        setCropArea(prev => ({ ...prev, x: newX, y: newY }));
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        let newX = dragStart.cropX;
        let newY = dragStart.cropY;
        let newWidth = dragStart.cropWidth;
        let newHeight = dragStart.cropHeight;
        
        const minSize = 50;
        
        // Right handle: dragging right increases width
        if (resizeHandle === 'right') {
          newWidth = Math.max(minSize, Math.min(dragStart.cropWidth + deltaX, imageDisplaySize.width - dragStart.cropX));
          newHeight = newWidth;
        }
        
        // Left handle: dragging left increases width (decreases x)
        if (resizeHandle === 'left') {
          const maxIncrease = dragStart.cropWidth - minSize;
          const widthChange = Math.min(-deltaX, maxIncrease); // Negative delta means dragging left
          newWidth = dragStart.cropWidth + widthChange;
          newHeight = newWidth;
          newX = dragStart.cropX - widthChange;
          
          // Constrain to left boundary
          if (newX < 0) {
            const excess = -newX;
            newX = 0;
            newWidth = Math.max(minSize, newWidth - excess);
            newHeight = newWidth;
          }
        }
        
        // Bottom handle: dragging down increases height
        if (resizeHandle === 'bottom') {
          newHeight = Math.max(minSize, Math.min(dragStart.cropHeight + deltaY, imageDisplaySize.height - dragStart.cropY));
          newWidth = newHeight;
        }
        
        // Top handle: dragging up increases height (decreases y)
        if (resizeHandle === 'top') {
          const maxIncrease = dragStart.cropHeight - minSize;
          const heightChange = Math.min(-deltaY, maxIncrease); // Negative delta means dragging up
          newHeight = dragStart.cropHeight + heightChange;
          newWidth = newHeight;
          newY = dragStart.cropY - heightChange;
          
          // Constrain to top boundary
          if (newY < 0) {
            const excess = -newY;
            newY = 0;
            newHeight = Math.max(minSize, newHeight - excess);
            newWidth = newHeight;
          }
        }
        
        // Corner handles - use the appropriate direction for each axis
        if (resizeHandle === 'bottom-right') {
          const delta = Math.max(deltaX, deltaY);
          newWidth = Math.max(minSize, Math.min(dragStart.cropWidth + delta, imageDisplaySize.width - dragStart.cropX));
          newHeight = newWidth;
        }
        
        if (resizeHandle === 'bottom-left') {
          const widthChange = Math.min(-deltaX, dragStart.cropWidth - minSize);
          const heightChange = Math.min(deltaY, dragStart.cropHeight - minSize);
          const change = Math.max(widthChange, heightChange);
          newWidth = dragStart.cropWidth + change;
          newHeight = newWidth;
          newX = dragStart.cropX - change;
          
          // Constrain to left boundary
          if (newX < 0) {
            const excess = -newX;
            newX = 0;
            newWidth = Math.max(minSize, newWidth - excess);
            newHeight = newWidth;
          }
        }
        
        if (resizeHandle === 'top-right') {
          const widthChange = Math.min(deltaX, dragStart.cropWidth - minSize);
          const heightChange = Math.min(-deltaY, dragStart.cropHeight - minSize);
          const change = Math.max(widthChange, heightChange);
          newHeight = dragStart.cropHeight + change;
          newWidth = newHeight;
          newY = dragStart.cropY - change;
          
          // Constrain to top boundary
          if (newY < 0) {
            const excess = -newY;
            newY = 0;
            newHeight = Math.max(minSize, newHeight - excess);
            newWidth = newHeight;
          }
        }
        
        if (resizeHandle === 'top-left') {
          const widthChange = Math.min(-deltaX, dragStart.cropWidth - minSize);
          const heightChange = Math.min(-deltaY, dragStart.cropHeight - minSize);
          const change = Math.max(widthChange, heightChange);
          newWidth = dragStart.cropWidth + change;
          newHeight = newWidth;
          newX = dragStart.cropX - change;
          newY = dragStart.cropY - change;
          
          // Constrain to left boundary
          if (newX < 0) {
            const excess = -newX;
            newX = 0;
            newWidth = Math.max(minSize, newWidth - excess);
            newHeight = newWidth;
          }
          
          // Constrain to top boundary
          if (newY < 0) {
            const excess = -newY;
            newY = 0;
            newHeight = Math.max(minSize, newHeight - excess);
            newWidth = newHeight;
          }
        }
        
        setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle('');
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, cropArea, imageDisplaySize, resizeHandle]);

  const handleRemoveSaved = (uniId: number) => {
    const updated = savedUniversities.filter(u => u.id !== uniId);
    setSavedUniversities(updated);
    localStorage.setItem('savedUniversities', JSON.stringify(updated));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#E8E8F0] dark:bg-dark-bg relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=1080&fit=crop"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Image Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-6 max-w-4xl w-full">
            <h3 className="text-xl font-bold text-slate-900 dark:text-dark-text mb-4">Crop Your Image</h3>
            <div 
              ref={cropperRef}
              className="relative mx-auto bg-black rounded-lg overflow-hidden"
              style={{ 
                height: '400px',
                width: '400px',
                maxWidth: '400px'
              }}
            >
              <img
                src={imageToCrop}
                alt="Crop preview"
                className="w-full h-full object-contain"
              />
              <div
                className="absolute border-2 border-[#9370DB] dark:border-dark-violet cursor-move"
                style={{
                  left: `${cropArea.x}px`,
                  top: `${cropArea.y}px`,
                  width: `${cropArea.width}px`,
                  height: `${cropArea.height}px`,
                }}
                onMouseDown={(e) => handleMouseDown(e, '')}
              >
                {/* Grid overlay */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/30" />
                  ))}
                </div>
                {/* Corner handles */}
                <div 
                  className="absolute -top-1 -left-1 w-4 h-4 bg-[#9370DB] dark:bg-dark-violet rounded-full cursor-nw-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'top-left')}
                />
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[#9370DB] dark:bg-dark-violet rounded-full cursor-ne-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'top-right')}
                />
                <div 
                  className="absolute -bottom-1 -left-1 w-4 h-4 bg-[#9370DB] dark:bg-dark-violet rounded-full cursor-sw-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
                />
                <div 
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#9370DB] dark:bg-dark-violet rounded-full cursor-se-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
                />
                {/* Edge handles */}
                <div 
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#9370DB] dark:bg-dark-violet rounded-full cursor-n-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'top')}
                />
                <div 
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#9370DB] dark:bg-dark-violet rounded-full cursor-s-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'bottom')}
                />
                <div 
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#9370DB] dark:bg-dark-violet rounded-full cursor-w-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'left')}
                />
                <div 
                  className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#9370DB] dark:bg-dark-violet rounded-full cursor-e-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'right')}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCropComplete}
                className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
              >
                Crop & Save
              </button>
              <button
                onClick={() => setShowCropper(false)}
                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
          )}

          {/* Navigation */}
          <Navbar currentPage="profile" />

      {/* Main Content */}
      <section className="pt-24 pb-12 px-4 max-w-4xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-8">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-6 mb-8">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-full bg-[#E8E8F0] dark:bg-dark-bg-tertiary flex items-center justify-center overflow-hidden border-4 border-[#9370DB] dark:border-dark-violet cursor-pointer"
                onClick={() => {
                  if (isEditing && profilePicture) {
                    setImageToCrop(profilePicture);
                    setCropArea({ x: 100, y: 100, width: 100, height: 100 });
                    setShowCropper(true);
                  }
                }}
              >
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-[#9370DB] dark:text-dark-violet font-bold">
                    {username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {isEditing && (
                <>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#9370DB] dark:bg-dark-violet rounded-full flex items-center justify-center cursor-pointer hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors">
                    <span className="text-white text-xs">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {profilePicture && (
                    <div 
                      className="absolute top-0 right-0 w-6 h-6 bg-[#9370DB] dark:bg-dark-violet rounded-full flex items-center justify-center cursor-pointer hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
                      onClick={() => {
                        setImageToCrop(profilePicture);
                        setCropArea({ x: 100, y: 100, width: 100, height: 100 });
                        setShowCropper(true);
                      }}
                    >
                      <span className="text-white text-xs">✂</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-dark-text-secondary mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-800 dark:text-dark-text"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setUsername(user.name || '');
                        setProfilePicture(user.profilePicture || '');
                      }}
                      className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text mb-1">{username}</h2>
                  <p className="text-slate-600 dark:text-dark-text-secondary mb-4">{user.email}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b-2 border-[#A8A8C8] dark:border-dark-border mb-8"></div>

        {/* Saved Universities */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text mb-4">Saved Universities</h2>
          {savedUniversities.length === 0 ? (
            <p className="text-slate-600 dark:text-dark-text-secondary">No saved universities yet. Click the bookmark icon on universities to save them.</p>
          ) : (
            <div className="grid gap-4">
              {savedUniversities.map((uni) => (
                <div
                  key={uni.id}
                  className="bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-dark-text">{uni.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-dark-text-secondary">{uni.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/university/${uni.name.toLowerCase().replace(/\s+/g, '-')}`)}
                      className="px-3 py-1 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleRemoveSaved(uni.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
