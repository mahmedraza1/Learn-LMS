import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdAdd, MdSearch } from "react-icons/md";
import toast from "react-hot-toast";
import GroupCard from '../components/GroupCard';
import GroupForm from '../components/GroupForm';
import { 
  fetchGroups, 
  addGroup, 
  updateGroup, 
  deleteGroup, 
  setSearchTerm,
  selectFilteredGroups,
  selectGroupsLoading,
  selectGroupsError,
  selectSearchTerm
} from '../store/slices/groupsSlice';
import { selectIsAdmin, selectUser } from '../store/slices/authSlice';

const Groups = () => {
  const dispatch = useDispatch();
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectUser);
  const groups = useSelector(selectFilteredGroups);
  const loading = useSelector(selectGroupsLoading);
  const error = useSelector(selectGroupsError);
  const searchTerm = useSelector(selectSearchTerm);

  const [groupForm, setGroupForm] = useState({
    isOpen: false,
    group: null
  });

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle add new group
  const handleAddGroup = () => {
    setGroupForm({
      isOpen: true,
      group: null
    });
  };

  // Handle edit group
  const handleEditGroup = (group) => {
    setGroupForm({
      isOpen: true,
      group
    });
  };

  // Handle delete group
  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      try {
        await dispatch(deleteGroup(groupId)).unwrap();
        toast.success('Group deleted successfully');
      } catch (error) {
        toast.error(error || 'Failed to delete group');
      }
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      const groupData = {
        ...formData,
        createdBy: 'Learn.pk',
        updatedBy: 'Learn.pk'
      };

      if (groupForm.group) {
        // Update existing group
        await dispatch(updateGroup({ 
          id: groupForm.group.id, 
          groupData 
        })).unwrap();
        toast.success('Group updated successfully');
      } else {
        // Add new group
        await dispatch(addGroup(groupData)).unwrap();
        toast.success('Group added successfully');
      }
    } catch (error) {
      toast.error(error || 'Failed to save group');
      throw error; // Re-throw to prevent form from closing
    }
  };

  // Handle join group
  const handleJoinGroup = (group) => {
    toast.success(`Joining ${group.name}...`);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Learning Groups</h1>
              <p className="mt-1 text-sm sm:text-base lg:text-lg text-gray-600">
                Connect with mentors and fellow learners, ask questions, and grow within a supportive network.
              </p>
            </div>
            {isAdmin && (
              <div className="flex-shrink-0">
                <button
                  onClick={handleAddGroup}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  <MdAdd className="w-4 h-4 sm:w-5 sm:h-5" />
                  Add Group
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 animate-pulse">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <MdSearch className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'No study groups have been created yet'
              }
            </p>
            {isAdmin && !searchTerm && (
              <button
                onClick={handleAddGroup}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                Create First Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                isAdmin={isAdmin}
                onEdit={handleEditGroup}
                onDelete={handleDeleteGroup}
                onJoin={handleJoinGroup}
              />
            ))}
          </div>
        )}
      </div>

      {/* Group Form Modal */}
      <GroupForm
        isOpen={groupForm.isOpen}
        onClose={() => setGroupForm({ isOpen: false, group: null })}
        onSubmit={handleFormSubmit}
        group={groupForm.group}
        loading={loading}
      />
    </div>
  );
};

export default Groups;