import React, { useState, useEffect } from 'react';
import { Upload, User as UserIcon, Loader2, X, Camera, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ContentCard from '@/components/ContentCard';
import { base44 } from '@/api/base44Client';
import { User } from '@/entities/User';

export default function ProfileAvatar({ user, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Update preview when user data changes (after parent reloads)
  useEffect(() => {
    if (user?.avatar_url) {
      setPreviewUrl(user.avatar_url);
    }
  }, [user?.avatar_url]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📸 File selected:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setShowSuccess(false);
    
    try {
      // Create local preview immediately for instant feedback
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      console.log('📤 Uploading file to Base44...');
      toast.loading('Uploading your photo...', { id: 'upload' });

      // Upload file to Base44
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResult.file_url;

      console.log('✅ File uploaded:', fileUrl);

      // Update user profile in database
      console.log('💾 Updating user profile...');
      await User.updateMyUserData({ avatar_url: fileUrl });
      
      console.log('✅ User profile updated with avatar');

      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
      
      // Set the actual uploaded URL
      setPreviewUrl(fileUrl);
      
      // Show success state
      setShowSuccess(true);
      toast.success('✨ Profile photo updated successfully!', { id: 'upload' });
      
      // Hide success indicator after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Notify parent to reload user data so everywhere in the app updates
      if (onChange) {
        await onChange();
      }
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error('Failed to upload photo. Please try again.', { id: 'upload' });
      // Revert to original avatar on error
      setPreviewUrl(user?.avatar_url || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      toast.loading('Removing photo...', { id: 'remove' });
      
      await User.updateMyUserData({ avatar_url: null });
      setPreviewUrl(null);
      setShowSuccess(false);
      
      toast.success('✨ Profile photo removed successfully!', { id: 'remove' });
      
      // Notify parent to reload user data
      if (onChange) {
        await onChange();
      }
    } catch (error) {
      console.error('❌ Remove error:', error);
      toast.error('Failed to remove photo', { id: 'remove' });
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    const input = document.getElementById('avatar-upload-input');
    if (input) {
      // Reset the input value so the same file can be selected again
      input.value = '';
      input.click();
    }
  };

  return (
    <ContentCard className="overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Avatar Display */}
        <div className="relative group">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Main Avatar Circle */}
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-violet-200 dark:border-violet-700 shadow-2xl">
              <AnimatePresence mode="wait">
                {previewUrl ? (
                  <motion.img
                    key={previewUrl}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    src={previewUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('❌ Image load error');
                      e.target.onerror = null;
                      setPreviewUrl(null);
                    }}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
                  >
                    <UserIcon className="w-20 h-20 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Upload overlay - shows on hover */}
            {!uploading && (
              <button
                onClick={triggerFileInput}
                className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-10 h-10 text-white mb-2" />
                <span className="text-white text-sm font-semibold">
                  {previewUrl ? 'Change Photo' : 'Upload Photo'}
                </span>
              </button>
            )}
            
            {/* Loading overlay */}
            {uploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center gap-2"
              >
                <Loader2 className="w-10 h-10 text-white animate-spin" />
                <span className="text-white text-sm font-semibold">Uploading...</span>
              </motion.div>
            )}
            
            {/* Remove button - shows on hover when photo exists */}
            {previewUrl && !uploading && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
            
            {/* Success indicator - animated checkmark badge */}
            <AnimatePresence>
              {showSuccess && previewUrl && !uploading && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    rotate: 0,
                    transition: { 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 15 
                    }
                  }}
                  exit={{ 
                    scale: 0, 
                    opacity: 0,
                    transition: { duration: 0.2 }
                  }}
                  className="absolute -bottom-2 -right-2 z-20"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 w-12 h-12 bg-green-400 rounded-full blur-xl animate-pulse" />
                    
                    {/* Badge */}
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-800">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>

                    {/* Sparkles */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.5, 1],
                        opacity: [0, 1, 0],
                        transition: { 
                          duration: 1,
                          times: [0, 0.5, 1],
                          repeat: Infinity,
                          repeatDelay: 0.5
                        }
                      }}
                      className="absolute -top-1 -right-1"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Upload Controls */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Profile Photo
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Upload a profile picture to personalize your Healsy AI account. Choose a clear photo for the best results!
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <Button
              onClick={triggerFileInput}
              disabled={uploading}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {previewUrl ? 'Change Photo' : 'Upload Photo'}
                </>
              )}
            </Button>
            
            {/* Hidden file input */}
            <input
              id="avatar-upload-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            
            {previewUrl && !uploading && (
              <Button
                variant="outline"
                onClick={handleRemovePhoto}
                className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="w-4 h-4 mr-2" />
                Remove Photo
              </Button>
            )}
          </div>
          
          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Profile photo updated successfully!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-4 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
            <p className="text-xs text-violet-800 dark:text-violet-200 font-medium mb-2">
              📸 Photo Guidelines:
            </p>
            <ul className="text-xs text-violet-700 dark:text-violet-300 space-y-1">
              <li>✅ JPG, PNG, GIF, or WebP format</li>
              <li>✅ Maximum file size: 5MB</li>
              <li>✅ Square photos work best</li>
              <li>✅ Good lighting recommended</li>
            </ul>
          </div>
        </div>
      </div>
    </ContentCard>
  );
}