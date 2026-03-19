import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Plus, Search, Trash2, Edit2, Save, X, ChevronRight, BookOpen, Clock, Tag, MoreVertical, LayoutGrid, List, Filter, Share2, Download, FileText, FolderPlus, Star, Archive, Loader2, ChevronLeft } from 'lucide-react-native';
import { Note, Folder } from '../types';
import { getNotes, saveNote, deleteNote, getFolders, saveFolder, deleteFolder } from '../services/storage';
import Markdown from 'react-native-markdown-display';

interface NotesProps {
  onBack?: () => void;
}

export const Notes: React.FC<NotesProps> = ({ onBack }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editFolder, setEditFolder] = useState<string | undefined>(undefined);
  const [editTags, setEditTags] = useState<string>('');

  // Folder Creation State
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setNotes(await getNotes());
      setFolders(await getFolders());
    };
    loadData();
  }, []);

  const handleSaveNote = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;

    const note: Note = {
      id: currentNote?.id || Math.random().toString(36).substr(2, 9),
      title: editTitle,
      content: editContent,
      folderId: editFolder,
      tags: editTags.split(',').map(t => t.trim()).filter(t => t !== ''),
      updatedAt: Date.now(),
      createdAt: currentNote?.createdAt || Date.now(),
      isFavorite: currentNote?.isFavorite || false
    };

    await saveNote(note);
    setNotes(await getNotes());
    setIsEditing(false);
    setCurrentNote(null);
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            await deleteNote(id);
            setNotes(await getNotes());
          }
        }
      ]
    );
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const folder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFolderName,
      color: '#0891b2',
      icon: 'folder'
    };
    await saveFolder(folder);
    setFolders(await getFolders());
    setNewFolderName('');
    setShowFolderModal(false);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || note.folderId === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const startEditing = (note?: Note) => {
    if (note) {
      setCurrentNote(note);
      setEditTitle(note.title);
      setEditContent(note.content);
      setEditFolder(note.folderId);
      setEditTags(note.tags.join(', '));
    } else {
      setCurrentNote(null);
      setEditTitle('');
      setEditContent('');
      setEditFolder(selectedFolder || undefined);
      setEditTags('');
    }
    setIsEditing(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Smart Notes</Text>
      </View>
      {!isEditing ? (
        <View style={styles.mainView}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.searchBar}>
              <Search size={18} color="#64748b" />
              <TextInput 
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search notes..."
                placeholderTextColor="#64748b"
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} style={styles.iconBtn}>
              {viewMode === 'grid' ? <List size={20} color="#94a3b8" /> : <LayoutGrid size={20} color="#94a3b8" />}
            </TouchableOpacity>
          </View>

          {/* Folders Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.folderScroll}>
            <TouchableOpacity 
              onPress={() => setSelectedFolder(null)}
              style={[styles.folderChip, !selectedFolder && styles.activeFolderChip]}
            >
              <Text style={[styles.folderChipText, !selectedFolder && styles.activeFolderChipText]}>All Notes</Text>
            </TouchableOpacity>
            {folders.map(folder => (
              <TouchableOpacity 
                key={folder.id}
                onPress={() => setSelectedFolder(folder.id)}
                style={[styles.folderChip, selectedFolder === folder.id && styles.activeFolderChip]}
              >
                <Text style={[styles.folderChipText, selectedFolder === folder.id && styles.activeFolderChipText]}>{folder.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowFolderModal(true)} style={styles.addFolderBtn}>
              <FolderPlus size={16} color="#0891b2" />
            </TouchableOpacity>
          </ScrollView>

          {/* Notes List */}
          <ScrollView contentContainerStyle={styles.notesContainer} showsVerticalScrollIndicator={false}>
            <View style={viewMode === 'grid' ? styles.notesGrid : styles.notesList}>
              {filteredNotes.map(note => (
                <TouchableOpacity 
                  key={note.id} 
                  onPress={() => startEditing(note)}
                  style={[styles.noteCard, viewMode === 'list' && styles.noteCardList]}
                >
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
                    {note.isFavorite && <Star size={12} color="#eab308" fill="#eab308" />}
                  </View>
                  <Text style={styles.notePreview} numberOfLines={viewMode === 'grid' ? 4 : 2}>
                    {note.content.replace(/[#*`]/g, '')}
                  </Text>
                  <View style={styles.noteFooter}>
                    <View style={styles.noteMeta}>
                      <Clock size={10} color="#64748b" />
                      <Text style={styles.noteDate}>{new Date(note.updatedAt).toLocaleDateString()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            {filteredNotes.length === 0 && (
              <View style={styles.emptyState}>
                <FileText size={48} color="#1e293b" />
                <Text style={styles.emptyText}>No notes found</Text>
              </View>
            )}
          </ScrollView>

          {/* Floating Action Button */}
          <TouchableOpacity onPress={() => startEditing()} style={styles.fab}>
            <Plus size={28} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.editorView}>
          {/* Editor Header */}
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.editorBackBtn}>
              <X size={24} color="#94a3b8" />
            </TouchableOpacity>
            <View style={styles.editorActions}>
              <TouchableOpacity onPress={handleSaveNote} style={styles.saveBtn}>
                <Save size={20} color="white" />
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.editorScroll} showsVerticalScrollIndicator={false}>
            <TextInput 
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Note Title"
              placeholderTextColor="#475569"
              style={styles.titleInput}
            />
            
            <View style={styles.metaInputs}>
              <View style={styles.metaInputGroup}>
                <Tag size={14} color="#64748b" />
                <TextInput 
                  value={editTags}
                  onChangeText={setEditTags}
                  placeholder="Tags (comma separated)"
                  placeholderTextColor="#475569"
                  style={styles.metaInput}
                />
              </View>
            </View>

            <TextInput 
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Start writing..."
              placeholderTextColor="#475569"
              multiline
              style={styles.contentInput}
            />
          </ScrollView>
        </View>
      )}

      {/* Folder Modal */}
      <Modal visible={showFolderModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Folder</Text>
            <TextInput 
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Folder name..."
              placeholderTextColor="#64748b"
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowFolderModal(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateFolder} style={styles.modalCreate}>
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1221',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0b1221',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  mainView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
  },
  iconBtn: {
    padding: 10,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  folderScroll: {
    flexGrow: 0,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  folderChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  activeFolderChip: {
    backgroundColor: '#0891b2',
  },
  folderChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  activeFolderChipText: {
    color: 'white',
  },
  addFolderBtn: {
    padding: 8,
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  notesList: {
    flexDirection: 'column',
    gap: 12,
  },
  noteCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  noteCardList: {
    width: '100%',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f1f5f9',
    flex: 1,
    marginRight: 8,
  },
  notePreview: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 16,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteDate: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    opacity: 0.5,
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0891b2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  editorView: {
    flex: 1,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  editorBackBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
  },
  editorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0891b2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  editorScroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  metaInputs: {
    marginBottom: 24,
  },
  metaInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaInput: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 12,
  },
  contentInput: {
    fontSize: 16,
    color: '#f1f5f9',
    lineHeight: 24,
    minHeight: 400,
    textAlignVertical: 'top',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 32,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  modalCreate: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#0891b2',
    alignItems: 'center',
  },
  modalCreateText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
