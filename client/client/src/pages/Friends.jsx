import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Loader from '../components/Loader';
import { getAvatarUrl } from '../utils/avatarHelper';
import { Users, UserPlus, UserCheck, UserX, Star, RefreshCw, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Friends = () => {
  const { user, updateUser } = useAuth();
  const { addToast, ToastContainer } = useToast();
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const { t } = useTranslation();

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [profRes, sugRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/users/suggested-friends'),
      ]);
      const fu = profRes.data.user;
      setFriendRequests(fu.friendRequests || []);
      setFriends(fu.friends || []);
      setSuggested(sugRes.data || []);
      updateUser({ friends: fu.friends, friendRequests: fu.friendRequests });
    } catch {
      addToast('Failed to load friends data', 'error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const act = async (id, action) => {
    setBusy(p => ({ ...p, [id]: true }));
    try {
      await api.post(`/users/friend-request/${id}`, { action });
      const msg = { accept: 'Friend added!', send: 'Request sent!', decline: 'Request declined' };
      addToast(msg[action] || 'Done', 'success');
      await fetchAll();
    } catch (e) {
      addToast(e.response?.data?.message || 'Action failed', 'error');
    } finally {
      setBusy(p => ({ ...p, [id]: false }));
    }
  };

  if (!user) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Please <a href="/login" style={{ color: 'var(--accent-primary)' }}>login</a> to view friends.
    </div>
  );
  if (loading) return <Loader />;

  const CardRow = ({ img, name, children }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderRadius:'12px', background:'var(--bg-secondary)', border:'1px solid var(--border-color)', marginBottom:'10px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <img src={img} alt={name} style={{ width:'46px', height:'46px', borderRadius:'50%', objectFit:'cover' }} />
        <div>
          <div style={{ fontWeight:'700', color:'var(--text-primary)', fontSize:'0.9rem' }}>{name}</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>@{name.toLowerCase()}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:'8px' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'40px 20px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize:'2rem', fontWeight:'800', margin:0 }}>{t('friends.title')}{t('friends.titleCol')}</h1>
            <p style={{ color:'var(--text-muted)', margin:0, fontSize:'0.9rem' }}>{friends.length} connection{friends.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', background: 'var(--accent-primary)', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
          <RefreshCw size={15} /> Find Friends
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'24px' }}>
        <div>
          {/* Friend Requests */}
          <div className="card" style={{ padding:'24px', marginBottom:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.2rem' }}>
              <Mail size={18} style={{ color:'var(--accent-primary)' }} />
              <h3 style={{ fontWeight:'700', fontSize:'1rem', margin:0 }}>Friend Requests</h3>
              {friendRequests.length > 0 && <span className="badge">{friendRequests.length}</span>}
            </div>
            {friendRequests.length === 0
              ? <p style={{ color:'var(--text-muted)', textAlign:'center', padding:'1.2rem 0', fontSize:'0.9rem' }}>No pending requests.</p>
              : friendRequests.map(r => (
                <div key={r._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', borderRadius:'12px', background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.18)', marginBottom:'10px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <img src={getAvatarUrl(r.avatar, r.username)} alt={r.username} style={{ width:'48px', height:'48px', borderRadius:'50%', objectFit:'cover', border:'2px solid var(--accent-primary)' }} />
                    <div>
                      <div style={{ fontWeight:'700' }}>{r.username}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>@{r.username.toLowerCase()}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={() => act(r._id,'accept')} disabled={busy[r._id]} style={{ background:'var(--accent-primary)', border:'none', color:'white', cursor:'pointer', padding:'7px 16px', borderRadius:'8px', fontSize:'0.82rem', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px' }}>
                      <UserCheck size={13}/> {busy[r._id]?'...':'Accept'}
                    </button>
                    <button onClick={() => act(r._id,'decline')} disabled={busy[r._id]} style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', color:'var(--text-secondary)', cursor:'pointer', padding:'7px 16px', borderRadius:'8px', fontSize:'0.82rem', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px' }}>
                      <UserX size={13}/> Decline
                    </button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Your Friends */}
          <div className="card" style={{ padding:'24px' }}>
            <h3 style={{ fontWeight:'700', fontSize:'1rem', marginBottom:'1.2rem', display:'flex', alignItems:'center', gap:'8px' }}>
              <Users size={18} style={{ color:'var(--accent-primary)' }}/> Your Friends
            </h3>
            {friends.length === 0
              ? <p style={{ color:'var(--text-muted)', textAlign:'center', padding:'1.2rem 0', fontSize:'0.9rem' }}>No friends yet.</p>
              : friends.map(f => (
                <CardRow key={f._id} img={getAvatarUrl(f.avatar, f.username)} name={f.username}>
                  <span style={{ fontSize:'0.75rem', color:'var(--success)', background:'rgba(16,185,129,0.1)', padding:'4px 10px', borderRadius:'999px', fontWeight:'600' }}>Friends</span>
                </CardRow>
              ))
            }
          </div>
        </div>

        <div>
          {/* Suggested */}
          <div className="card" style={{ padding:'22px', marginBottom:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1.2rem' }}>
              <Star size={16} style={{ color:'#f59e0b' }}/>
              <h3 style={{ fontWeight:'700', fontSize:'1rem', margin:0 }}>Suggested</h3>
            </div>
            {suggested.length === 0
              ? <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', textAlign:'center' }}>No suggestions now.</p>
              : suggested.map(s => (
                <div key={s._id} style={{ marginBottom:'16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                    <img src={getAvatarUrl(s.avatar, s.username)} alt={s.username} style={{ width:'42px', height:'42px', borderRadius:'50%', objectFit:'cover' }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:'700', fontSize:'0.88rem' }}>{s.username}</div>
                      <div style={{ fontSize:'0.73rem', color:'var(--text-muted)' }}>@{s.username.toLowerCase()}</div>
                      {s.bio && <div style={{ fontSize:'0.72rem', color:'var(--accent-primary)', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.bio}</div>}
                    </div>
                  </div>
                  <button onClick={() => act(s._id,'send')} disabled={busy[s._id]} style={{ width:'100%', padding:'7px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-primary)', cursor:'pointer', fontWeight:'600', fontSize:'0.83rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
                    <UserPlus size={13}/> {busy[s._id]?'...':'Add Friend'}
                  </button>
                </div>
              ))
            }
          </div>

          {/* Network Stats */}
          <div className="card" style={{ padding:'22px', background:'linear-gradient(135deg,rgba(59,130,246,0.07),rgba(139,92,246,0.07))', border:'1px solid rgba(59,130,246,0.15)' }}>
            <h3 style={{ fontWeight:'700', fontSize:'1rem', marginBottom:'1rem' }}>Your Network</h3>
            {[
              { icon:<Users size={15}/>, label:'Friends', value:friends.length, color:'var(--accent-primary)' },
              { icon:<Mail size={15}/>, label:'Pending Requests', value:friendRequests.length, color:'#f59e0b' },
              { icon:<Star size={15}/>, label:'Suggested', value:suggested.length, color:'#8b5cf6' },
            ].map((item,i,a) => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom: i<a.length-1?'1px solid var(--border-color)':'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', color:item.color }}>
                  {item.icon}
                  <span style={{ color:'var(--text-secondary)', fontSize:'0.88rem' }}>{item.label}</span>
                </div>
                <span style={{ fontWeight:'700', color:item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
export default Friends;
