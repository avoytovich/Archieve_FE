'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';

import Modal from '@/components/common/Modal'; // Import the reusable Modal
import { useServices } from '@/services';
import { handleError } from '@/utils';

type AddNewGroupProps = {
  groups: string[];
};

const AddNewGroup: React.FC<AddNewGroupProps> = ({ groups }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFile(null);
    setNewGroup('');
  };

  const { uploadDocument } = useServices();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      handleError(new Error('Please select a file to upload'));
      return;
    }
    setLoading(true);
    try {
      const success = await uploadDocument(file, newGroup);
      if (success) {
        toast.success('File uploaded successfully');
        if (newGroup) {
          const updatedQuery = new URLSearchParams({ group: newGroup });
          router.push(`/documents?${updatedQuery.toString()}`);
        }
      }
    } catch (error: unknown) {
      handleError(error, 'Error uploading document');
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGroup(e.target.value);
    setIsTouched(false);
  };

  const isValidNewGroup = isTouched && groups.includes(newGroup);
  const isUploadDisabled = loading || !file || !newGroup || isValidNewGroup;

  // **Custom Children for Modal:**
  const modalContent = (
    <>
      {/* Flex Container for Title and Input */}
      <div className="flex justify-between items-center mt-2 mb-2">
        <h2 className="text-xl font-medium">Add New Group</h2>
        <TextField
          label="Enter New Group"
          variant="outlined"
          size="small"
          required
          value={newGroup}
          onChange={handleChange}
          onBlur={() => setIsTouched(true)}
          error={isValidNewGroup}
          helperText={isValidNewGroup && 'This group already exists'}
        />
      </div>

      {/* File Input */}
      <input
        type="file"
        required
        onChange={handleFileChange}
        className="border rounded mt-4 px-4 py-2 w-full"
      />
    </>
  );

  return (
    <div>
      {/* Trigger Button */}
      <Button variant="contained" color="primary" onClick={handleOpenModal}>
        Add New Group
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        actions={
          <>
            <Button
              onClick={handleCloseModal}
              color="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={isUploadDisabled}
            >
              {loading ? (
                <CircularProgress size={24} color="warning" />
              ) : (
                'Create'
              )}
            </Button>
          </>
        }
      >
        {modalContent}
      </Modal>
    </div>
  );
};

export default AddNewGroup;
