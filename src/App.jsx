import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { 
  School, Search, ChevronLeft, ArrowRight, 
  User, Phone, Plus, Info, Mail, Save, X, ExternalLink, Edit2, MessageCircle
} from 'lucide-react';

// --- מסך 1: רשימת המוסדות ---
function InstitutionList() {
  const [institutions, setInstitutions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      const { data } = await supabase.from('institutions').select('*').order('name');
      if (data) setInstitutions(data);
    }
    getData();
  }, []);

  const filtered = institutions.filter(inst => 
    inst.name.includes(searchTerm) || inst.id.toString().includes(searchTerm)
  );

  return (
    <div style={{ direction: 'rtl', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#2e7d32', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>מוסדות חינוך שדרות</h1>
      </header>
      <div style={{ padding: '15px', position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 10 }}>
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <Search style={{ position: 'absolute', right: '12px', top: '12px', color: '#888' }} size={18} />
          <input 
            type="text" 
            placeholder="חפש מוסד..."
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '25px', border: '1px solid #ddd' }}
          />
        </div>
      </div>
      <div style={{ padding: '10px', display: 'grid', gap: '12px', maxWidth: '500px', margin: '0 auto' }}>
        {filtered.map((inst) => (
          <div key={inst.id} onClick={() => navigate(`/institution/${inst.id}`)} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <School color="#2e7d32" />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>{inst.name}</h3>
            </div>
            <ChevronLeft color="#ccc" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- מסך 2: דף פרטי המוסד ---
function InstitutionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inst, setInst] = useState(null);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: i } = await supabase.from('institutions').select('*').eq('id', id).single();
      const { data: c } = await supabase.from('contacts').select('*').eq('institution_id', id);
      setInst(i);
      setContacts(c || []);
    }
    fetchData();
  }, [id]);

  if (!inst) return <div style={{textAlign: 'center', padding: '50px'}}>טוען...</div>;

  return (
    <div style={{ direction: 'rtl', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#2e7d32', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ArrowRight onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{inst.name}</h2>
      </header>

      <main style={{ maxWidth: '500px', margin: '0 auto', padding: '15px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 5px 0', color: '#2e7d32' }}>{inst.name}</h3>
          <p style={{ margin: '5px 0' }}><b>כתובת:</b> {inst.address}</p>
          <p style={{ margin: '5px 0' }}><b>רמת חינוך:</b> {inst.education_level}</p>
          <button onClick={() => navigate(`/extra/${id}`)} style={{ backgroundColor: '#e8f5e9', border: 'none', color: '#2e7d32', padding: '10px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', width: '100%', fontWeight: 'bold' }}>
            <Info size={16} /> פרטים נוספים
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4 style={{ margin: 0 }}>אנשי קשר</h4>
          <button onClick={() => navigate(`/edit-contact/new/${id}`)} style={{ color: '#2e7d32', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={18} /> הוספה
          </button>
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          {contacts.map(c => (
            <div key={c.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              
              {/* לחיצה על הטקסט מובילה לעריכה */}
              <div onClick={() => navigate(`/edit-contact/${c.id}/${id}`)} style={{ cursor: 'pointer', flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{c.name}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{c.role}</p>
              </div>

              {/* סמלי פעולה מהירה */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginRight: '10px' }}>
                {c.phone && (
                  <>
                    <a href={`tel:${c.phone}`} style={{ color: '#2e7d32' }}>
                      <Phone size={20} />
                    </a>
                    <a 
                      href={`https://wa.me/972${c.phone.replace(/^0/, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: '#25D366' }}
                    >
                      <MessageCircle size={20} />
                    </a>
                  </>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} style={{ color: '#2e7d32' }}>
                    <Mail size={20} />
                  </a>
                )}
                <Edit2 size={16} color="#ccc" onClick={() => navigate(`/edit-contact/${c.id}/${id}`)} style={{ cursor: 'pointer', marginLeft: '5px' }} />
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// --- מסך 3: דף פרטים נוספים ---
function ExtraDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inst, setInst] = useState(null);

  useEffect(() => {
    async function getInst() {
      const { data } = await supabase.from('institutions').select('*').eq('id', id).single();
      setInst(data);
    }
    getInst();
  }, [id]);

  if (!inst) return null;

  return (
    <div style={{ direction: 'rtl', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#1b5e20', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ArrowRight onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>פרטים מורחבים</h2>
      </header>
      <main style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', display: 'grid', gap: '12px' }}>
          <p><b>טלפון:</b> {inst.phone}</p>
          <p><b>סוג חינוך:</b> {inst.education_type}</p>
          <p><b>סוג פיקוח:</b> {inst.supervision_type}</p>
          <p><b>מעמד משפטי:</b> {inst.legal_status}</p>
          <p><b>יוח"א:</b> {inst.yoha}</p>
          <p><b>רשיון בתוקף:</b> {inst.license_status}</p>
          <p><b>מוטב:</b> {inst.beneficiary}</p>
          
          <a href={inst.link} target="_blank" rel="noreferrer" style={{ backgroundColor: '#2e7d32', color: 'white', textAlign: 'center', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ExternalLink size={18} /> פרטים באולסקול
          </a>
        </div>
      </main>
    </div>
  );
}

// --- מסך 4: דף עריכה/יצירת איש קשר ---
function EditContact() {
  const { contactId, instId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', role: '', phone: '', email: '', detail: '' });

  useEffect(() => {
    if (contactId !== 'new') {
      async function getContact() {
        const { data } = await supabase.from('contacts').select('*').eq('id', contactId).single();
        if (data) setFormData(data);
      }
      getContact();
    }
  }, [contactId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (contactId === 'new') {
      await supabase.from('contacts').insert([{ ...formData, institution_id: instId }]);
    } else {
      await supabase.from('contacts').update(formData).eq('id', contactId);
    }
    navigate(-1);
  };

  return (
    <div style={{ direction: 'rtl', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#2e7d32', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <X onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{contactId === 'new' ? 'איש קשר חדש' : 'עריכת איש קשר'}</h2>
        </div>
        <Save onClick={handleSave} style={{ cursor: 'pointer' }} />
      </header>
      <form onSubmit={handleSave} style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', display: 'grid', gap: '15px' }}>
        <input placeholder="שם" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
        <input placeholder="תפקיד" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
        <input placeholder="טלפון" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
        <input placeholder="מייל" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
        <textarea placeholder="פרטים" value={formData.detail} onChange={e => setFormData({...formData, detail: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px' }} />
        <button type="submit" style={{ backgroundColor: '#2e7d32', color: 'white', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>שמור</button>
      </form>
    </div>
  );
}

// --- ניתוב ראשי ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InstitutionList />} />
        <Route path="/institution/:id" element={<InstitutionDetails />} />
        <Route path="/extra/:id" element={<ExtraDetails />} />
        <Route path="/edit-contact/:contactId/:instId" element={<EditContact />} />
      </Routes>
    </Router>
  );
}

export default App;