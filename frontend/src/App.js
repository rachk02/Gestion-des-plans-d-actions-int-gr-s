import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Cloud, 
  Calendar, 
  Users, 
  StickyNote, 
  Image, 
  FileText, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Home,
  Upload,
  Search,
  Bell,
  FolderPlus,
  Download,
  Trash2,
  Edit3,
  Copy,
  Move,
  MoreVertical,
  Eye,
  Grid,
  List,
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  File,
  Folder,
  Play,
  Music,
  Archive,
  RefreshCw,
  CheckSquare,
  Square
} from 'lucide-react';
import './App.css';

// Auth Context
const AuthContext = React.createContext();

// Axios configuration
axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

// File type icons mapping
const getFileIcon = (fileType, extension) => {
  switch (fileType) {
    case 'folder':
      return Folder;
    case 'image':
      return Image;
    case 'text':
      return FileText;
    case 'document':
      return FileText;
    case 'video':
      return Play;
    case 'audio':
      return Music;
    case 'archive':
      return Archive;
    default:
      return File;
  }
};

// Components
function LoginForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(endpoint, formData);
      
      localStorage.setItem('token', response.data.access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      onLogin();
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Cloud className="mx-auto h-16 w-16 text-nextcloud-blue mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Nextcloud Clone</h1>
          <p className="text-gray-600 mt-2">Votre plateforme de collaboration</p>
        </div>

        <div className="card">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-l-lg ${
                isLogin ? 'bg-nextcloud-blue text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-r-lg ${
                !isLogin ? 'bg-nextcloud-blue text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required={!isLogin}
                  className="input-field"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Header({ user, onLogout, toggleSidebar, onGlobalSearch }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onGlobalSearch(searchQuery);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex items-center space-x-2">
          <Cloud className="h-8 w-8 text-nextcloud-blue" />
          <h1 className="text-xl font-bold text-gray-900">Nextcloud</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm"
          />
        </form>
        
        <button className="p-2 rounded-lg hover:bg-gray-100 relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ activeApp, setActiveApp, sidebarOpen, setSidebarOpen }) {
  const apps = [
    { id: 'dashboard', name: 'Tableau de bord', icon: Home },
    { id: 'files', name: 'Fichiers', icon: Cloud },
    { id: 'calendar', name: 'Calendrier', icon: Calendar },
    { id: 'contacts', name: 'Contacts', icon: Users },
    { id: 'notes', name: 'Notes', icon: StickyNote },
    { id: 'gallery', name: 'Galerie', icon: Image },
    { id: 'text', name: 'Éditeur de texte', icon: FileText },
    { id: 'settings', name: 'Paramètres', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-16 h-full w-64 bg-sidebar-bg border-r transform transition-transform duration-200 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="p-4">
          <nav className="space-y-2">
            {apps.map((app) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    setActiveApp(app.id);
                    setSidebarOpen(false);
                  }}
                  className={`sidebar-item w-full ${
                    activeApp === app.id ? 'active' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{app.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
    storageUsed: '0 MB',
    recentActivity: []
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/files');
      setStats({
        totalFiles: response.data.total_files || 0,
        totalFolders: response.data.total_folders || 0,
        storageUsed: '0 MB', // Calculate from file sizes
        recentActivity: []
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <File className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
              <p className="text-gray-600">Fichiers</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Folder className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFolders}</p>
              <p className="text-gray-600">Dossiers</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.storageUsed}</p>
              <p className="text-gray-600">Stockage utilisé</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Cloud className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Connexion réussie</p>
                <p className="text-xs text-gray-500">Il y a quelques instants</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Raccourcis</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <Upload className="h-6 w-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium">Télécharger</span>
            </button>
            <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <FolderPlus className="h-6 w-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium">Nouveau dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal Components
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function ContextMenu({ isOpen, x, y, onClose, items }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div 
        className="fixed z-50 bg-white rounded-lg shadow-lg border py-2 min-w-48"
        style={{ left: x, top: y }}
      >
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function FilePreviewModal({ isOpen, onClose, file }) {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && file && file.can_preview) {
      loadPreview();
    }
  }, [isOpen, file]);

  const loadPreview = async () => {
    setLoading(true);
    try {
      if (file.type === 'text') {
        const response = await axios.get(`/api/files/preview?path=${file.path}`);
        setPreviewData(response.data);
      } else if (file.type === 'image') {
        setPreviewData({ type: 'image', url: `/api/files/preview?path=${file.path}` });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la prévisualisation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{file.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 max-h-96 overflow-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextcloud-blue mx-auto"></div>
              <p className="text-gray-600 mt-2">Chargement...</p>
            </div>
          ) : previewData ? (
            previewData.type === 'text' ? (
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {previewData.content}
              </pre>
            ) : previewData.type === 'image' ? (
              <img 
                src={axios.defaults.baseURL + previewData.url} 
                alt={file.name}
                className="max-w-full h-auto mx-auto"
              />
            ) : null
          ) : (
            <p className="text-gray-600 text-center py-8">
              Impossible de prévisualiser ce fichier
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Files() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals and context menu state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, file: null });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [newFolderName, setNewFolderName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [renameFile, setRenameFile] = useState(null);

  const fileInputRef = useRef(null);

  const loadFiles = useCallback(async (path = '', search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        path,
        search,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      
      const response = await axios.get(`/api/files?${params}`);
      setFiles(response.data.files);
      setCurrentPath(response.data.path);
      setSelectedFiles(new Set());
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    loadFiles(currentPath, searchQuery);
  }, [loadFiles, currentPath, searchQuery]);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', currentPath);

      try {
        await axios.post('/api/files/upload', formData);
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
      }
    }
    
    loadFiles(currentPath);
    event.target.value = '';
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await axios.post('/api/files/folder', {
        path: currentPath,
        name: newFolderName
      });
      
      setNewFolderName('');
      setShowCreateFolder(false);
      loadFiles(currentPath);
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
    }
  };

  const handleRename = async () => {
    if (!renameValue.trim() || !renameFile) return;

    try {
      await axios.put('/api/files/rename', {
        path: renameFile.path,
        new_name: renameValue
      });
      
      setRenameValue('');
      setRenameFile(null);
      setShowRename(false);
      loadFiles(currentPath);
    } catch (error) {
      console.error('Erreur lors du renommage:', error);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await axios.get(`/api/files/download?path=${file.path}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${file.name}" ?`)) return;

    try {
      await axios.delete(`/api/files?path=${file.path}`);
      loadFiles(currentPath);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      file
    });
  };

  const contextMenuItems = [
    {
      icon: Eye,
      label: 'Preview',
      onClick: () => {
        if (contextMenu.file.can_preview) {
          setPreviewModal({ isOpen: true, file: contextMenu.file });
        }
      }
    },
    {
      icon: Download,
      label: 'Télécharger',
      onClick: () => handleDownload(contextMenu.file)
    },
    {
      icon: Edit3,
      label: 'Renommer',
      onClick: () => {
        setRenameFile(contextMenu.file);
        setRenameValue(contextMenu.file.name);
        setShowRename(true);
      }
    },
    {
      icon: Trash2,
      label: 'Supprimer',
      onClick: () => handleDelete(contextMenu.file)
    }
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Fichiers</h2>
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => setShowCreateFolder(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Nouveau dossier</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Télécharger</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-1 text-sm text-gray-600">
            <button
              onClick={() => loadFiles('')}
              className="hover:text-nextcloud-blue"
            >
              Accueil
            </button>
            {breadcrumbs.map((part, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="h-4 w-4" />
                <button
                  onClick={() => loadFiles(breadcrumbs.slice(0, index + 1).join('/'))}
                  className="hover:text-nextcloud-blue"
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nextcloud-blue focus:border-transparent"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex border rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-nextcloud-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-nextcloud-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nextcloud-blue"
            >
              <option value="name">Nom</option>
              <option value="size">Taille</option>
              <option value="modified">Modifié</option>
              <option value="type">Type</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </button>
          </div>

          <button
            onClick={() => loadFiles(currentPath, searchQuery)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextcloud-blue mx-auto"></div>
          <p className="text-gray-600 mt-2">Chargement...</p>
        </div>
      ) : (
        <div className="card">
          {files.length === 0 ? (
            <div className="text-center py-12">
              <Cloud className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery ? 'Aucun résultat trouvé' : 'Aucun fichier dans ce dossier'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file) => {
                const IconComponent = getFileIcon(file.type, file.extension);
                return (
                  <div
                    key={file.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => file.type === 'folder' && loadFiles(file.path)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                  >
                    <div className="text-center">
                      <IconComponent className={`h-8 w-8 mx-auto mb-2 ${
                        file.type === 'folder' ? 'text-blue-500' : 
                        file.type === 'image' ? 'text-green-500' :
                        file.type === 'text' ? 'text-purple-500' :
                        'text-gray-500'
                      }`} />
                      <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                        {file.name}
                      </p>
                      {file.type !== 'folder' && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(file.size)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nom</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Taille</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Modifié</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => {
                    const IconComponent = getFileIcon(file.type, file.extension);
                    return (
                      <tr 
                        key={file.id} 
                        className="border-b hover:bg-gray-50"
                        onContextMenu={(e) => handleContextMenu(e, file)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <IconComponent className={`h-5 w-5 ${
                              file.type === 'folder' ? 'text-blue-500' : 
                              file.type === 'image' ? 'text-green-500' :
                              file.type === 'text' ? 'text-purple-500' :
                              'text-gray-500'
                            }`} />
                            <button
                              onClick={() => file.type === 'folder' && loadFiles(file.path)}
                              className={`font-medium text-left ${
                                file.type === 'folder' 
                                  ? 'text-nextcloud-blue hover:underline' 
                                  : 'text-gray-900'
                              }`}
                            >
                              {file.name}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 capitalize">{file.type}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {file.type !== 'folder' ? formatFileSize(file.size) : '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(file.modified_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {file.can_preview && (
                              <button
                                onClick={() => setPreviewModal({ isOpen: true, file })}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Prévisualiser"
                              >
                                <Eye className="h-4 w-4 text-gray-600" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDownload(file)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Télécharger"
                            >
                              <Download className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={(e) => handleContextMenu(e, file)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        title="Créer un nouveau dossier"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom du dossier"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="input-field"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateFolder(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateFolder}
              className="btn-primary"
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRename}
        onClose={() => setShowRename(false)}
        title="Renommer"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="input-field"
            onKeyPress={(e) => e.key === 'Enter' && handleRename()}
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowRename(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              onClick={handleRename}
              className="btn-primary"
            >
              Renommer
            </button>
          </div>
        </div>
      </Modal>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        items={contextMenuItems}
      />

      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, file: null })}
        file={previewModal.file}
      />
    </div>
  );
}

function AppPlaceholder({ title, icon: Icon, description }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="card text-center py-12">
        <Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
        <button className="btn-primary mt-4">
          Bientôt disponible
        </button>
      </div>
    </div>
  );
}

function MainContent({ activeApp, onGlobalSearch }) {
  switch (activeApp) {
    case 'dashboard':
      return <Dashboard />;
    case 'files':
      return <Files onGlobalSearch={onGlobalSearch} />;
    case 'calendar':
      return <AppPlaceholder 
        title="Calendrier" 
        icon={Calendar} 
        description="Gérez vos événements et rendez-vous" 
      />;
    case 'contacts':
      return <AppPlaceholder 
        title="Contacts" 
        icon={Users} 
        description="Organisez votre carnet d'adresses" 
      />;
    case 'notes':
      return <AppPlaceholder 
        title="Notes" 
        icon={StickyNote} 
        description="Prenez des notes et organisez vos idées" 
      />;
    case 'gallery':
      return <AppPlaceholder 
        title="Galerie" 
        icon={Image} 
        description="Visualisez et organisez vos photos" 
      />;
    case 'text':
      return <AppPlaceholder 
        title="Éditeur de texte" 
        icon={FileText} 
        description="Créez et éditez vos documents" 
      />;
    case 'settings':
      return <AppPlaceholder 
        title="Paramètres" 
        icon={Settings} 
        description="Configurez votre espace de travail" 
      />;
    default:
      return <Dashboard />;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchUser();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    setActiveApp('dashboard');
  };

  const handleGlobalSearch = (query) => {
    setActiveApp('files');
    // The Files component will handle the search
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextcloud-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated }}>
      <div className="min-h-screen bg-gray-50">
        <Header 
          user={user} 
          onLogout={handleLogout} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onGlobalSearch={handleGlobalSearch}
        />
        
        <div className="flex">
          <Sidebar 
            activeApp={activeApp} 
            setActiveApp={setActiveApp}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          
          <main className="flex-1 lg:ml-64">
            <MainContent activeApp={activeApp} onGlobalSearch={handleGlobalSearch} />
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}

export default App;