import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, X, FileText, Type, Image as ImageIcon, Hash, Plus } from 'lucide-react';

const CreatePost = () => {
  const [formData, setFormData] = useState({ title: '', content: '', newCategory: '' });
  const [categories, setCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]); // array of category _id
  const [file, setFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [{ loading, error }, setStatus] = useState({ loading: false, error: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleTag = (id) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const onFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeImage = () => {
    setFile(null);
    setImagePreviewUrl('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      return setStatus({ loading: false, error: 'Please fill all required fields' });
    }

    setStatus({ loading: true, error: null });

    try {
      let imageUrl = '';
      if (file) {
        const uploadData = new FormData();
        uploadData.append('image', file);
        const uploadRes = await api.post('/upload', uploadData);
        imageUrl = uploadRes.data.image;
      }

      let finalTags = [...selectedTags];

      // Create new category if provided and add it to tags
      if (formData.newCategory.trim()) {
        const catRes = await api.post('/categories', { name: formData.newCategory.trim() });
        if (!finalTags.includes(catRes.data._id)) {
          finalTags.push(catRes.data._id);
        }
      }

      const postData = {
        title: formData.title,
        content: formData.content,
        category: finalTags[0] || null,  // first tag as primary category
        tags: finalTags,
        image: imageUrl || undefined
      };

      await api.post('/posts', postData);
      navigate('/');
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed to create post' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0', backgroundColor: 'transparent' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Main Content */}
        <div style={{ flex: '1 1 700px' }}>
          <div className="card" style={{ padding: '40px' }}>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Create <span style={{ color: 'var(--accent-primary)' }}>Post</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Share your thoughts with the community</p>
            </div>

            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Type size={16} /> Title
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={onChange}
                  placeholder="What's on your mind?"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Hash size={16} /> Interests / Tags
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {selectedTags.length} selected
                  </span>
                </label>

                {/* Tag chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  {categories.map(cat => {
                    const active = selectedTags.includes(cat._id);
                    return (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => toggleTag(cat._id)}
                        style={{
                          padding: '7px 16px',
                          borderRadius: '999px',
                          border: '1.5px solid',
                          borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)',
                          background: active ? 'rgba(59,130,246,0.14)' : 'var(--bg-secondary)',
                          color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          fontWeight: active ? '700' : '500',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          transition: 'all 0.2s ease',
                          boxShadow: active ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none'
                        }}
                      >
                        <Hash size={13} />{cat.name}
                        {active && <X size={12} style={{ marginLeft: '2px' }} />}
                      </button>
                    );
                  })}
                </div>

                {/* New category input */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    name="newCategory"
                    className="form-input"
                    value={formData.newCategory}
                    onChange={onChange}
                    placeholder="+ New interest (e.g. Rust, Gaming...)"
                    style={{ flex: 1 }}
                  />
                  {formData.newCategory.trim() && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      Will be created & added
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={16} /> Image
                </label>
                
                {!imagePreviewUrl ? (
                  <div 
                    onClick={() => document.getElementById('fileInput').click()}
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '40px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'rgba(255,255,255,0.02)'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.05)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                    }}
                  >
                    <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Click to upload or drag and drop</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>JPG, JPEG or PNG</p>
                    <input 
                      id="fileInput"
                      type="file" 
                      hidden 
                      accept="image/*"
                      onChange={onFileChange}
                    />
                  </div>
                ) : (
                  <div style={{ position: 'relative', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={imagePreviewUrl} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                    <button 
                      type="button"
                      onClick={removeImage}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} /> Content
                </label>
                <textarea
                  name="content"
                  className="form-textarea"
                  rows="8"
                  value={formData.content}
                  onChange={onChange}
                  placeholder="Tell us more..."
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                   <small style={{ color: 'var(--text-muted)' }}>{formData.content.length} characters</small>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  borderRadius: 'var(--border-radius-sm)',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '30px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '14px' }}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '14px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;