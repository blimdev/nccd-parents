import React, { useState } from 'react';
import { css, Global } from '@emotion/react';

// Google Fonts import for Baloo 2
const globalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600&display=swap');
  body {
    font-family: 'Baloo 2', 'Comic Neue', 'Comic Sans MS', cursive, sans-serif;
    background: #fff;
    color: #111;
    margin: 0;
    min-height: 100vh;
  }
`;

const appStyle = css`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
`;

const cardStyle = css`
  background: #fff;
  border-radius: 20px;
  border: 2.5px solid #4f8cff;
  box-shadow: 0 4px 16px rgba(79,140,255,0.07);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  min-width: 340px;
  margin: 1rem;
`;

const titleStyle = css`
  color: #111;
  font-size: 2.2rem;
  margin-bottom: 1.2rem;
  text-align: center;
  font-weight: 600;
`;

const buttonStyle = css`
  background: #2563eb;
  color: #fff;
  border: 3px solid #1d4ed8;
  border-radius: 18px;
  padding: 1.1rem 2.2rem;
  font-size: 1.25rem;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  margin-top: 1.2rem;
  margin-bottom: 1.2rem;
  margin-left: 0;
  margin-right: 0;
  transition: background 0.2s, color 0.2s, border 0.2s, transform 0.15s;
  box-shadow: 0 3px 12px rgba(37,99,235,0.10);
  letter-spacing: 0.03em;
  &:hover {
    background: #1d4ed8;
    border-color: #2563eb;
    color: #fff;
    transform: scale(1.05);
  }
`;

const inputStyle = css`
  width: 100%;
  padding: 0.7rem;
  margin-bottom: 1.2rem;
  border-radius: 10px;
  border: 2px solid #b2ebf2;
  font-size: 1.1rem;
  font-family: inherit;
  color: #111;
  background: #fff;
`;

const tabBarStyle = css`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
`;

const tabStyle = (active: boolean) => css`
  background: #fff;
  color: #111;
  border: 2.5px solid ${active ? '#a259c6' : '#bdbdbd'};
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  padding: 0.7rem 1.5rem;
  font-size: 1.1rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${active ? '0 4px 12px rgba(162,89,198,0.10)' : 'none'};
  transition: border 0.2s, color 0.2s;
`;

const sectionTitle = css`
  color: #111;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 1.2rem 0 0.5rem 0;
`;

const tableStyle = css`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  th, td {
    border: 2px solid #bdbdbd;
    padding: 0.6rem 0.8rem;
    text-align: left;
    font-size: 1rem;
    color: #111;
    background: #fff;
  }
  th {
    background: #f0f8ff;
    color: #111;
    font-weight: 600;
  }
`;

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [kids, setKids] = useState<any[]>([]);
  const [selectedKid, setSelectedKid] = useState<any | null>(null);
  const [loginState, setLoginState] = useState({ username: '', password: '', error: '' });
  const [activeTab, setActiveTab] = useState<'notes' | 'progress' | 'attendance'>('notes');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState(s => ({ ...s, error: '' }));
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginState.username, password: loginState.password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      setToken(data.token);
      setName(data.name);
      fetchKids(data.token);
    } catch (err: any) {
      setLoginState(s => ({ ...s, error: err.message }));
    }
  };

  const fetchKids = async (token: string) => {
    const res = await fetch('http://localhost:5000/api/kids', {
      headers: { Authorization: token }
    });
    if (res.ok) {
      const data = await res.json();
      setKids(data);
    }
  };

  const handleKidClick = async (kid: any) => {
    if (!token) return;
    const res = await fetch(`http://localhost:5000/api/kids/${kid.id}`, {
      headers: { Authorization: token }
    });
    if (res.ok) {
      const data = await res.json();
      setSelectedKid(data);
      setActiveTab('notes');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setName('');
    setKids([]);
    setSelectedKid(null);
    setLoginState({ username: '', password: '', error: '' });
  };

  // Login view
  if (!token) {
    return (
      <>
        <Global styles={globalStyles} />
        <div css={appStyle}>
          <form css={cardStyle} onSubmit={handleLogin}>
            <div css={titleStyle}>Parent Login</div>
            <input
              css={inputStyle}
              type="text"
              placeholder="Username"
              value={loginState.username}
              onChange={e => setLoginState(s => ({ ...s, username: e.target.value }))}
              required
            />
            <input
              css={inputStyle}
              type="password"
              placeholder="Password"
              value={loginState.password}
              onChange={e => setLoginState(s => ({ ...s, password: e.target.value }))}
              required
            />
            {loginState.error && <div style={{ color: 'red', marginBottom: 8 }}>{loginState.error}</div>}
            <button css={buttonStyle} type="submit">Login</button>
          </form>
        </div>
      </>
    );
  }

  // Kid profile view with tabs
  if (selectedKid) {
    // Defensive: ensure arrays exist
    const notes = Array.isArray(selectedKid.notes) ? selectedKid.notes : [];
    const progress = Array.isArray(selectedKid.progress) ? selectedKid.progress : [];
    const attendance = Array.isArray(selectedKid.attendance) ? selectedKid.attendance : [];
    return (
      <>
        <Global styles={globalStyles} />
        <div css={appStyle}>
          <div css={cardStyle}>
            <div css={titleStyle}>{selectedKid.name}'s Profile</div>
            <div style={{ color: '#111', marginBottom: 12 }}>Age: {selectedKid.age}</div>
            <div css={tabBarStyle}>
              <button css={tabStyle(activeTab === 'notes')} onClick={() => setActiveTab('notes')}>Behavioural Notes</button>
              <button css={tabStyle(activeTab === 'progress')} onClick={() => setActiveTab('progress')}>Progress</button>
              <button css={tabStyle(activeTab === 'attendance')} onClick={() => setActiveTab('attendance')}>Attendance</button>
            </div>
            {activeTab === 'notes' && (
              <div>
                <div css={sectionTitle}>Behavioural Notes</div>
                {notes.length === 0 ? (
                  <div>No notes available.</div>
                ) : (
                  <ul>
                    {notes.map((n: any, i: number) => (
                      <li key={i} style={{ marginBottom: 6 }}>{n.date}: {n.note}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {activeTab === 'progress' && (
              <div>
                <div css={sectionTitle}>Progress by Subject & Subcategory</div>
                {progress.length === 0 ? (
                  <div>No progress data available.</div>
                ) : (
                  <div>
                    {Object.entries(progress.reduce((acc: any, p: any) => {
                      if (!acc[p.subject]) acc[p.subject] = [];
                      acc[p.subject].push(p);
                      return acc;
                    }, {})).map(([subject, subs]: [string, any[]]) => (
                      <div key={subject} style={{ marginBottom: 24 }}>
                        <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '1.1rem', marginBottom: 8 }}>{subject}</div>
                        <table css={tableStyle} style={{ marginBottom: 0 }}>
                          <thead>
                            <tr>
                              <th>Subcategory</th>
                              <th>Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subs.map((p, i) => (
                              <tr key={i}>
                                <td>{p.subcategory}</td>
                                <td>{p.score}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'attendance' && (
              <div>
                <div css={sectionTitle}>Attendance</div>
                {attendance.length === 0 ? (
                  <div>No attendance records available.</div>
                ) : (
                  <table css={tableStyle}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((a: any, i: number) => (
                        <tr key={i}>
                          <td>{a.date}</td>
                          <td>{a.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            <button css={buttonStyle} onClick={() => setSelectedKid(null)}>Back to Dashboard</button>
          </div>
          <button css={buttonStyle} onClick={handleLogout}>Logout</button>
        </div>
      </>
    );
  }

  // Dashboard view
  return (
    <>
      <Global styles={globalStyles} />
      <div css={appStyle}>
        <div css={cardStyle}>
          <div css={titleStyle}>Welcome, {name}!</div>
          <h3 style={{ color: '#111', marginBottom: 16 }}>Your Kids</h3>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {kids.map(kid => (
              <li key={kid.id} style={{ marginBottom: 28 }}>
                <button css={buttonStyle} style={{ width: '100%' }} onClick={() => handleKidClick(kid)}>
                  {kid.name} (Age {kid.age})
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button css={buttonStyle} onClick={handleLogout}>Logout</button>
      </div>
    </>
  );
}

export default App; 