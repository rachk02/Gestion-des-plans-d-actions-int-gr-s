import React, { useState, useEffect } from 'react';
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
  Bell
} from 'lucide-react';
import './App.css';

// Auth Context
const AuthContext = React.createContext();

// Axios configuration
axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

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

function Header({ user, onLogout, toggleSidebar }) {
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
        <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent border-none outline-none text-sm"
          />
        </div>
        
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
    storageUsed: '0 MB',
    recentActivity: []
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Cloud className="h-6 w-6 text-nextcloud-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
              <p className="text-gray-600">Fichiers</p>
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
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-gray-600">Utilisateur actif</p>
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
              <StickyNote className="h-6 w-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium">Nouvelle note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Files() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);

  const loadFiles = async (path = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/files?path=${path}`);
      setFiles(response.data.files);
      setCurrentPath(response.data.path);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPath);

    try {
      await axios.post('/api/files/upload', formData);
      loadFiles(currentPath);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Fichiers</h2>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="btn-primary cursor-pointer flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Télécharger</span>
          </label>
        </div>
      </div>

      {currentPath && (
        <div className="mb-4">
          <nav className="text-sm text-gray-600">
            <button
              onClick={() => loadFiles('')}
              className="hover:text-nextcloud-blue"
            >
              Accueil
            </button>
            {currentPath.split('/').filter(Boolean).map((part, index, array) => (
              <span key={index}>
                <span className="mx-2">/</span>
                <button
                  onClick={() => loadFiles(array.slice(0, index + 1).join('/'))}
                  className="hover:text-nextcloud-blue"
                >
                  {part}
                </button>
              </span>
            ))}
          </nav>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextcloud-blue mx-auto"></div>
          <p className="text-gray-600 mt-2">Chargement...</p>
        </div>
      ) : (
        <div className="card">
          {files.length === 0 ? (
            <div className="text-center py-8">
              <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun fichier dans ce dossier</p>
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
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {file.type === 'folder' ? (
                            <Cloud className="h-5 w-5 text-blue-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-500" />
                          )}
                          <button
                            onClick={() => file.type === 'folder' && loadFiles(file.path)}
                            className={`font-medium ${
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
                        {file.type === 'file' ? `${(file.size / 1024).toFixed(1)} KB` : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(file.modified_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
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

function MainContent({ activeApp }) {
  switch (activeApp) {
    case 'dashboard':
      return <Dashboard />;
    case 'files':
      return <Files />;
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
        />
        
        <div className="flex">
          <Sidebar 
            activeApp={activeApp} 
            setActiveApp={setActiveApp}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          
          <main className="flex-1 lg:ml-64">
            <MainContent activeApp={activeApp} />
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}

export default App;