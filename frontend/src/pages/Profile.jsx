import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { userService } from '../services/api';
import { User, Upload, Check, AlertCircle } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    avatarUrl: '',
  });

  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Carregar dados do usuário
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    setFormData({
      name: userData.name || '',
      avatarUrl: userData.avatarUrl || '',
    });
    setLoading(false);
  }, [navigate]);

  // Manipular mudanças no nome
  const handleNameChange = (e) => {
    setFormData({
      ...formData,
      name: e.target.value,
    });
    setError('');
  };

  // Manipular seleção de arquivo
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar se é imagem
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione uma imagem válida');
        return;
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }

      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setError('');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const nameChanged = formData.name.trim() !== (user?.name || '');
    const avatarChanged = selectedFile !== null;

    if (!nameChanged && !avatarChanged) {
      setError('Nenhuma alteração feita. Altere pelo menos um campo.');
      return;
    }

    try {
      setSaving(true);

      // Enviar para API - apenas campos que mudaram
      const nameToSend = nameChanged ? formData.name.trim() : null;
      const avatarToSend = avatarChanged ? selectedFile : null;

      const response = await userService.updateProfile(nameToSend, avatarToSend);

      // Usar dados atualizados da API
      const updatedUser = response.data.user || {
        ...user,
      };
      if (nameChanged) {
        updatedUser.name = formData.name.trim();
      }
      if (!updatedUser.avatarUrl && avatarChanged) {
        // Fallback se a API não retornar o avatar
        updatedUser.avatarUrl = preview;
      }

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      console.log('✅ Perfil atualizado, novo avatarUrl:', updatedUser.avatarUrl);

      // Disparar evento para outras páginas se atualizarem
      window.dispatchEvent(
        new CustomEvent('userProfileUpdated', { detail: updatedUser })
      );

      console.log('📢 Evento userProfileUpdated disparado com:', updatedUser);

      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setFormData({
        name: updatedUser.name || '',
        avatarUrl: updatedUser.avatarUrl || '',
      });

      setSuccess('Perfil atualizado com sucesso!');
      
      // Redirecionar com timestamp para forçar recarregar
      setTimeout(() => {
        navigate(`/dashboard?t=${Date.now()}`);
      }, 1500);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center" data-sidebar-layout>
          <div className="text-center">
            <div className="inline-block p-3 mb-4 bg-zinc-800 rounded-full">
              <User size={32} className="text-orange-500 animate-spin" />
            </div>
            <p className="text-gray-400 text-lg">Carregando perfil...</p>
          </div>
        </main>
      </div>
    );
  }

  const displayAvatar = preview || user?.avatarUrl;

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <main className="flex-1 p-8" data-sidebar-layout>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            Editar <span className="text-orange-500">Perfil</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Atualize suas informações pessoais</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg flex items-center gap-3">
            <Check size={20} className="text-green-400" />
            <p className="text-green-400 font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="max-w-md mx-auto">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                {/* Avatar Preview */}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="relative group"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border-2 border-zinc-700 hover:border-orange-500 transition-colors">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={40} className="text-gray-500" />
                    )}
                  </div>

                  {/* Upload Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={24} className="text-white" />
                  </div>
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Image Info */}
                <p className="text-xs text-gray-500 text-center">
                  Clique para alterar a foto
                </p>

                {/* Remove Image Button */}
                {(selectedFile || displayAvatar) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs px-3 py-1 bg-zinc-800 hover:bg-red-900/50 text-red-400 rounded transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>

              {/* Nome Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.name.length}/50 caracteres
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  saving
                    ? 'bg-zinc-700 cursor-not-allowed text-gray-500'
                    : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-orange-500 rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Salvar alterações
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
            <p className="text-xs text-gray-400">
              💡 <span className="font-semibold">Dica:</span> Você pode usar uma imagem de até 5MB. Formatos aceitos: JPG, PNG, GIF, WebP.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
